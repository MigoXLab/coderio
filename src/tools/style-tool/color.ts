/**
 * Color Converter
 * Convert Figma color objects (SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL) to CSS color strings
 */
import { FigmaColorObject, FigmaColor, FigmaGradientStop } from '../../types/figma-types';

export class ColorConverter {
    // Main conversion entry point
    static convert(colorObject: FigmaColorObject): string {
        if (!colorObject) return 'transparent';

        const type = colorObject.type;

        switch (type) {
            case 'SOLID':
                return this.convertSolid(colorObject);
            case 'GRADIENT_LINEAR':
                return this.convertLinearGradient(colorObject);
            case 'GRADIENT_RADIAL':
                return this.convertRadialGradient(colorObject);
            default:
                return 'transparent';
        }
    }

    // Convert SOLID fill to rgba/rgb string
    private static convertSolid(fill: FigmaColorObject): string {
        if (!fill.color) return 'transparent';

        const opacity = this.getOpacity(fill.opacity);
        return this.rgbaToString(fill.color, opacity);
    }

    // Convert linear gradient to CSS linear-gradient
    private static convertLinearGradient(fill: FigmaColorObject): string {
        const stops = fill.gradientStops || [];
        const handles = fill.gradientHandlePositions || [];
        const fillOpacity = this.getOpacity(fill.opacity);

        if (stops.length === 0) return 'transparent';

        // Calculate gradient angle
        const angle = handles.length >= 2 ? this.calculateLinearGradientAngle(handles) : 180;

        // Calculate gradient stops with positions
        const stopsWithPositions = this.calculateLinearGradientStops(stops, handles, fillOpacity);

        return `linear-gradient(${angle}deg, ${stopsWithPositions})`;
    }

    // Convert radial gradient to CSS radial-gradient
    private static convertRadialGradient(fill: FigmaColorObject): string {
        const stops = fill.gradientStops || [];
        const handles = fill.gradientHandlePositions || [];
        const fillOpacity = this.getOpacity(fill.opacity);

        if (stops.length === 0) return 'transparent';

        // Calculate radial gradient parameters
        const { size, position } = this.calculateRadialGradientParams(handles);

        // Convert stops
        const stopsStr = stops
            .map(stop => {
                const color = this.rgbaToString(stop.color, fillOpacity);
                const pos = Math.round(stop.position * 100);
                return `${color} ${pos}%`;
            })
            .join(', ');

        return `radial-gradient(${size} at ${position}, ${stopsStr})`;
    }

    private static getOpacity(opacity?: number): number {
        return opacity !== undefined ? opacity : 1;
    }

    // Helper: Convert Figma color to CSS rgba/rgb/hex string
    static rgbaToString(color: FigmaColor, opacity: number = 1): string {
        if (!color) return 'transparent';

        const r = Math.round((color.r || 0) * 255);
        const g = Math.round((color.g || 0) * 255);
        const b = Math.round((color.b || 0) * 255);
        const a = (color.a !== undefined ? color.a : 1) * (opacity !== undefined ? opacity : 1);

        // Use hex format when fully opaque, rgba when transparent
        if (Math.abs(a - 1) < 0.001) {
            // Fully opaque - use hex format
            if (r === 255 && g === 255 && b === 255) return '#FFF';
            if (r === 0 && g === 0 && b === 0) return '#000';
            // Convert to hex
            const toHex = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        // Transparent - use rgba with proper formatting
        const alphaStr = a !== undefined ? a.toFixed(2) : '1';
        return `rgba(${r}, ${g}, ${b}, ${alphaStr})`;
    }

    /**
     * Calculate CSS gradient angle from Figma gradient handle positions
     * Figma uses a transform matrix system with 3 points:
     * - p0: gradient origin
     * - p1: gradient direction endpoint (color changes from p0 to p1)
     * - p2: perpendicular direction endpoint
     *
     * Formula: CSS angle = atan2(v1) + angleBetween(v1, v2)
     * where v1 = p1-p0, v2 = p2-p0
     */
    private static calculateLinearGradientAngle(positions: { x: number; y: number }[]): number {
        if (positions.length < 2) return 180;

        const [p0, p1, p2] = positions;

        if (!p0 || !p1) return 180;

        // Vector v1: gradient direction (p0 → p1)
        const v1x = p1.x - p0.x;
        const v1y = p1.y - p0.y;
        const len1 = Math.sqrt(v1x * v1x + v1y * v1y);

        // Calculate angle of v1
        const angle1Rad = Math.atan2(v1y, v1x);
        const angle1Deg = angle1Rad * (180 / Math.PI);

        // If we don't have p2, use simple formula
        if (!p2 || positions.length < 3) {
            let cssAngle = angle1Deg + 90;
            while (cssAngle < 0) cssAngle += 360;
            while (cssAngle >= 360) cssAngle -= 360;
            return Math.round(cssAngle);
        }

        // Vector v2: perpendicular reference (p0 → p2)
        const v2x = p2.x - p0.x;
        const v2y = p2.y - p0.y;
        const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

        // Calculate angle between v1 and v2
        const dot = v1x * v2x + v1y * v2y;
        const cosAngle = Math.max(-1, Math.min(1, dot / (len1 * len2)));
        const angleBetweenRad = Math.acos(cosAngle);
        const angleBetweenDeg = angleBetweenRad * (180 / Math.PI);

        // CSS angle = angle1 + angleBetween
        let cssAngle = angle1Deg + angleBetweenDeg;

        // Normalize to 0-360 range
        while (cssAngle < 0) {
            cssAngle += 360;
        }
        while (cssAngle >= 360) {
            cssAngle -= 360;
        }

        return Math.round(cssAngle);
    }

    /**
     * Calculate gradient stops with correct positions
     * Based on Figma's gradient handle positions and transform matrix
     */
    private static calculateLinearGradientStops(
        stops: FigmaGradientStop[],
        handles: { x: number; y: number }[],
        fillOpacity: number
    ): string {
        if (handles.length < 2) {
            // Fallback: simple position mapping
            return stops
                .map(stop => {
                    const color = this.rgbaToString(stop.color, fillOpacity);
                    const position = Math.round(stop.position * 100);
                    // Format: remove .00 for whole numbers
                    const posStr = position === 0 ? '0%' : `${position}%`;
                    return `${color} ${posStr}`;
                })
                .join(', ');
        }

        const [p0, p1] = handles;

        if (!p0 || !p1) {
            return stops
                .map(stop => {
                    const color = this.rgbaToString(stop.color, fillOpacity);
                    const position = Math.round(stop.position * 100);
                    const posStr = position === 0 ? '0%' : `${position}%`;
                    return `${color} ${posStr}`;
                })
                .join(', ');
        }

        // Transform matrix vectors
        const m1x = p1.x - p0.x;
        const m1y = p1.y - p0.y;

        // Gradient length
        const gradientLength = Math.sqrt(m1x * m1x + m1y * m1y);

        if (gradientLength === 0) {
            return stops
                .map(stop => {
                    const color = this.rgbaToString(stop.color, fillOpacity);
                    const position = Math.round(stop.position * 100);
                    const posStr = position === 0 ? '0%' : `${position}%`;
                    return `${color} ${posStr}`;
                })
                .join(', ');
        }

        // Get CSS angle
        const cssAngle = this.calculateLinearGradientAngle(handles);
        const cssAngleRad = (cssAngle * Math.PI) / 180;

        // CSS gradient direction vector
        const gradDirX = Math.sin(cssAngleRad);
        const gradDirY = -Math.cos(cssAngleRad);

        // Project box corners onto gradient direction
        const corners = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ];

        const projections = corners.map(c => c.x * gradDirX + c.y * gradDirY);
        const minProj = Math.min(...projections);
        const maxProj = Math.max(...projections);
        const projRange = maxProj - minProj;

        // Calculate stop positions
        return stops
            .map(stop => {
                const color = this.rgbaToString(stop.color, fillOpacity);

                // Point on gradient line at this stop
                const pointX = p0.x + stop.position * m1x;
                const pointY = p0.y + stop.position * m1y;

                // Project onto CSS gradient direction
                const projection = pointX * gradDirX + pointY * gradDirY;

                // Convert to percentage
                let cssPosition = ((projection - minProj) / projRange) * 100;

                // Round to 2 decimal places then format
                cssPosition = cssPosition !== undefined ? Math.round(cssPosition * 100) / 100 : 0;

                // Format position string
                let posStr: string;
                if (cssPosition === 0) {
                    posStr = '0%';
                } else if (Number.isInteger(cssPosition)) {
                    posStr = `${cssPosition}%`;
                } else {
                    posStr = `${cssPosition.toFixed(2)}%`;
                }

                return `${color} ${posStr}`;
            })
            .join(', ');
    }

    // Calculate radial gradient parameters from handle positions
    private static calculateRadialGradientParams(handles: { x: number; y: number }[]): {
        size: string;
        position: string;
    } {
        if (handles.length < 2) {
            return { size: 'circle', position: '50% 50%' };
        }

        const [center, edge, perpendicular] = handles;

        if (!center || !edge || !perpendicular) {
            return { size: 'circle', position: '50% 50%' };
        }

        // Calculate radius as distance from center to edge
        const dx = edge.x - center.x;
        const dy = edge.y - center.y;
        const radiusX = Math.sqrt(dx * dx + dy * dy);

        // Calculate perpendicular radius if third handle exists
        let radiusY = radiusX;
        if (perpendicular) {
            const pdx = perpendicular.x - center.x;
            const pdy = perpendicular.y - center.y;
            radiusY = Math.sqrt(pdx * pdx + pdy * pdy);
        }

        // Convert center position to percentage
        const centerX = center.x !== undefined ? (center.x * 100).toFixed(2) : '0';
        const centerY = center.y !== undefined ? (center.y * 100).toFixed(2) : '0';

        // Calculate size
        const sizeX = radiusX !== undefined ? (radiusX * 100).toFixed(2) : '0';
        const sizeY = radiusY !== undefined ? (radiusY * 100).toFixed(2) : '0';

        return {
            size: `${sizeY}% ${sizeX}%`,
            position: `${centerX}% ${centerY}%`,
        };
    }

    // Convert SOLID fill to linear-gradient format (for layering multiple fills)
    static solidToGradient(fill: FigmaColorObject): string {
        const color = this.convertSolid(fill);
        return `linear-gradient(0deg, ${color} 0%, ${color} 100%)`;
    }
}
