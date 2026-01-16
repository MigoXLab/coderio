import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { WorkspaceStructure } from './types/workspace-types';
import type { FrameStructNode } from './types';
import type { FigmaFrameInfo } from './types/figma-types';
/**
 * The root state annotation for the LangGraph.
 * This defines the shape and reducer logic for the graph state.
 */
export const GraphStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    workspace: Annotation<WorkspaceStructure>(),
    processedFigma: Annotation<FigmaFrameInfo>(),
    protocol: Annotation<FrameStructNode | undefined>(),
});

/**
 * Type definition for the graph state.
 */
export type GraphState = typeof GraphStateAnnotation.State;
