import { describe, it, expect } from 'vitest';
import { ColorConverter } from '../../src/tools/style-tool/color';
import { FigmaColorObject } from '../../src/types/figma-types';

describe('ColorConverter', () => {
    describe('convert - SOLID fills', () => {
        it('should convert solid color with full opacity to hex', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                color: { r: 1, g: 0, b: 0, a: 1 },
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('#FF0000');
        });

        it('should convert white color to #FFF shorthand', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                color: { r: 1, g: 1, b: 1, a: 1 },
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('#FFF');
        });

        it('should convert black color to #000 shorthand', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                color: { r: 0, g: 0, b: 0, a: 1 },
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('#000');
        });

        it('should convert solid color with transparency to rgba', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                color: { r: 1, g: 0, b: 0, a: 0.5 },
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('rgba(255, 0, 0, 0.50)');
        });

        it('should apply opacity multiplier to solid color', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                color: { r: 1, g: 0, b: 0, a: 1 },
                opacity: 0.5,
            };
            expect(ColorConverter.convert(color)).toBe('rgba(255, 0, 0, 0.50)');
        });

        it('should handle missing color by returning transparent', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('transparent');
        });
    });

    describe('convert - LINEAR_GRADIENT', () => {
        it('should convert simple linear gradient', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_LINEAR',
                gradientStops: [
                    { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
                    { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
                ],
                gradientHandlePositions: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                ],
                opacity: 1,
            };
            const result = ColorConverter.convert(color);
            expect(result).toContain('linear-gradient');
            expect(result).toContain('#FF0000');
            expect(result).toContain('#0000FF');
        });

        it('should calculate gradient angle correctly', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_LINEAR',
                gradientStops: [
                    { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
                    { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
                ],
                gradientHandlePositions: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                ],
                opacity: 1,
            };
            const result = ColorConverter.convert(color);
            expect(result).toMatch(/linear-gradient\(\d+deg,/);
        });

        it('should handle gradient without handle positions', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_LINEAR',
                gradientStops: [
                    { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
                    { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
                ],
                opacity: 1,
            };
            const result = ColorConverter.convert(color);
            expect(result).toContain('linear-gradient(180deg');
        });

        it('should return transparent for gradient without stops', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_LINEAR',
                gradientStops: [],
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('transparent');
        });

        it('should apply opacity to gradient stops', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_LINEAR',
                gradientStops: [
                    { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
                    { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
                ],
                gradientHandlePositions: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                ],
                opacity: 0.5,
            };
            const result = ColorConverter.convert(color);
            expect(result).toContain('rgba(');
        });
    });

    describe('convert - RADIAL_GRADIENT', () => {
        it('should convert simple radial gradient', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_RADIAL',
                gradientStops: [
                    { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
                    { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
                ],
                gradientHandlePositions: [
                    { x: 0.5, y: 0.5 },
                    { x: 1, y: 0.5 },
                    { x: 0.5, y: 1 },
                ],
                opacity: 1,
            };
            const result = ColorConverter.convert(color);
            expect(result).toContain('radial-gradient');
            expect(result).toContain('#FF0000');
            expect(result).toContain('#0000FF');
        });

        it('should handle radial gradient without handle positions', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_RADIAL',
                gradientStops: [
                    { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
                    { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
                ],
                opacity: 1,
            };
            const result = ColorConverter.convert(color);
            expect(result).toContain('radial-gradient(circle at 50% 50%');
        });

        it('should return transparent for radial gradient without stops', () => {
            const color: FigmaColorObject = {
                type: 'GRADIENT_RADIAL',
                gradientStops: [],
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('transparent');
        });
    });

    describe('rgbaToString', () => {
        it('should convert fully opaque colors to hex', () => {
            expect(ColorConverter.rgbaToString({ r: 1, g: 0, b: 0, a: 1 })).toBe('#FF0000');
            expect(ColorConverter.rgbaToString({ r: 0, g: 1, b: 0, a: 1 })).toBe('#00FF00');
            expect(ColorConverter.rgbaToString({ r: 0, g: 0, b: 1, a: 1 })).toBe('#0000FF');
        });

        it('should convert transparent colors to rgba', () => {
            expect(ColorConverter.rgbaToString({ r: 1, g: 0, b: 0, a: 0.5 })).toBe('rgba(255, 0, 0, 0.50)');
        });

        it('should apply opacity multiplier', () => {
            expect(ColorConverter.rgbaToString({ r: 1, g: 0, b: 0, a: 1 }, 0.5)).toBe('rgba(255, 0, 0, 0.50)');
        });

        it('should handle null color', () => {
            expect(ColorConverter.rgbaToString(null as any)).toBe('transparent');
        });

        it('should handle missing color components', () => {
            expect(ColorConverter.rgbaToString({ a: 1 })).toBe('#000');
        });

        it('should format hex colors correctly', () => {
            expect(ColorConverter.rgbaToString({ r: 0.5, g: 0.5, b: 0.5, a: 1 })).toBe('#808080');
        });

        it('should handle edge case near 1.0 opacity', () => {
            const result = ColorConverter.rgbaToString({ r: 1, g: 0, b: 0, a: 0.999 });
            // 0.999 is close to 1.0 but still uses rgba format
            expect(result).toContain('rgba');
        });

        it('should format rgba with proper precision', () => {
            expect(ColorConverter.rgbaToString({ r: 1, g: 0, b: 0, a: 0.123 })).toBe('rgba(255, 0, 0, 0.12)');
        });
    });

    describe('solidToGradient', () => {
        it('should convert solid fill to linear gradient format', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                color: { r: 1, g: 0, b: 0, a: 1 },
                opacity: 1,
            };
            const result = ColorConverter.solidToGradient(color);
            expect(result).toBe('linear-gradient(0deg, #FF0000 0%, #FF0000 100%)');
        });

        it('should handle transparent solid fill', () => {
            const color: FigmaColorObject = {
                type: 'SOLID',
                color: { r: 1, g: 0, b: 0, a: 0.5 },
                opacity: 1,
            };
            const result = ColorConverter.solidToGradient(color);
            expect(result).toContain('linear-gradient(0deg, rgba(255, 0, 0, 0.50)');
        });
    });

    describe('edge cases', () => {
        it('should handle null colorObject', () => {
            expect(ColorConverter.convert(null as any)).toBe('transparent');
        });

        it('should handle undefined colorObject', () => {
            expect(ColorConverter.convert(undefined as any)).toBe('transparent');
        });

        it('should handle unknown color type', () => {
            const color: any = {
                type: 'UNKNOWN_TYPE',
                opacity: 1,
            };
            expect(ColorConverter.convert(color)).toBe('transparent');
        });
    });
});
