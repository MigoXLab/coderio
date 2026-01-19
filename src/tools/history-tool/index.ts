/**
 * Iteration history lookup tool for judger agent.
 *
 * Provides methods to query the history of component positions and fixes
 * across validation iterations.
 */

import { tools } from 'evoltagent';
import type { ComponentHistory, IterationSummaryChange } from './types';

/**
 * Iteration history lookup tool.
 *
 * This tool allows agents to understand the history of component positions
 * and fixes across validation iterations, helping to avoid repeating failed
 * fixes and detecting regressions.
 */
@tools({
    getComponentHistory: {
        description:
            "Get position and fix history for a component. Shows how the component's position and error evolved across iterations, and what fixes were applied. Helps identify if previous fixes helped or hurt",
        params: [{ name: 'componentId', type: 'string', description: 'Component ID to get history for' }],
        returns: { type: 'string', description: 'Formatted string with complete history of positions, errors, and fixes' },
        examples: [
            `<HistoryTool.getComponentHistory>
<componentId>HeroSection</componentId>
</HistoryTool.getComponentHistory>`,
        ],
    },
    getIterationSummary: {
        description:
            'Get summary of what was changed in a specific iteration. Shows all components that were fixed in that iteration and what fixes were applied. Useful for understanding what went wrong in a previous iteration',
        params: [{ name: 'iteration', type: 'number', description: 'Iteration number (1-indexed)' }],
        returns: { type: 'string', description: 'Formatted string with summary of changes in that iteration' },
        examples: [
            `<HistoryTool.getIterationSummary>
<iteration>2</iteration>
</HistoryTool.getIterationSummary>`,
        ],
    },
})
export class HistoryTool {
    private _history: ComponentHistory = {};

    /**
     * Initialize the HistoryTool with empty context.
     */
    constructor() {
        this._history = {};
    }

    /**
     * Initialize with component history from previous iterations.
     *
     * @param history - Dict mapping component_id to list of iteration records
     */
    setContext(history: ComponentHistory): void {
        this._history = history;
    }

    /**
     * Get position and fix history for a component.
     *
     * Shows how the component's position and error evolved across iterations,
     * and what fixes were applied. Helps identify if previous fixes helped or hurt.
     *
     * @param componentId - Component ID to get history for
     * @returns Formatted string with complete history of positions, errors, and fixes
     */
    getComponentHistory(componentId: string): string {
        if (!this._history || Object.keys(this._history).length === 0) {
            return 'No history available (this is iteration 1)';
        }

        if (!(componentId in this._history)) {
            return `No history found for component '${componentId}' (first time misaligned)`;
        }

        const historyEntries = this._history[componentId];
        if (!historyEntries || historyEntries.length === 0) {
            return `Empty history for component '${componentId}'`;
        }

        const lines: string[] = [`History for ${componentId}:`, ''];

        for (let i = 0; i < historyEntries.length; i++) {
            const entry = historyEntries[i];
            if (!entry) continue;
            const iteration = entry.iteration ?? '?';
            const position = entry.position ?? [0, 0];
            const error = entry.error ?? [0, 0];
            const fixApplied = entry.fixApplied ? entry.fixApplied.join('\n    ') : 'None';

            lines.push(`Iteration ${iteration}:`);
            lines.push(`  Position: (${position[0].toFixed(1)}, ${position[1].toFixed(1)}) px`);
            lines.push(`  Error: (${error[0].toFixed(1)}, ${error[1].toFixed(1)}) px`);
            lines.push(`  Fix Applied:\n    ${fixApplied}`);

            if (i > 0) {
                const prevEntry = historyEntries[i - 1];
                if (prevEntry) {
                    const prevErrorMagnitude = prevEntry.error[0] + prevEntry.error[1];
                    const currErrorMagnitude = error[0] + error[1];
                    if (currErrorMagnitude > prevErrorMagnitude) {
                        lines.push(
                            `  Warning: REGRESSION: Error increased from ${prevErrorMagnitude.toFixed(1)}px to ${currErrorMagnitude.toFixed(1)}px`
                        );
                    }
                }
            }

            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * Get summary of what was changed in a specific iteration.
     *
     * Shows all components that were fixed in that iteration and what fixes
     * were applied. Useful for understanding what went wrong in a previous iteration.
     *
     * @param iteration - Iteration number (1-indexed)
     * @returns Formatted string with summary of changes in that iteration
     */
    getIterationSummary(iteration: number): string {
        if (!this._history || Object.keys(this._history).length === 0) {
            return `No history available (iteration ${iteration} has not completed yet)`;
        }

        const changes: IterationSummaryChange[] = [];

        for (const [componentId, entries] of Object.entries(this._history)) {
            for (const entry of entries) {
                if (entry.iteration === iteration) {
                    changes.push({
                        componentId,
                        position: entry.position ?? [0, 0],
                        error: entry.error ?? [0, 0],
                        fixApplied: entry.fixApplied ?? ['None'],
                    });
                    break;
                }
            }
        }

        if (changes.length === 0) {
            return `No changes recorded for iteration ${iteration}`;
        }

        const lines: string[] = [`Iteration ${iteration} Summary:`, `Total components modified: ${changes.length}`, ''];

        for (const change of changes) {
            lines.push(`${change.componentId}:`);
            lines.push(`  Error: (${change.error[0].toFixed(1)}, ${change.error[1].toFixed(1)}) px`);
            lines.push(`  Fix:\n    ${change.fixApplied.join('\n    ')}`);
            lines.push('');
        }

        return lines.join('\n');
    }
}

