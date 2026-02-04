/**
 * Data structures and schemas for validation system.
 *
 * Node-specific types for the validation pipeline.
 * Shared types (ValidationContext, UserReport, MisalignedComponent, etc.) are in src/types/validation-types.ts
 */

import type { Protocol } from '../../types/protocol-types';
import type {
    ComponentHistoryEntry,
    UserReport,
    ValidationReport,
    ValidationContext,
    ElementMetadataRegistry,
    MisalignedComponent,
    ComponentHistory,
    Dict,
} from '../../types/validation-types';
import type { WorkspaceStructure } from '../../types/workspace-types';
import { ValidationMode } from '../../types/graph-types';

import type { JudgerDiagnosis } from '../../agents/judger-agent/types';
import type { RefinerResult } from '../../agents/refiner-agent/types';
import type { ComponentAggregationData } from '../../tools/position-tool/types';

// ============================================================================
// Validation Node-Specific Types
// ============================================================================

/**
 * Git commit options for commit subnode
 */
export interface GitCommitOptions {
    /**
     * Absolute path to the app directory to commit.
     */
    appPath?: string;

    /**
     * Current iteration number (optional).
     * If provided: generates iteration-based commit message
     * If undefined: treats as initial commit
     */
    iteration?: number;
}

/**
 * Git commit result from commit subnode
 */
export interface GitCommitResult {
    success: boolean;
    message: string;
}

/**
 * Single component's correction log
 * Tracks the diagnosis and fix applied to one component in an iteration
 */
export interface ComponentCorrectionLog {
    elementIds: string[];
    componentId: string;
    componentPath: string;
    validationReport: ValidationReport;
    diagnosis?: JudgerDiagnosis;
    refinerResult?: RefinerResult;
    positionHistory?: ComponentHistoryEntry[];
}

/**
 * Skipped element entry
 * Tracks elements that were skipped during validation
 */
export interface SkippedElement {
    elementId: string;
    reason: 'missing_component_mapping' | 'incomplete_data' | 'no_figma_position';
    details?: string;
}

/**
 * Single iteration log
 * Contains all corrections made in one validation-fix iteration
 */
export interface IterationLog {
    iteration: number;
    metrics: {
        mae: number;
        sae: number;
        misalignedCount: number;
    };
    components: ComponentCorrectionLog[];
    screenshotPath: string;
    skippedElements?: SkippedElement[];
}

/**
 * Complete output schema for processed.json
 * Contains all iteration logs and final result
 */
export interface ProcessedOutput {
    iterations: IterationLog[];
    finalResult: {
        success: boolean;
        finalMae: number;
        finalSae: number;
        totalIterations: number;
        misalignedCount: number; // Number of misaligned components in final result
    };
}

/**
 * Figma layout metadata
 * Layout properties extracted from Figma JSON for agent reasoning
 */
export interface FigmaLayoutMetadata {
    layoutMode: string;
    primaryAxisAlignItems: string;
    counterAxisAlignItems: string;
    itemSpacing: number;
    padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    constraints: Record<string, unknown>;
    absoluteBoundingBox: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    };
}

/**
 * Validation loop parameters
 * Direct parameters passed to validationLoop function (NOT through LangGraph state)
 */
export interface ValidationLoopParams {
    protocol: Protocol;
    serverUrl?: string;
    figmaThumbnailUrl: string;
    outputDir: string;
    workspace: WorkspaceStructure;
    config?: Partial<ValidationLoopConfig>;
}

/**
 * Validation loop configuration
 * Configuration options for the validation loop
 */
export interface ValidationLoopConfig {
    maxIterations: number;
    targetMae: number;
    positionThreshold: number;
    browserTimeout: number;
    defaultViewportWidth: number;
    defaultViewportHeight: number;
    headless: boolean;
    /**
     * Validation execution mode.
     * - reportOnly: run a single validation pass and generate a report (no code edits).
     * - full: run iterative actor-critic refinement loop (may edit code + commit markers).
     */
    mode?: ValidationMode.ReportOnly | ValidationMode.Full;
}

/**
 * Validation loop result
 * Result returned from validationLoop function
 */
export interface ValidationLoopResult {
    reportGenerated: boolean; // Whether a validation report was successfully generated
    validationPassed: boolean; // Whether validation criteria met (MAE threshold + no errors)
    finalMae: number;
    finalSae: number;
    totalIterations: number;
    processedOutput: ProcessedOutput;
    /** Error message if validation failed due to launch/build issues. */
    error?: string;
    userReport: UserReport;
}

/**
 * Validation result returned from runValidation node
 * Used for both graph workflow and standalone CLI invocation
 */
export interface ValidationResult {
    validationPassed: boolean;
    reportDir: string;
    reportHtmlPath: string;
}

/**
 * Component data aggregation for multiple elements.
 */
export interface ComponentData extends ComponentAggregationData {
    componentId: string;
    componentName: string;
    componentPath: string;
    elementIds: string[];
    errors: { x: number; y: number }[];
}

/**
 * Configuration for validation iteration
 */
export interface ValidationIterationConfig {
    serverUrl: string;
    figmaThumbnailUrl: string;
    protocol: Protocol;
    iteration: number;
    positionThreshold: number;
    designOffset: [number, number];
    outputDir: string;
    /** Unified validation context containing all Figma data with normalized positions */
    validationContext: ValidationContext;
    /** Unified element registry containing all element metadata (eliminates tree traversals) */
    elementRegistry: ElementMetadataRegistry;
    /** Pre-cached Figma thumbnail base64 data to avoid redundant downloads. */
    cachedFigmaThumbnailBase64?: string;
    /** Resolved component paths (componentId -> absolute filesystem path) */
    resolvedComponentPaths: Record<string, string>;
}

/**
 * Result from validating positions in a single iteration
 */
export interface ValidationIterationResult {
    mae: number;
    sae: number;
    misalignedComponents: MisalignedComponent[];
    skippedElements: SkippedElement[];
    viewport: { width: number; height: number };
    screenshots?: {
        renderSnap: string; // Plain browser screenshot (base64 data URI)
    };
}

/**
 * Context object for component refinement in validation loop
 */
export interface RefinementContext {
    workspace: WorkspaceStructure;
    structureTree: Dict;
    componentPaths: Record<string, string>;
    componentHistory: ComponentHistory;
    validationContext: ValidationContext;
    previousScreenshotPath?: string;
}

/**
 * Options for report generation
 */
export interface ReportOptions {
    /** Pre-computed final validation result */
    validationResult: ValidationIterationResult;
    /** Figma thumbnail URL for visual comparison */
    figmaThumbnailUrl: string;
    /** Pre-cached Figma thumbnail base64 (avoids redundant downloads) */
    cachedFigmaThumbnailBase64?: string;
    /** Design offset for coordinate normalization */
    designOffset: { x: number; y: number };
    /** Output directory for report files */
    outputDir: string;
    /** Server URL for report metadata */
    serverUrl: string;
    /** Path to saved render_marked screenshot from last validation iteration */
    savedRenderMarkedPath: string;
    /** Path to saved target_marked screenshot from last validation iteration */
    savedTargetMarkedPath: string;
}

/**
 * Result from report generation
 */
export interface ReportResult {
    success: boolean;
    htmlPath?: string;
    userReport: UserReport;
    error?: string;
}
