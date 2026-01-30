import axios, { AxiosRequestConfig } from 'axios';
import { getDebugConfig } from './config';
import { writeFile } from './file';
import { workspaceManager } from './workspace';

/**
 * Save debug log
 */
function saveDebugLog(
    requestInfo: { url: string; config: AxiosRequestConfig },
    responseInfo: { status: number; statusText: string; data: unknown }
): void {
    const debugConfig = getDebugConfig();
    if (!debugConfig.enabled) {
        return;
    }
    const debugContent = [
        '------------request------------',
        JSON.stringify(requestInfo, null, 2),
        '------------response------------',
        JSON.stringify(responseInfo, null, 2),
    ].join('\n');
    writeFile(workspaceManager.path?.debug ?? '', `fetch_${new Date().toISOString()}.md`, debugContent);
}

/**
 * Axios get request with debug logging
 */
export async function get<T>(url: string, config?: AxiosRequestConfig<T>): Promise<T> {
    const response = await axios.get<T>(url, config);

    saveDebugLog(
        {
            url,
            config: config ?? {},
        },
        {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
        }
    );

    return response.data;
}
