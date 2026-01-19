/* Enum representing the nodes in the LangGraph. */
export enum GraphNode {
    INITIAL = 'initial',
    PROCESS = 'process',
    VALIDATION = 'validation',
    DATA = 'data',
    CODE = 'code',
}

export interface GlobalFigmaInfo {
    thumbnail: string;
}
