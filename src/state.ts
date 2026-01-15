import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { WorkspaceStructure } from './types/workspace-types';
import { FigmaFrameInfo, FrameStructNodeV2 } from './types/code-types';

/**
 * The root state annotation for the LangGraph.
 * This defines the shape and reducer logic for the graph state.
 */
export const GraphStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    workspace: Annotation<WorkspaceStructure>(),
    pageStructure: Annotation<FrameStructNodeV2>(),
    processedFigma: Annotation<FigmaFrameInfo>(),
});

/**
 * Type definition for the graph state.
 */
export type GraphState = typeof GraphStateAnnotation.State;
