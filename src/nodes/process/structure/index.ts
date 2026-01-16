<<<<<<< HEAD
import type { FigmaFrameInfo } from '../../../types/figma-types';
import type { FrameStructNode } from '../../../types';
=======
import type { FigmaFrameInfo, FrameStructNode } from '../../../types';
>>>>>>> gm/dev
import { callModel } from '../../../utils/call-model';
import { logger } from '../../../utils/logger';
import { generateStructurePrompt } from './prompt';
import { extractJSONFromMarkdown, extractNodePositionsHierarchical, postProcessStructure, populateComponentProps } from './utils';

/**
 * Structure node - generates component hierarchy from Figma design
 *
 * Responsibilities:
 * 1. Analyzes Figma frame structure using AI model
 * 2. Extracts component relationships and data
 * 3. Generates file paths and naming conventions
 * 4. Populates component props and states for code generation
 *
 * @param state - Current graph state containing processedFigma
 * @returns Updated state with protocol
 */
export const generateStructure = async (figma: FigmaFrameInfo) => {
<<<<<<< HEAD
    // Support both frames (from processedFigma) and children (from raw Figma data)
    const frames = figma.frames || figma.children;
    const imageWidth = figma.absoluteBoundingBox?.width;
    const thumbnailUrl = figma.thumbnailUrl;

    if (!frames || frames.length === 0) {
=======
    const frames = figma.children;
    const imageWidth = figma.absoluteBoundingBox?.width;
    const thumbnailUrl = figma.thumbnailUrl;

    if (!frames) {
>>>>>>> gm/dev
        logger.printErrorLog('No processed frames found in state');
        throw new Error('No processed frames found');
    }

    logger.printInfoLog('Starting structure analysis...');

    try {
        // Extract hierarchical position data from Figma frames
        const positions = extractNodePositionsHierarchical(frames);
        const positionsJson = JSON.stringify(positions);

        // Generate structure using AI
        const prompt = generateStructurePrompt({
            positions: positionsJson,
            width: imageWidth ? String(imageWidth) : '1440',
        });

        logger.printInfoLog('Calling AI model to generate component structure...');

        const structureResult = await callModel({
            question: prompt,
            imageUrls: thumbnailUrl,
            responseFormat: { type: 'json_object' },
        });

        // Parse AI response
        const jsonContent = extractJSONFromMarkdown(structureResult);
        const parsedStructure = JSON.parse(jsonContent) as FrameStructNode | FrameStructNode[];

        // Post-process structure: normalize names, populate elements, annotate paths
        logger.printInfoLog('Processing structure tree...');
        postProcessStructure(parsedStructure, frames);

        const protocol = (Array.isArray(parsedStructure) ? parsedStructure[0] : parsedStructure) as FrameStructNode;

        // Extract component props and states for reusable components
        if (frames && protocol) {
            logger.printInfoLog('Extracting component properties and states...');
            await populateComponentProps(protocol, frames, thumbnailUrl);
        }

        logger.printSuccessLog('Component structure generated successfully');

        return {
            protocol,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog(`Error generating component structure: ${errorMessage}`);
        throw new Error(`Failed to parse component structure: ${errorMessage}`);
    }
};
