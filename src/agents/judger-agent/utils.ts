/**
 * Utility functions for Judger Agent.
 */

import { SystemToolStore, FunctionCallingStore } from 'evoltagent';
import type { JudgerDiagnosis } from './types';

/**
 * Extract JSON diagnosis from agent response.
 * @param response - Agent response text (with TaskCompletion tags already stripped)
 * @returns Parsed JudgerDiagnosis object
 */
export function parseJudgerResult(response: string): Promise<JudgerDiagnosis> {
    // Check for empty response (agent may have hit limits or errors)
    if (!response || response.trim().length === 0) {
        throw new Error('Agent returned empty response');
    }

    // Extract JSON from markdown code block
    // The evoltagent library strips <TaskCompletion> tags before calling postProcessor
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
        throw new Error('No JSON code block found in agent response');
    }

    const jsonStr = jsonMatch[1];

    if (!jsonStr || jsonStr.trim().length === 0) {
        throw new Error('Empty JSON content in code block');
    }

    return Promise.resolve(JSON.parse(jsonStr) as JudgerDiagnosis);
}

/**
 * Update tool instance context for already-registered tools.
 *
 * Since tools are registered via @tools decorator at module load time,
 * we only need to update their execute methods to point to instances
 * with the correct per-execution context.
 *
 * @param toolInstance - Tool instance with context set via setContext()
 * @param toolName - Base name for the tool (e.g., "HierarchyTool")
 * @param methodNames - List of method names to update (e.g., ["lookup", "getSiblings"])
 * @returns List of updated tool name strings (e.g., ["HierarchyTool.lookup"])
 */
export function updateToolContext(
    toolInstance: Record<string, (...args: unknown[]) => Promise<string>>,
    toolName: string,
    methodNames: string[]
): string[] {
    const updatedNames: string[] = [];

    for (const methodName of methodNames) {
        const raw = toolInstance[methodName];
        if (!raw) {
            continue;
        }

        const method = raw.bind(toolInstance);
        const fullName = `${toolName}.${methodName}`;

        // Tool should already be registered via @tools decorator - just update execute method
        const systemTool = SystemToolStore.getTool(fullName);
        if (systemTool) {
            systemTool.execute = method;
            updatedNames.push(fullName);
        }

        // Also update FunctionCallingStore
        const functionCallingName = `${toolName}-${methodName}`;
        const userTool = FunctionCallingStore.getTool(functionCallingName);
        if (userTool) {
            userTool.execute = method;
        }
    }

    return updatedNames;
}
