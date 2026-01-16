import { FigmaImageFormat } from '../../types/figma-types';

export interface ImageNode {
    id: string;
    name: string;
    format: FigmaImageFormat;
    url?: string;
    success?: boolean;
    remote?: string;
}
