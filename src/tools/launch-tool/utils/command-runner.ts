import { spawn } from 'child_process';

export interface CommandResult {
    exitCode: number;
    stdout: string;
    stderr: string;
    combined: string;
    timedOut: boolean;
}

function splitCommand(command: string): { executable: string; args: string[] } {
    const trimmed = command.trim();
    if (!trimmed) {
        throw new Error('Command is empty');
    }
    const parts = trimmed.split(/\s+/);
    const executable = parts[0];
    if (!executable) {
        throw new Error('Failed to extract executable from command');
    }
    return { executable, args: parts.slice(1) };
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

export async function runCommandCapture(params: {
    cwd: string;
    command: string;
    timeoutMs: number;
    env?: Record<string, string | undefined>;
}): Promise<CommandResult> {
    const { executable, args } = splitCommand(params.command);
    const normalizedExecutable = normalizeExecutable(executable);

    return await new Promise(resolve => {
        const child = spawn(normalizedExecutable, args, {
            cwd: params.cwd,
            env: { ...process.env, ...(params.env || {}) },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';
        let timedOut = false;

        const maxBytes = 2_000_000; // keep last ~2MB for diagnosis
        const push = (buffer: string, chunk: Buffer): string => {
            const next = buffer + chunk.toString('utf-8');
            if (next.length <= maxBytes) return next;
            return next.slice(next.length - maxBytes);
        };

        child.stdout?.on('data', (d: Buffer) => {
            stdout = push(stdout, d);
        });
        child.stderr?.on('data', (d: Buffer) => {
            stderr = push(stderr, d);
        });

        const timeout = setTimeout(
            () => {
                timedOut = true;
                try {
                    child.kill('SIGTERM');
                } catch {
                    // ignore
                }
            },
            Math.max(1, params.timeoutMs)
        );

        child.on('close', code => {
            clearTimeout(timeout);
            const exitCode = typeof code === 'number' ? code : 1;
            const combined = `${stdout}\n${stderr}`.trim();
            resolve({ exitCode, stdout, stderr, combined, timedOut });
        });

        child.on('error', err => {
            clearTimeout(timeout);
            resolve({
                exitCode: 1,
                stdout,
                stderr: `${stderr}\n${String(err)}`.trim(),
                combined: `${stdout}\n${stderr}\n${String(err)}`.trim(),
                timedOut,
            });
        });
    });
}
