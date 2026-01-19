/**
 * Judger Agent: Layout error diagnosis specialist.
 *
 * Simplified actor-critic pattern with JSON output via post-processor.
 * Uses evoltjs Agent class for tool execution and Vision API support.
 */

import { Agent, FunctionCallingStore, SystemToolStore } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { HistoryTool } from '../../tools/history-tool';
import { HierarchyTool } from '../../tools/hierarchy-tool';
import type { ComponentHistory, JudgerDiagnosis } from './types';
import type { Dict } from '../../nodes/validation/utils/general/tree-traversal';
import { JUDGER_PROMPT } from './system-prompt';
import { getModelConfig } from '../../utils/config';
export { formatJudgerInstruction } from './judger-instruction';

/**
 * Default model configuration for judger agent
 */
const JUDGER_CONTEXT_WINDOW_TOKENS = 1280000;

/**
 * Extract JSON diagnosis from agent response.
 *
 * @param response - Agent response text
 * @returns Parsed JudgerDiagnosis object
 */
export function parseDiagnosisJson(response: string): Promise<JudgerDiagnosis> {
    // Extract content from <TaskCompletion> tags
    const taskMatch = response.match(/<TaskCompletion>([\s\S]*?)<\/TaskCompletion>/);
    const taskContent = taskMatch?.[1] ?? response;

    // Extract JSON from markdown code block
    const jsonMatch = taskContent.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch?.[1] ?? taskContent;

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
function updateToolContext(
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

/**
 * Create judger agent (critic) with JSON output.
 *
 * @param options - Configuration options
 * @param options.workspaceDir - Optional workspace directory to restrict file access
 * @param options.structureTree - Component hierarchy tree
 * @param options.componentPaths - Mapping from component_id to filesystem path
 * @param options.history - Component history from previous iterations
 * @returns Agent configured with FileEditor, ThinkTool, HierarchyTool, HistoryTool, and JSON post-processor
 */
export function createJudgerAgent(options: {
    workspaceDir?: string;
    structureTree?: Dict;
    componentPaths?: Record<string, string>;
    history?: ComponentHistory;
}): Agent {
    const { workspaceDir, structureTree, componentPaths, history } = options;

    let systemPrompt = JUDGER_PROMPT;
    if (workspaceDir) {
        systemPrompt += `\n\nWORKSPACE: ${workspaceDir}\nOnly access files within this workspace.`;
    }

    // System tools (string-based, globally registered)
    const systemTools: string[] = ['FileEditor.read', 'FileEditor.find', 'ThinkTool.execute'];

    // Update HierarchyTool instance context if structure provided
    // Tools are already registered via @tools decorator - just update execute methods
    if (structureTree) {
        const hierarchyTool = new HierarchyTool();
        hierarchyTool.setContext(structureTree, componentPaths || {});

        const hierarchyToolNames = updateToolContext(
            hierarchyTool as unknown as Record<string, (...args: unknown[]) => Promise<string>>,
            'HierarchyTool',
            ['lookup', 'getSiblings', 'getSharedInstances']
        );
        systemTools.push(...hierarchyToolNames);
    }

    // Update HistoryTool instance context if history provided
    // Tools are already registered via @tools decorator - just update execute methods
    if (history) {
        const historyTool = new HistoryTool();
        historyTool.setContext(history);

        const historyToolNames = updateToolContext(
            historyTool as unknown as Record<string, (...args: unknown[]) => Promise<string>>,
            'HistoryTool',
            ['getComponentHistory', 'getIterationSummary']
        );
        systemTools.push(...historyToolNames);
    }

    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: JUDGER_CONTEXT_WINDOW_TOKENS,
    };

    return new Agent({
        name: 'JudgerAgent',
        profile: 'Layout diagnosis specialist',
        system: systemPrompt,
        tools: systemTools,
        modelConfig,
        postProcessor: parseDiagnosisJson,
        verbose: 1,
    });
}
