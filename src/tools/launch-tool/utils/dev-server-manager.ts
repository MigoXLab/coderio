import * as http from 'http';
import * as net from 'net';
import { spawn, type ChildProcess } from 'child_process';

import { buildDevServerUrl, DEFAULT_PORT } from '../../../constants/validation';
import { logger } from '../../../utils/logger';

export interface DevServerHandle {
    child: ChildProcess;
    port: number;
    url: string;
    /**
     * Last tail of stdout/stderr for diagnosing startup/runtime issues.
     */
    outputTail: () => string;
}

function normalizeExecutable(executable: string): string {
    if (process.platform !== 'win32') {
        return executable;
    }
    const lower = executable.toLowerCase();
    if (lower === 'npm' || lower === 'pnpm' || lower === 'yarn' || lower === 'npx') {
        return `${lower}.cmd`;
    }
    return executable;
}

function parseCommandWithPortSupport(commandStr: string): { executable: string; args: string[]; needsDoubleDash: boolean } {
    const parts = commandStr.trim().split(/\s+/);
    const executable = parts[0];
    if (!executable) {
        throw new Error('Failed to parse command: empty command string');
    }
    const args = parts.slice(1);
    const needsDoubleDash = ['npm', 'pnpm', 'yarn'].includes(executable);
    return { executable, args, needsDoubleDash };
}

async function isPortAvailable(port: number): Promise<boolean> {
    return await new Promise(resolve => {
        const server = net.createServer();
        server.unref();
        server.on('error', () => resolve(false));
        server.listen(port, () => {
            server.close(() => resolve(true));
        });
    });
}

export async function getFreePort(startPort: number = DEFAULT_PORT): Promise<number> {
    const maxAttempts = 50;
    for (let port = startPort; port < startPort + maxAttempts; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No free ports found starting from ${startPort}`);
}

async function waitForServerReady(url: string, timeoutMs: number): Promise<boolean> {
    const start = Date.now();
    const intervalMs = 400;

    while (Date.now() - start < timeoutMs) {
        const ok = await new Promise<boolean>(resolve => {
            const req = http.get(url, res => {
                res.resume();
                resolve(res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 500);
            });
            req.on('error', () => resolve(false));
            req.setTimeout(500, () => req.destroy());
        });
        if (ok) return true;
        await new Promise(r => setTimeout(r, intervalMs));
    }

    return false;
}

export class DevServerManager {
    private handle: DevServerHandle | null = null;

    constructor(private readonly params: { repoPath: string; runCommand: string }) {}

    get current(): DevServerHandle | null {
        return this.handle;
    }

    async start(options: { timeoutMs: number } = { timeoutMs: 60_000 }): Promise<DevServerHandle> {
        if (this.handle) {
            return this.handle;
        }

        const port = await getFreePort();
        const url = buildDevServerUrl(port);
        const { executable, args, needsDoubleDash } = parseCommandWithPortSupport(this.params.runCommand);
        const normalizedExecutable = normalizeExecutable(executable);
        const commandArgs = needsDoubleDash ? [...args, '--', '--port', String(port)] : [...args, '--port', String(port)];

        logger.printLog(`🚀 Starting dev server: ${normalizedExecutable} ${commandArgs.join(' ')}`);

        const child = spawn(normalizedExecutable, commandArgs, {
            cwd: this.params.repoPath,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                PORT: String(port),
                FORCE_COLOR: '1',
            },
        });

        const maxBytes = 1_000_000;
        let out = '';
        const push = (chunk: Buffer) => {
            out += chunk.toString('utf-8');
            if (out.length > maxBytes) {
                out = out.slice(out.length - maxBytes);
            }
        };
        child.stdout?.on('data', push);
        child.stderr?.on('data', push);

        // If our process exits, try to stop the child to avoid orphans.
        process.once('exit', () => {
            try {
                child.kill('SIGTERM');
            } catch {
                // ignore
            }
        });

        const ready = await waitForServerReady(url, options.timeoutMs);
        if (!ready) {
            const tail = out.trim();
            try {
                child.kill('SIGTERM');
            } catch {
                // ignore
            }
            throw new Error(`Dev server did not become ready at ${url} within ${options.timeoutMs}ms.\n${tail}`);
        }

        this.handle = {
            child,
            port,
            url,
            outputTail: () => out.trim(),
        };

        logger.printSuccessLog(`✅ Dev server ready at ${url}`);
        return this.handle;
    }

    async stop(): Promise<void> {
        if (!this.handle) return;
        const child = this.handle.child;
        this.handle = null;

        await new Promise<void>(resolve => {
            try {
                child.once('close', () => resolve());
                child.kill('SIGTERM');
            } catch {
                resolve();
            }
            setTimeout(() => resolve(), 1500);
        });
    }

    async restart(options: { timeoutMs: number } = { timeoutMs: 60_000 }): Promise<DevServerHandle> {
        await this.stop();
        return await this.start(options);
    }
}
