import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import type { FigmaUrlInfo } from './types/figma-types';
import type { Protocol, GlobalFigmaInfo, ValidationConfig } from './types';
import { WorkspaceStructure } from './types/workspace-types';

export const GraphStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    urlInfo: Annotation<FigmaUrlInfo>(),
    workspace: Annotation<WorkspaceStructure>(),
    figmaInfo: Annotation<GlobalFigmaInfo>(),
    protocol: Annotation<Protocol | undefined>(),
    config: Annotation<ValidationConfig>(),
});

export type GraphState = typeof GraphStateAnnotation.State;
