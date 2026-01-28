/**
 * Types for ReportTool.
 *
 * Kept in a standalone module to keep `index.ts` focused on implementation.
 */

import type { MisalignedComponent, UserReport } from '../../types/validation-types';

/**
 * Validation result data structure.
 * Contains all validation metrics and component data needed for reporting.
 */
export interface ValidationResult {
    mae: number;
    sae: number;
    misalignedComponents: MisalignedComponent[];
    viewport: { width: number; height: number };
    screenshots?: {
        renderSnap: string; // Plain browser screenshot (base64 data URI)
    };
}

/**
 * Request to generate validation report from pre-computed validation results.
 * This interface expects validation to have already been performed.
 */
export interface ReportGenerationRequest {
    // Pre-computed validation results (NO re-validation)
    validationResult: ValidationResult;

    // Visual comparison targets
    figmaThumbnailUrl: string;
    cachedFigmaThumbnailBase64?: string;
    designOffset: { x: number; y: number };

    // Output configuration
    outputDir: string;
    serverUrl: string;

    // Saved screenshot paths from last validation iteration
    savedRenderMarkedPath: string;
    savedTargetMarkedPath: string;
}

export interface ReportGenerationResult {
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
