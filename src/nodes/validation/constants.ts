/**
 * Validation node-specific configuration constants.
 * These are static values specific to the validation orchestration logic.
 * Not global - scoped to validation node only.
 */

/**
 * Target MAE (Mean Absolute Error) in pixels.
 *
 * Maximum acceptable average position error across all elements.
 */
export const TARGET_MAE = 3;

/**
 * Position error threshold in pixels.
 *
 * - Elements with error <= this value are classified as "accurate"
 * - Elements with error > this value are classified as "misaligned"
 */
export const POSITION_THRESHOLD = 1.0;

/**
 * Default timeout for browser operations in milliseconds.
 *
 * Used by Playwright for page navigation and rendering.
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Number of decimal places for rounding metric values.
 */
export const METRIC_DECIMAL_PLACES = 2;

/**
 * Default viewport size for browser rendering.
 */
export const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

/**
 * Maximum number of validation-correction iterations for the judger-refiner loop.
 */
export const MAX_ITERATIONS = 3;

/**
 * Run browser in headless mode.
 */
export const HEADLESS = true;

/**
 * Timeout for optional selector waiting in milliseconds (5 seconds)
 */
export const SELECTOR_WAIT_TIMEOUT = 5000;

/**
 * Default validation loop configuration.
 *
 * Used when no custom config is provided to validationLoop().
 */
export const DEFAULT_VALIDATION_LOOP_CONFIG = {
    maxIterations: MAX_ITERATIONS,
    targetMae: TARGET_MAE,
    positionThreshold: POSITION_THRESHOLD,
    browserTimeout: DEFAULT_TIMEOUT,
    defaultViewportWidth: DEFAULT_VIEWPORT.width,
    defaultViewportHeight: DEFAULT_VIEWPORT.height,
    headless: HEADLESS,
};

/**
 * Dev server constants used by validation/launch tooling.
 */
export const DEFAULT_PORT = 5173;

/**
 * Builds the default dev server URL from a port number.
 */
export function buildDevServerUrl(port: number): string {
    return `http://localhost:${port}`;
}
