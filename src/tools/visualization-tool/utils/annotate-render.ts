import type { Page } from 'playwright';
import type { MisalignedComponentData } from '../types';
import { ANNOTATION_COLORS, createBoxStyle, createCircleLabelStyle, createContainerStyle, createTextLabelStyle } from './annotation-styles';

/**
 * Annotates the rendered page with RED boxes showing current positions.
 * Injects DOM elements via page.evaluate() to mark misaligned component positions.
 */
export async function annotateRenderWithPlaywright(page: Page, misalignedData: MisalignedComponentData[]): Promise<void> {
    await page.evaluate(
        (data: {
            items: MisalignedComponentData[];
            styles: {
                container: string;
                boxes: Record<number, string>;
                circleLabels: Record<number, string>;
                textLabels: Record<number, string>;
            };
        }) => {
            const { items, styles } = data;

            const container = document.createElement('div');
            container.id = 'validation-annotations';
            container.style.cssText = styles.container;

            items.forEach((item: MisalignedComponentData) => {
                // Create RED box at current position with browser dimensions
                const box = document.createElement('div');
                const boxStyle = styles.boxes[item.index];
                if (boxStyle) {
                    box.style.cssText = boxStyle;
                }
                container.appendChild(box);

                // Create numbered circle label
                const label = document.createElement('div');
                label.textContent = `${item.index}`;
                const circleLabelStyle = styles.circleLabels[item.index];
                if (circleLabelStyle) {
                    label.style.cssText = circleLabelStyle;
                }
                container.appendChild(label);

                // Create text label with component name and distance
                const textLabel = document.createElement('div');
                textLabel.textContent = `${item.componentName} (${item.distance.toFixed(1)}px)`;
                const textLabelStyle = styles.textLabels[item.index];
                if (textLabelStyle) {
                    textLabel.style.cssText = textLabelStyle;
                }
                container.appendChild(textLabel);
            });

            document.body.appendChild(container);
        },
        {
            items: misalignedData,
            styles: {
                container: createContainerStyle(),
                boxes: Object.fromEntries(
                    misalignedData.map(item => [
                        item.index,
                        createBoxStyle(item.currentX, item.currentY, item.currentWidth, item.currentHeight, ANNOTATION_COLORS.RED),
                    ])
                ),
                circleLabels: Object.fromEntries(
                    misalignedData.map(item => [item.index, createCircleLabelStyle(item.currentX, item.currentY, ANNOTATION_COLORS.RED)])
                ),
                textLabels: Object.fromEntries(
                    misalignedData.map(item => [
                        item.index,
                        createTextLabelStyle(item.currentX, item.currentY, item.currentHeight, ANNOTATION_COLORS.RED),
                    ])
                ),
            },
        }
    );
}
