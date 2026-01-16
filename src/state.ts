import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { FigmaUrlInfo } from './types/figma-types';
import { ProjectWorkspace } from './utils/workspace';
import type { FrameStructNode } from './types';

export const GraphStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    urlInfo: Annotation<FigmaUrlInfo>(),
    workspace: Annotation<ProjectWorkspace>(),
    thumbnail: Annotation<string>(),
    protocol: Annotation<FrameStructNode | undefined>(),
});

export type GraphState = typeof GraphStateAnnotation.State;
