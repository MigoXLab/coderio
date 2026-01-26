import * as path from 'node:path';
import { tools } from 'evoltagent';

import type { StartDevServerResult, StopDevServerResult } from './types';
import { DevServerManager } from './utils/dev-server-manager';

/**
 * Generate a stable lookup key for a dev server instance.
 * Port and pid are NOT included because:
 * - They become stale after restart (port may change, pid always changes)
 * - DevServerManager tracks current port/pid in its internal state
 * - serverKey is only used for Map lookup, never parsed
 */
function makeServerKey(repoPath: string): string {
    const safeRepo = repoPath.split(path.sep).join('_');
    return `launch:${safeRepo}:${Date.now()}`;
}

@tools({
    startDevServer: {
        description: 'Start a dev server in-process and wait for it to become reachable.',
        params: [
            { name: 'repoPath', type: 'string', description: 'Absolute path to the repository' },
            { name: 'runCommand', type: 'string', description: 'Run command (e.g. "pnpm dev")' },
            { name: 'timeoutMs', type: 'number', description: 'Timeout in milliseconds', optional: true },
        ],
        returns: { type: 'object', description: 'StartDevServerResult with url/port/pid/serverKey.' },
    },
    stopDevServer: {
        description: 'Stop a previously started dev server by serverKey.',
        params: [{ name: 'serverKey', type: 'string', description: 'Server key returned by startDevServer()' }],
        returns: { type: 'object', description: 'StopDevServerResult' },
    },
})
export class LaunchTool {
    private static readonly serverManagers = new Map<string, { manager: DevServerManager; repoPath: string }>();

    async startDevServer(repoPath: string, runCommand: string, timeoutMs: number = 60_000): Promise<StartDevServerResult> {
        try {
            const manager = new DevServerManager({ repoPath, runCommand: runCommand.trim() });
            const handle = await manager.start({ timeoutMs });
            const serverKey = makeServerKey(repoPath);
            LaunchTool.serverManagers.set(serverKey, { manager, repoPath });
            return {
                success: true,
                serverKey,
                url: handle.url,
                port: handle.port,
                pid: handle.child.pid ?? undefined,
                outputTail: handle.outputTail(),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async stopDevServer(serverKey: string): Promise<StopDevServerResult> {
        const entry = LaunchTool.serverManagers.get(serverKey);
        if (!entry) {
            return { success: false, serverKey, error: `Unknown serverKey: ${serverKey}` };
        }
        try {
            await entry.manager.stop();
            LaunchTool.serverManagers.delete(serverKey);
            return { success: true, serverKey };
        } catch (error) {
            return { success: false, serverKey, error: error instanceof Error ? error.message : String(error) };
        }
    }
}
