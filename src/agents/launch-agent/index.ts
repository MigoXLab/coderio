import { Agent } from 'evoltagent';
import type { ModelConfig } from 'evoltagent';

import { LAUNCH_AGENT_PROMPT } from './system-prompt';
import type { LaunchAgentResult, LaunchStage } from './types';

export type { LaunchAgentResult, LaunchOptions, LaunchResult, LaunchStage } from './types';

const LAUNCH_AGENT_MODEL_CONFIG: ModelConfig = {
    provider: 'openai',
    model: 'gpt-5.2',
    apiKey: process.env.BOYUE_API_KEY || '',
    baseUrl: process.env.BOYUE_API_URL || '',
    contextWindowTokens: 128000,
};

export function parseLaunchAgentResult(response: string): Promise<LaunchAgentResult> {
    const taskMatch = response.match(/<TaskCompletion>([\s\S]*?)<\/TaskCompletion>/);
    const fullResponse = taskMatch?.[1]?.trim() ?? response;

    const lines = fullResponse.split('\n');
    const summary: string[] = [];
    const touchedFiles: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (
            trimmedLine.startsWith('Successfully applied:') ||
            trimmedLine.startsWith('Failed to apply:') ||
            trimmedLine.startsWith('Skipped:')
        ) {
            summary.push(trimmedLine);

            const m = trimmedLine.match(/^(?:Successfully applied|Failed to apply):\s+([^\s]+)\s+-/);
            if (m?.[1]) {
                touchedFiles.push(m[1]);
            }
        }
    }

    const summaryText = summary.join(' ').toLowerCase();
    const successCount = (summaryText.match(/successfully applied:/g) || []).length;
    const failedCount = (summaryText.match(/failed to apply:/g) || []).length;

    return Promise.resolve({
        success: successCount > 0 && failedCount === 0,
        summary: summary.length > 0 ? summary : [fullResponse],
        editsApplied: successCount,
        touchedFiles: Array.from(new Set(touchedFiles)),
        error: failedCount > 0 ? `${failedCount} edit(s) failed` : undefined,
    });
}

export function formatLaunchAgentInstruction(params: {
    repoPath: string;
    stage: LaunchStage;
    primaryFile?: string | null;
    candidateFiles?: string[];
    errorContext: string;
}): string {
    const candidateFiles = Array.isArray(params.candidateFiles) ? params.candidateFiles : [];

    return `WORKSPACE: ${params.repoPath}
STAGE: ${params.stage}
PRIMARY_FILE: ${params.primaryFile ?? ''}
CANDIDATE_FILES:
${candidateFiles.join('\n')}

ERROR_CONTEXT:
${params.errorContext}

TASK:
Resolve the error by editing the minimal set of files needed under WORKSPACE.
Prefer PRIMARY_FILE then CANDIDATE_FILES when choosing where to start.`;
}

export function createLaunchAgent(modelConfig?: Partial<ModelConfig>): Agent {
    return new Agent({
        name: 'LaunchAgent',
        profile: 'Resolve build/runtime failures during project launch',
        system: LAUNCH_AGENT_PROMPT,
        tools: ['FileEditor.read', 'FileEditor.find', 'FileEditor.findAndReplace', 'FileEditor.write', 'ThinkTool.execute'],
        modelConfig: { ...LAUNCH_AGENT_MODEL_CONFIG, ...(modelConfig || {}) },
        postProcessor: parseLaunchAgentResult,
        verbose: 1,
    });
}

