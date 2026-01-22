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
