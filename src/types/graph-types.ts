/* Enum representing the nodes in the LangGraph. */
export enum GraphNode {
    INITIAL = 'initial',
    PROCESS = 'process',
    DATA = 'data',
    CODE = 'code',
}

export interface GlobalFigmaInfo {
    thumbnail: string;
}
