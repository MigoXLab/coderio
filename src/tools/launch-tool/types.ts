export interface InstallDependenciesResult {
    success: boolean;
    command: string;
    exitCode: number;
    timedOut: boolean;
    combined: string;
    error?: string;
}

export interface BuildProjectResult {
    success: boolean;
    command: string;
    exitCode: number;
    timedOut: boolean;
    combined: string;
    candidateFiles: string[];
    primaryFile: string | null;
    error?: string;
}

export interface StartDevServerResult {
    success: boolean;
    serverKey?: string;
    url?: string;
    port?: number;
    pid?: number;
    outputTail?: string;
    error?: string;
}

export interface StopDevServerResult {
    success: boolean;
    serverKey: string;
    error?: string;
}

export interface RuntimeDiagnosticsResult {
    ok: boolean;
    serverUrl: string;
    overlayText: string;
    isBlank: boolean;
    rootSummary: { childCount: number; textLength: number; htmlSnippet: string };
    consoleErrors: string[];
    pageErrors: string[];
    candidateFiles: string[];
    serverOutputTail?: string;
    error?: string;
}

