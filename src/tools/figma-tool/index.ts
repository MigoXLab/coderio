import { tools } from 'evoltagent';
import { checkBorder } from './figma';
import { FigmaFrameInfo } from '../../types/figma-types';
import { ImageNode } from './types';
import { executeDownloadImages, fetchImages, findImageNodes } from './images';
import { cleanFigma, fetchFigmaNode, fetchFigmaImages } from './figma';
import { styleTool } from '../style-tool';

@tools({
    fetchAndClean: {
        description: 'Fetch and clean Figma document from URL',
        params: [
            { name: 'fileId', type: 'string', description: 'Figma file ID' },
            { name: 'nodeId', type: 'string', description: 'Figma node ID' },
            { name: 'token', type: 'string', description: 'Figma API token' },
        ],
        returns: {
            type: 'FigmaFrameInfo',
            description: 'Original Figma document fetched from the URL via official Figma API and cleaned by removing invisible nodes',
        },
    },
    downloadImages: {
        description: 'Detect and download image nodes from figma document',
        params: [
            { name: 'fileId', type: 'string', description: 'Figma file ID' },
            { name: 'token', type: 'string', description: 'Figma API token' },
            { name: 'imageDir', type: 'string', description: 'Output directory path' },
            {
                name: 'document',
                optional: true,
                type: 'FigmaFrameInfo',
                description: 'Figma document which is fetched and cleaned from the URL',
            },
        ],
        returns: {
            type: '{ successCount: number; failCount: number; imageNodesMap: Map<string, ImageNode> }',
            description: 'Download results of images from the Figma document with Map structure',
        },
    },
    simplifyImageNodes: {
        description: 'Simplify image nodes in figma document by replacing redundant properties with url',
        params: [
            { name: 'node', type: 'FigmaFrameInfo', description: 'Figma node' },
            { name: 'imageNodes', type: 'Map<string, ImageNode>', description: 'Image nodes map with id as key' },
        ],
        returns: {
            type: 'FigmaFrameInfo',
            description: 'Figma node with image nodes simplified and replaced with url',
        },
    },
    processedStyle: {
        description: 'Process styles in Figma document',
        params: [{ name: 'node', type: 'FigmaFrameInfo', description: 'Figma node' }],
        returns: {
            type: 'FigmaFrameInfo',
            description: 'Figma node with styles processed',
        },
    },
})
class FigmaTool {
    async fetchAndClean(fileId: string, nodeId: string, token: string): Promise<FigmaFrameInfo | undefined> {
        if (!fileId || !nodeId || !token) {
            return undefined;
        }

        const document = await fetchFigmaNode(fileId, nodeId, token);
        if (!document || !document?.children?.length) {
            throw new Error('Failed to fetch Figma document');
        }

        const images = await fetchFigmaImages(fileId, nodeId, token);
        const thumbnail = images?.[nodeId] || '';
        if (!thumbnail) {
            throw new Error('Failed to fetch Figma document thumbnail');
        }
        document.thumbnailUrl = thumbnail;

        const cleanedDocument = cleanFigma(document);

        return cleanedDocument;
    }

    async downloadImages(
        fileId: string,
        token: string,
        imageDir: string,
        document?: FigmaFrameInfo
    ): Promise<{ successCount: number; failCount: number; imageNodesMap: Map<string, ImageNode> }> {
        if (!fileId) {
            return { successCount: 0, failCount: 0, imageNodesMap: new Map() };
        }

        /* Detect images from the document */
        const imageNodes = findImageNodes(document?.children || [], document?.absoluteBoundingBox);
        const fetchedImages = await fetchImages(imageNodes, fileId, token);
        if (!fetchedImages.length) {
            return { successCount: 0, failCount: 0, imageNodesMap: new Map() };
        }

        return await executeDownloadImages(fetchedImages, imageDir);
    }

    simplifyImageNodes(node: FigmaFrameInfo, imageNodes: Map<string, ImageNode>): FigmaFrameInfo {
        const imageTarget = imageNodes.get(node.id);

        if (imageTarget) {
            const basicInfo: FigmaFrameInfo = {
                id: node.id,
                name: node.name,
                type: 'IMAGE',
                url: imageTarget.url,
                absoluteBoundingBox: node.absoluteBoundingBox,
                absoluteRenderBounds: node.absoluteRenderBounds,
            };

            if (node.cornerRadius) {
                basicInfo.cornerRadius = node.cornerRadius;
            }

            if (checkBorder(node)) {
                basicInfo.strokes = node.strokes;
                basicInfo.strokeWeight = node.strokeWeight;
                basicInfo.strokeAlign = node.strokeAlign;
            }
            return basicInfo;
        }

        const result: FigmaFrameInfo = { ...node };
        if (node.children && Array.isArray(node.children)) {
            result.children = node.children.map(child => this.simplifyImageNodes(child, imageNodes));
        }

        return result;
    }

    processedStyle(node: FigmaFrameInfo): FigmaFrameInfo {
        // Convert current node's styles using style-tool
        const processedNode = styleTool.convert(node);

        // Recursively process children
        if (processedNode.children && Array.isArray(processedNode.children)) {
            processedNode.children = processedNode.children.map(child => this.processedStyle(child));
        }

        return processedNode;
    }
}

export const figmaTool = new FigmaTool();
