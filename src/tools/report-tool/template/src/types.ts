export type ViewMode = 'rubbing' | 'annotation';

export interface UserReport {
    design: {
        snap: string; // Figma thumbnail URL
        markedSnap: string; // Annotated design image (base64 data URI)
    };
    page: {
        url: string; // Local server URL
        snap: string; // Page screenshot (base64 data URI)
        markedSnap: string; // Annotated page screenshot (base64 data URI)
    };
    report: {
        heatmap: string; // Reserved for future heatmap implementation (empty for now)
        detail: {
            metrics: {
                mae: number;
                sae: number;
                misalignedCount: number;
            };
            // Grouped component type for report visualization
            components: {
                componentId: string;
                componentPath: string;
                elements: {
                    elementId: string;
                    elementIndex: number;
                    validationInfo: {
                        x: number; // Horizontal deviation in px
                        y: number; // Vertical deviation in px
                    };
                }[];
            }[];
        };
    };
}
