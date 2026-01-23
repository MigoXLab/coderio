/**
 * Judger Agent: Layout error diagnosis specialist.
 *
 * Simplified actor-critic pattern with JSON output via post-processor.
 * Uses evoltjs Agent class for tool execution and Vision API support.
 */

import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { HistoryTool } from '../../tools/history-tool';
import { HierarchyTool } from '../../tools/hierarchy-tool';
import type { ComponentHistory } from '../../types/validation-types';
import type { Dict } from '../../nodes/validation/utils/tree/tree-traversal';
import { JUDGER_PROMPT } from './prompt';
import { getModelConfig } from '../../utils/config';
import { AGENT_CONTEXT_WINDOW_TOKENS, MAX_OUTPUT_TOKENS } from '../../constants';
import { parseJudgerResult, updateToolContext } from './utils';
export { formatJudgerInstruction } from './instruction';

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
            ['lookup', 'getSharedInstances']
        );
        systemTools.push(...hierarchyToolNames);
    }

    // Always register HistoryTool (even with empty history in iteration 1)
    // The tool handles empty history gracefully and the prompt references it
    const historyTool = new HistoryTool();
    historyTool.setContext(history || {});

    const historyToolNames = updateToolContext(
        historyTool as unknown as Record<string, (...args: unknown[]) => Promise<string>>,
        'HistoryTool',
        ['getComponentHistory', 'getIterationSummary']
    );
    systemTools.push(...historyToolNames);

    const modelConfig: ModelConfig = {
        ...getModelConfig(),
        contextWindowTokens: AGENT_CONTEXT_WINDOW_TOKENS,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        stream: true,
    };

    return new Agent({
        name: 'JudgerAgent',
        profile: 'Layout diagnosis specialist',
        system: systemPrompt,
        tools: systemTools,
        modelConfig,
        postProcessor: parseJudgerResult,
        verbose: 2,
    });
}
