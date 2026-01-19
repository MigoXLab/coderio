/**
 * Types for ReportTool.
 *
 * Kept in a standalone module to keep `index.ts` focused on implementation.
 */

import type { UserReport } from '../../nodes/validation/types';
import type { ElementRegistry } from '../../nodes/validation/utils/figma/element-registry';
import type { FigmaFrameInfo, FrameStructNode } from '../../types/figma-types';

export interface FinalReportRequest {
    figmaJson: FigmaFrameInfo;
    structureTree: FrameStructNode;
    serverUrl: string;
    figmaThumbnailUrl: string;
    outputDir: string;
    designOffset: { x: number; y: number };
    finalMae: number;
    finalSae: number;
    positionThreshold: number;
    elementToComponentMap?: Map<string, { id: string; name: string; path: string }>;
    elementRegistry: ElementRegistry;
    cachedFigmaThumbnailBase64?: string;
}

export interface FinalReportResult {
    userReport: UserReport;
    misalignedCount: number;
}

export interface ErrorReportOptions {
    serverUrl: string;
    figmaThumbnailUrl?: string;
    mae?: number;
    sae?: number;
}

export interface GenerateHtmlResult {
    success: boolean;
    htmlPath?: string;
    error?: string;
}
