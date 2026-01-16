import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { FigmaUrlInfo } from './types/figma-types';
import { ProjectWorkspace } from './utils/workspace';
import type { FrameStructNode, GlobalFigmaInfo } from './types';

export const GraphStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    urlInfo: Annotation<FigmaUrlInfo>(),
    workspace: Annotation<ProjectWorkspace>(),
    figmaInfo: Annotation<GlobalFigmaInfo>(),
    protocol: Annotation<FrameStructNode | undefined>(),
});

export type GraphState = typeof GraphStateAnnotation.State;
