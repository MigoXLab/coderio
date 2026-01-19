import type { Browser } from 'playwright';
import type { MisalignedComponentData } from '../types';
import { bufferToWebPDataUri } from './image-converter';
import { ANNOTATION_COLORS, createBoxStyle, createCircleLabelStyle, createContainerStyle, createTextLabelStyle } from './annotation-styles';

/**
 * Annotates the Figma thumbnail with GREEN boxes showing target positions.
 * Creates a new browser page, loads the thumbnail as background, injects annotations,
 * captures screenshot, and returns as base64 data URI.
 */
export async function annotateTargetWithPlaywright(
    browser: Browser,
    figmaThumbnailBase64: string,
    misalignedData: MisalignedComponentData[],
    viewport: { width: number; height: number },
    designOffset: { x: number; y: number } = { x: 0, y: 0 },
    isThumbnailCropped: boolean = true
): Promise<string> {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    try {
        const dataUri = figmaThumbnailBase64.startsWith('data:') ? figmaThumbnailBase64 : `data:image/png;base64,${figmaThumbnailBase64}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    * { margin: 0; padding: 0; }
                    body {
                        width: ${viewport.width}px;
                        height: ${viewport.height}px;
                        background-image: url('${dataUri}');
                        background-size: 100% 100%;
                        background-repeat: no-repeat;
                        background-position: top left;
                        position: relative;
                        overflow: hidden;
                    }
                </style>
            </head>
            <body></body>
            </html>
        `;

        await page.setContent(html);
        await page.waitForLoadState('domcontentloaded');

        const offsetX = isThumbnailCropped ? 0 : designOffset.x;
        const offsetY = isThumbnailCropped ? 0 : designOffset.y;

        const elementsData = misalignedData.map((item, i) => ({
            index: i + 1,
            componentName: item.componentName,
            targetX: item.targetX + offsetX,
            targetY: item.targetY + offsetY,
            width: item.targetWidth,
            height: item.targetHeight,
        }));

        type ElementData = {
            index: number;
            componentName: string;
            targetX: number;
            targetY: number;
            width: number;
            height: number;
        };

        const styles = {
            container: createContainerStyle(),
            boxes: Object.fromEntries(
                elementsData.map(item => [
                    item.index,
                    createBoxStyle(item.targetX, item.targetY, item.width, item.height, ANNOTATION_COLORS.GREEN),
                ])
            ),
            circleLabels: Object.fromEntries(
                elementsData.map(item => [item.index, createCircleLabelStyle(item.targetX, item.targetY, ANNOTATION_COLORS.GREEN)])
            ),
            textLabels: Object.fromEntries(
                elementsData.map(item => [
                    item.index,
                    createTextLabelStyle(item.targetX, item.targetY, item.height, ANNOTATION_COLORS.GREEN),
                ])
            ),
        };

        await page.evaluate(
            (data: {
                items: ElementData[];
                styles: {
                    container: string;
                    boxes: Record<number, string>;
                    circleLabels: Record<number, string>;
                    textLabels: Record<number, string>;
                };
            }) => {
                const { items, styles } = data;

                const container = document.createElement('div');
                container.id = 'target-annotations';
                container.style.cssText = styles.container;

                items.forEach((item: ElementData) => {
                    const box = document.createElement('div');
                    const boxStyle = styles.boxes[item.index];
                    if (boxStyle) {
                        box.style.cssText = boxStyle;
                    }
                    container.appendChild(box);

                    const label = document.createElement('div');
                    label.textContent = `${item.index}`;
                    const circleLabelStyle = styles.circleLabels[item.index];
                    if (circleLabelStyle) {
                        label.style.cssText = circleLabelStyle;
                    }
                    container.appendChild(label);

                    const textLabel = document.createElement('div');
                    textLabel.textContent = `${item.componentName}`;
                    const textLabelStyle = styles.textLabels[item.index];
                    if (textLabelStyle) {
                        textLabel.style.cssText = textLabelStyle;
                    }
                    container.appendChild(textLabel);
                });

                document.body.appendChild(container);
            },
            { items: elementsData, styles }
        );

        const screenshotBuffer = await page.screenshot({ type: 'png', fullPage: false });
        return await bufferToWebPDataUri(screenshotBuffer);
    } finally {
        await page.close();
        await context.close();
    }
}
