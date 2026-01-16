import { FigmaUrlInfo } from '../types/figma-types';

/**
 * Parse Figma URL and extract fileId, name, and nodeId in one pass
 * @param url - Figma URL to parse
 * @returns Object containing fileId, name, and nodeId
 * @example
 * parseFigmaUrl('https://www.figma.com/design/aONcu8L82l1PdcT304Q8Za/Intern?node-id=0-495')
 * // Returns: { fileId: 'aONcu8L82l1PdcT304Q8Za', name: 'intern', nodeId: '0-495' }
 */
export const parseFigmaUrl = (url: string): FigmaUrlInfo => {
    let fileId: string | null = null;
    let name = 'untitled';
    let nodeId: string | null = null;

    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.length >= 3) {
            fileId = pathParts[pathParts.length - 2] || null;
            const fileName = pathParts[pathParts.length - 1];
            name = fileName ? encodeURI(fileName).toLowerCase() : 'untitled';
        }

        nodeId = urlObj.searchParams.get('node-id') || null;
        nodeId = nodeId ? nodeId.replace(/-/g, ':') : null;
    } catch {}

    if (!fileId || !nodeId) {
        throw new Error('Invalid Figma URL');
    }

    return { fileId, name, nodeId };
};
