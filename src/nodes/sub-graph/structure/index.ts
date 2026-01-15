import type { GraphState } from '../../../state';
import type { FigmaFrameInfo, FrameStructNode } from '../../../types';
import { callModel } from '../../../utils/call-model';
import { logger } from '../../../utils/logger';
import { generateStructurePrompt } from './prompt';
import {
    extractJSONFromMarkdown,
    extractNodePositionsHierarchical,
    normalizeStructureComponentNames,
    populateElementsData,
    annotateStructureWithPath,
    populateComponentProps,
} from './utils';

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
 * @returns Updated state with pageStructure
 */
export const structureNode = async (state: GraphState): Promise<Partial<GraphState>> => {
    const frames = state.processedFigma?.frames as FigmaFrameInfo[] | undefined;
    
    if (!frames) {
        logger.printErrorLog('No processed frames found in state');
        throw new Error('No processed frames found');
    }

    logger.printInfoLog('Starting structure analysis...');

    try {
        // Extract hierarchical position data from Figma frames
        const positions = extractNodePositionsHierarchical(frames);
        const positionsJson = JSON.stringify(positions);
        const imageWidth = state.processedFigma?.absoluteBoundingBox?.width;

        // Generate structure using AI
        const prompt = generateStructurePrompt({
            positions: positionsJson,
            width: imageWidth ? String(imageWidth) : '1440',
        });

        logger.printInfoLog('Calling AI model to generate component structure...');
        
        const structureResult = await callModel({
            question: prompt,
            imageUrls: state.processedFigma?.thumbnailUrl,
            responseFormat: { type: 'json_object' },
        });

        // Parse AI response
        const jsonContent = extractJSONFromMarkdown(structureResult);
        const parsedStructure = JSON.parse(jsonContent) as FrameStructNode | FrameStructNode[];

        // Post-process structure
        logger.printInfoLog('Processing structure tree...');
        normalizeStructureComponentNames(parsedStructure);
        populateElementsData(parsedStructure, frames);
        annotateStructureWithPath(parsedStructure);

        const pageStructure = (Array.isArray(parsedStructure) ? parsedStructure[0] : parsedStructure) as FrameStructNode;

        // Extract component props and states for reusable components
        if (frames && pageStructure) {
            logger.printInfoLog('Extracting component properties and states...');
            await populateComponentProps(pageStructure, frames, state.processedFigma?.thumbnailUrl);
        }

        logger.printSuccessLog('Component structure generated successfully');

        return {
            pageStructure,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.printErrorLog(`Error generating component structure: ${errorMessage}`);
        throw new Error(`Failed to parse component structure: ${errorMessage}`);
    }
};

