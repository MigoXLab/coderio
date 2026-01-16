import { generateCode } from '../nodes/code';
import { FigmaFrameInfo, FrameStructNode } from '../types/figma-types';
import { workspace } from '../utils/workspace';
import pageStructureData from './pageStructure.json';
import processedCssFigmaData from './processedCssFigma.json';

const pageStructure = pageStructureData as unknown as FrameStructNode;
const processedFigma = processedCssFigmaData as unknown as FigmaFrameInfo;

await generateCode({
    workspace: workspace.paths,
    messages: [],
    protocol: pageStructure,
    processedFigma,
});
