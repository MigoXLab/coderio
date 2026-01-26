import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import type { FigmaUrlInfo } from './types/figma-types';
import type { IProtocol, GlobalFigmaInfo, ValidationConfig } from './types';
import { WorkspaceStructure } from './types/workspace-types';

export const GraphStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    urlInfo: Annotation<FigmaUrlInfo>(),
    workspace: Annotation<WorkspaceStructure>(),
    figmaInfo: Annotation<GlobalFigmaInfo>(),
    protocol: Annotation<IProtocol | undefined>(),
    config: Annotation<ValidationConfig>(),
});

export type GraphState = typeof GraphStateAnnotation.State;
