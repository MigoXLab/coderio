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
function makeServerKey(appPath: string): string {
    const safeApp = appPath.split(path.sep).join('_');
    return `launch:${safeApp}:${Date.now()}`;
}

@tools({
    startDevServer: {
        description: 'Start a dev server in-process and wait for it to become reachable.',
        params: [
            { name: 'appPath', type: 'string', description: 'Absolute path to the app directory' },
            { name: 'runCommand', type: 'string', description: 'Run command (e.g. "pnpm dev")' },
            { name: 'timeoutMs', type: 'number', description: 'Timeout in milliseconds', optional: true },
        ],
        returns: { type: 'string', description: 'JSON string containing StartDevServerResult with url/port/pid/serverKey.' },
    },
    stopDevServer: {
        description: 'Stop a previously started dev server by serverKey.',
        params: [{ name: 'serverKey', type: 'string', description: 'Server key returned by startDevServer()' }],
        returns: { type: 'string', description: 'JSON string containing StopDevServerResult' },
    },
})
export class LaunchTool {
    private static readonly serverManagers = new Map<string, { manager: DevServerManager; appPath: string }>();

    async startDevServer(appPath: string, runCommand: string, timeoutMs: number = 60_000): Promise<string> {
        try {
            const manager = new DevServerManager({ appPath, runCommand: runCommand.trim() });
            const handle = await manager.start({ timeoutMs });
            const serverKey = makeServerKey(appPath);
            LaunchTool.serverManagers.set(serverKey, { manager, appPath });
            const result: StartDevServerResult = {
                success: true,
                serverKey,
                url: handle.url,
                port: handle.port,
                pid: handle.child.pid ?? undefined,
                outputTail: handle.outputTail(),
            };
            return JSON.stringify(result, null, 2);
        } catch (error) {
            const result: StartDevServerResult = {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
            return JSON.stringify(result, null, 2);
        }
    }

    async stopDevServer(serverKey: string): Promise<string> {
        const entry = LaunchTool.serverManagers.get(serverKey);
        if (!entry) {
            const result: StopDevServerResult = { success: false, serverKey, error: `Unknown serverKey: ${serverKey}` };
            return JSON.stringify(result, null, 2);
        }
        try {
            await entry.manager.stop();
            LaunchTool.serverManagers.delete(serverKey);
            const result: StopDevServerResult = { success: true, serverKey };
            return JSON.stringify(result, null, 2);
        } catch (error) {
            const result: StopDevServerResult = {
                success: false,
                serverKey,
                error: error instanceof Error ? error.message : String(error),
            };
            return JSON.stringify(result, null, 2);
        }
    }
}
