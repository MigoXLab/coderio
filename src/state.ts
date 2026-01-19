import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import type { FigmaFrameInfo, FigmaUrlInfo } from './types/figma-types';
import type { FrameStructNode, GlobalFigmaInfo } from './types';
import { WorkspaceStructure } from './types/workspace-types';

export const GraphStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    urlInfo: Annotation<FigmaUrlInfo>(),
    workspace: Annotation<WorkspaceStructure>(),
    figmaInfo: Annotation<GlobalFigmaInfo>(),
    protocol: Annotation<FrameStructNode | undefined>(),
    processedFigma: Annotation<FigmaFrameInfo | undefined>(),
    validationSatisfied: Annotation<boolean | undefined>(),
    validationReportDir: Annotation<string | undefined>(),
    validationReportHtmlPath: Annotation<string | undefined>(),
});

export type GraphState = typeof GraphStateAnnotation.State;
