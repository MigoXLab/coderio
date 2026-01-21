/**
 * Types for ReportTool.
 *
 * Kept in a standalone module to keep `index.ts` focused on implementation.
 */

import type { ElementMetadataRegistry, UserReport, ValidationContext } from '../../types/validation-types';
import type { FrameStructNode } from '../../types/figma-types';

export interface FinalReportRequest {
    protocol: FrameStructNode;
    serverUrl: string;
    figmaThumbnailUrl: string;
    outputDir: string;
    designOffset: { x: number; y: number };
    finalMae: number;
    finalSae: number;
    positionThreshold: number;
    validationContext: ValidationContext;
    elementRegistry: ElementMetadataRegistry;
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
