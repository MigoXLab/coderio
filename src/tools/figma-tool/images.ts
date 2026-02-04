import { FigmaColorObject, FigmaFrameInfo, FigmaImageFormat, FigmaPositionAndSize } from '../../types/figma-types';
import { ImageNode } from './types';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { promisePool } from '../../utils/promise-pool';
import { fetchFigmaImages } from './figma';
import { DEFAULT_DOWNLOAD_CONCURRENCY, DOWNLOAD_TIMEOUT_MS, MAX_DOWNLOAD_RETRIES, BASE_RETRY_DELAY_MS } from './constants';
import { logger } from '../../utils/logger';

/**
 * Fetch images from figma document
 * @param nodes - Image nodes
 * @param fileId - Figma file ID
 * @param token - Figma API token
 * @returns Image nodes
 */
export const fetchImages = async (nodes: ImageNode[], fileId: string, token: string): Promise<ImageNode[]> => {
    if (!fileId || !nodes?.length) {
        return [];
    }

    const svgs = nodes.filter(node => node.format === FigmaImageFormat.SVG);
    const pngs = nodes.filter(node => node.format === FigmaImageFormat.PNG);
    const getImagePromises: Promise<{ [key: string]: string } | undefined>[] = [];

    if (svgs.length > 0) {
        getImagePromises.push(fetchFigmaImages(fileId, svgs.map(node => node.id).join(','), token, FigmaImageFormat.SVG));
    }
    if (pngs.length > 0) {
        getImagePromises.push(fetchFigmaImages(fileId, pngs.map(node => node.id).join(','), token, FigmaImageFormat.PNG));
    }

    const images: ImageNode[] = [];
    const results = await Promise.all(getImagePromises);
    results.forEach((res: { [key: string]: string } | undefined) => {
        if (res) {
            for (const [key, value] of Object.entries(res)) {
                images.push({
                    id: key,
                    name: '',
                    format: FigmaImageFormat.PNG,
                    ...(nodes.find(n => n.id === key) || {}),
                    url: value || '',
                });
            }
        }
    });

    return images;
};

/**
 * Download images from figma document
 * @param images - Image nodes
 * @param imageDir - Output directory path
 * @param concurrency - Concurrency level
 * @returns Download results
 */
export const executeDownloadImages = async (
    images: ImageNode[],
    imageDir?: string,
    concurrency: number = DEFAULT_DOWNLOAD_CONCURRENCY
): Promise<{ successCount: number; failCount: number; imageNodesMap: Map<string, ImageNode> }> => {
    if (!images || !images.length || !imageDir) {
        return {
            successCount: 0,
            failCount: 0,
            imageNodesMap: new Map(),
        };
    }

    // Process all images with dynamic concurrency control using promisePool
    const results = await promisePool(images, image => createDownloadTask(image, imageDir), concurrency);

    // Aggregate log after completion
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    // Convert results array to Map with id as key
    const imageNodesMap = new Map<string, ImageNode>(results.map(img => [img.id, img]));

    return {
        successCount,
        failCount,
        imageNodesMap,
    };
};

/**
 * Find image nodes in figma document
 * @param nodes - Figma nodes
 * @param absoluteBoundingBox - Absolute bounding box of the document
 * @returns Image nodes
 */
export const findImageNodes = (nodes: FigmaFrameInfo[], absoluteBoundingBox?: FigmaPositionAndSize): ImageNode[] => {
    const imageNodes: ImageNode[] = [];
    if (!nodes || !Array.isArray(nodes)) {
        return imageNodes;
    }

    for (const node of nodes) {
        if (node.visible === false) {
            continue;
        }
        // Rule 1: If node type is VECTOR, directly add to imageNodeIds
        else if (node.type === 'VECTOR') {
            imageNodes.push(assignImageObject(node, exportSvgIfNeeded(node, absoluteBoundingBox)));
        }
        // Rule 2: If node type is IMAGE or has imageRef, directly add to imageNodeIds
        else if (isImageNode(node) || isImageNodeViaName(node)) {
            if (isImageNode(node) || hasAnyImageNodeInDescendants(node)) {
                imageNodes.push(assignImageObject(node, FigmaImageFormat.PNG));
            } else {
                imageNodes.push(assignImageObject(node, exportSvgIfNeeded(node, absoluteBoundingBox)));
            }
        } else if (isMaskNode(node)) {
            imageNodes.push(assignImageObject(node, FigmaImageFormat.PNG));
        }
        // Rule 3: For nodes with children, check if any leaf descendant is a TEXT node with characters
        else if (node.children && node.children.length > 0) {
            const hasAnyTextNode = hasAnyTextNodeWithCharacters(node);

            if (hasAnyTextNode) {
                const firstLevelChildrenHasImageNode = node.children.some((child: FigmaFrameInfo) => isImageNode(child));
                const firstLevelChildrenHasTextNode = node.children.some((child: FigmaFrameInfo) => isTextNode(child));
                if (firstLevelChildrenHasImageNode && !firstLevelChildrenHasTextNode) {
                    imageNodes.push(assignImageObject(node, FigmaImageFormat.PNG));
                } else {
                    const childImageIds = findImageNodes(node.children, absoluteBoundingBox);
                    imageNodes.push(...childImageIds);
                }
            } else if (hasAnyImageNodeInDescendants(node)) {
                imageNodes.push(assignImageObject(node, FigmaImageFormat.PNG));
            } else {
                imageNodes.push(assignImageObject(node, exportSvgIfNeeded(node, absoluteBoundingBox)));
            }
        }
    }

    return imageNodes;
};

/**
 * Determine whether a node should be exported as SVG or PNG
 * @param node - Figma node
 * @param absoluteBoundingBox - Absolute bounding box of the document
 * @returns Figma image format
 */
export const exportSvgIfNeeded = (node: FigmaFrameInfo, absoluteBoundingBox?: FigmaPositionAndSize) => {
    // Rule 1: Check if node is very large (likely a background) -> PNG
    if (node.absoluteBoundingBox && absoluteBoundingBox) {
        const { width, height } = node.absoluteBoundingBox;
        const { width: pageWidth, height: pageHeight } = absoluteBoundingBox;
        if (width >= pageWidth && height >= pageHeight) {
            return FigmaImageFormat.PNG;
        }
    }

    // Rule 2: Check exportSettings for explicit format specification
    if (node.exportSettings && node.exportSettings.length > 0) {
        const format = node.exportSettings[0].format;
        if (format === FigmaImageFormat.PNG) {
            return FigmaImageFormat.PNG;
        }
        if (format === FigmaImageFormat.SVG) {
            return FigmaImageFormat.SVG;
        }
    }

    // Rule 3: Check node name for background keywords -> PNG
    if (node.name.includes('背景') || node.name.toLowerCase().includes('background')) {
        return FigmaImageFormat.PNG;
    }

    // Default: Export as SVG
    return FigmaImageFormat.SVG;
};

/** Assign image object from figma node and format **/
export const assignImageObject = (node: { id: string; name: string }, format: FigmaImageFormat) => {
    return {
        id: node.id,
        name: node.name,
        format,
    };
};

/** Check if node has image ref in fills **/
export const hasImageRefInFills = (node: FigmaFrameInfo): boolean => {
    if (!node || !node.fills || node.fills.length === 0) {
        return false;
    }
    return node.fills.some((fill: FigmaColorObject) => {
        const fillWithImageRef = fill;
        return (fillWithImageRef.imageRef && fillWithImageRef.imageRef !== '') || fillWithImageRef.type === 'IMAGE';
    });
};

/** Check if node is image node **/
export const isImageNode = (node: FigmaFrameInfo): boolean => {
    if (!node) {
        return false;
    }

    if (node.type === 'IMAGE') {
        return true;
    }

    if (node.fills && node.fills.length > 0) {
        return hasImageRefInFills(node);
    }

    return false;
};

/** Check if node is image node via name **/
export const isImageNodeViaName = (node: FigmaFrameInfo): boolean => {
    return (node && node.name.toLowerCase().includes('img')) || node.name.toLowerCase().includes('image');
};

/** Check if node is mask node **/
export const isMaskNode = (node: FigmaFrameInfo): boolean => {
    return node && node.name.toLowerCase().includes('mask');
};

/** Check if node is text node **/
export const isTextNode = (node: FigmaFrameInfo): boolean => {
    return node && node.type === 'TEXT' && node.characters !== undefined && node.characters.trim() !== '';
};

/** Check if node has any image node in descendants **/
export const hasAnyImageNodeInDescendants = (node: FigmaFrameInfo): boolean => {
    if (!node) return false;

    if (!node.children || node.children.length === 0) {
        return isImageNode(node);
    }
    return node.children.some((child: FigmaFrameInfo) => hasAnyImageNodeInDescendants(child));
};

/** Check if node has any text node in descendants **/
export const hasAnyTextNodeWithCharacters = (node: FigmaFrameInfo): boolean => {
    if (!node) return false;

    if (!node.children || node.children.length === 0) {
        return isTextNode(node);
    }
    return node.children.some((child: FigmaFrameInfo) => hasAnyTextNodeWithCharacters(child));
};

/**
 * Download an image from URL and save to local directory
 * @param url - Image URL to download
 * @param filename - Local filename (with extension)
 * @param outputDir - Output directory path
 * @returns Local file path
 */
export async function downloadImage(url: string, filename?: string, imageDir?: string, base64?: boolean): Promise<string> {
    if (!url || (!base64 && (!filename || !imageDir))) {
        return '';
    }

    const maxRetries = MAX_DOWNLOAD_RETRIES;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: DOWNLOAD_TIMEOUT_MS,
            });

            if (base64) {
                return Buffer.from(response.data).toString('base64');
            } else {
                if (!imageDir || !filename) {
                    return '';
                }
                // Create directory if it doesn't exist
                if (!fs.existsSync(imageDir)) {
                    fs.mkdirSync(imageDir, { recursive: true });
                }
                const filepath = path.join(imageDir, filename);
                fs.writeFileSync(filepath, Buffer.from(response.data));
                return filepath;
            }
        } catch (error) {
            lastError = error;
            // Don't wait on the last attempt
            if (attempt < maxRetries) {
                // Wait 1s, 2s, 3s, 4s, 5s
                const delay = BASE_RETRY_DELAY_MS * (attempt + 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Failed to download image from ${url} after ${maxRetries} retries: ${errorMessage}`);
}

/**
 * Create download task for image
 * @param image - Image object
 * @param outputDir - Output directory path
 * @returns Download task object
 */
export const createDownloadTask = async (image: ImageNode, imageDir?: string): Promise<ImageNode> => {
    if (!image.url) {
        return {
            id: image.id,
            name: image.name,
            format: image.format,
            url: image.url,
            remote: image.url,
            success: false,
        };
    }

    const ext = image.format || FigmaImageFormat.PNG;
    // Sanitize filename: remove special characters, replace spaces with dashes
    const sanitizedName = (image.name || image.id).replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const filename = `${sanitizedName}-${image.id.replace(/:/g, '-')}.${ext}`;

    try {
        const localPath = await downloadImage(image.url, filename, imageDir);
        const aliasPath = `@/${localPath.split('src/')?.[1] || ''}`;

        return {
            id: image.id,
            name: image.name,
            format: image.format,
            url: aliasPath,
            remote: image.url,
            success: true,
        };
    } catch {
        logger.printErrorLog(`Failed to download image: ${image.url}`);
        return {
            id: image.id,
            name: image.name,
            format: image.format,
            url: image.url,
            remote: image.url,
            success: false,
        };
    }
};
