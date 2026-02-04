import * as path from 'node:path';
import { tools } from 'evoltagent';

import type { StartDevServerResult, StopDevServerResult } from './types';
import { DevServerManager } from './utils/dev-server-manager';

/**
 * Generate a stable lookup key for a dev server instance (same appPath => same key).
 * Port and pid are NOT included because:
 * - They become stale after restart (port may change, pid always changes)
 * - DevServerManager tracks current port/pid in its internal state
 * - serverKey is only used for Map lookup, never parsed
 * Stable key ensures one manager per appPath and avoids concurrent start() / duplicate port logs.
 */
function makeServerKey(appPath: string): string {
    const safeApp = appPath.split(path.sep).join('_');
    return `launch:${safeApp}`;
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
    /** Mutex per appPath so only one startDevServer runs at a time for a given app (avoids duplicate port logs). */
    private static readonly inFlightStarts = new Map<string, Promise<void>>();

    async startDevServer(appPath: string, runCommand: string, timeoutMs: number = 60_000): Promise<string> {
        const serverKey = makeServerKey(appPath);
        const prev = LaunchTool.inFlightStarts.get(appPath);
        let resolveThis: () => void;
        const thisRun = new Promise<void>(r => {
            resolveThis = r;
        });
        LaunchTool.inFlightStarts.set(appPath, thisRun);
        await prev;

        try {
            const entry = LaunchTool.serverManagers.get(serverKey);
            if (entry) {
                const handle = await entry.manager.restart({ timeoutMs });
                const result: StartDevServerResult = {
                    success: true,
                    serverKey,
                    url: handle.url,
                    port: handle.port,
                    pid: handle.child.pid ?? undefined,
                    outputTail: handle.outputTail(),
                };
                return JSON.stringify(result, null, 2);
            }

            const manager = new DevServerManager({ appPath, runCommand: runCommand.trim() });
            const handle = await manager.start({ timeoutMs });
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
        } finally {
            resolveThis!();
            LaunchTool.inFlightStarts.delete(appPath);
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
