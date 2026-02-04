import { describe, it, expect } from 'vitest';
import { calculatePositionMetrics } from '../../src/tools/position-tool/utils/position-metrics';
import { ElementAbsolutePosition } from '../../src/tools/position-tool/types';

describe('calculatePositionMetrics', () => {
    it('should return zero metrics when no comparable items', () => {
        const positions: Record<string, ElementAbsolutePosition> = {};

        const result = calculatePositionMetrics(positions);

        expect(result).toEqual({
            mae: 0,
            mse: 0,
            rmse: 0,
            accurateItems: 0,
            misalignedItems: 0,
            comparableItems: 0,
            accuracyRate: 0,
            averageDistance: 0,
            maxDistance: 0,
        });
    });

    it('should calculate metrics correctly for all accurate items', () => {
        const positions: Record<string, ElementAbsolutePosition> = {
            elem1: {
                id: 'elem1',
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                metrics: {
                    status: 'accurate',
                    absoluteDistance: 0,
                    horizontalDelta: 0,
                    verticalDelta: 0,
                },
            },
            elem2: {
                id: 'elem2',
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                metrics: {
                    status: 'accurate',
                    absoluteDistance: 0,
                    horizontalDelta: 0,
                    verticalDelta: 0,
                },
            },
        };

        const result = calculatePositionMetrics(positions);

        expect(result.mae).toBe(0);
        expect(result.mse).toBe(0);
        expect(result.rmse).toBe(0);
        expect(result.accurateItems).toBe(2);
        expect(result.misalignedItems).toBe(0);
        expect(result.comparableItems).toBe(2);
        expect(result.accuracyRate).toBe(100);
        expect(result.averageDistance).toBe(0);
        expect(result.maxDistance).toBe(0);
    });

    it('should calculate metrics correctly for all misaligned items', () => {
        const positions: Record<string, ElementAbsolutePosition> = {
            elem1: {
                id: 'elem1',
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 10,
                    horizontalDelta: 6,
                    verticalDelta: 8,
                },
            },
            elem2: {
                id: 'elem2',
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 5,
                    horizontalDelta: 3,
                    verticalDelta: 4,
                },
            },
        };

        const result = calculatePositionMetrics(positions);

        expect(result.mae).toBe(7.5);
        expect(result.mse).toBe(62.5);
        expect(result.rmse).toBeCloseTo(7.91, 2);
        expect(result.accurateItems).toBe(0);
        expect(result.misalignedItems).toBe(2);
        expect(result.comparableItems).toBe(2);
        expect(result.accuracyRate).toBe(0);
        expect(result.averageDistance).toBe(7.5);
        expect(result.maxDistance).toBe(10);
    });

    it('should calculate metrics correctly for mixed accurate and misaligned items', () => {
        const positions: Record<string, ElementAbsolutePosition> = {
            elem1: {
                id: 'elem1',
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                metrics: {
                    status: 'accurate',
                    absoluteDistance: 0,
                    horizontalDelta: 0,
                    verticalDelta: 0,
                },
            },
            elem2: {
                id: 'elem2',
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 10,
                    horizontalDelta: 6,
                    verticalDelta: 8,
                },
            },
            elem3: {
                id: 'elem3',
                left: 200,
                top: 200,
                width: 75,
                height: 75,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 5,
                    horizontalDelta: 3,
                    verticalDelta: 4,
                },
            },
        };

        const result = calculatePositionMetrics(positions);

        expect(result.mae).toBe(5);
        expect(result.mse).toBeCloseTo(41.67, 2);
        expect(result.rmse).toBeCloseTo(6.45, 2);
        expect(result.accurateItems).toBe(1);
        expect(result.misalignedItems).toBe(2);
        expect(result.comparableItems).toBe(3);
        expect(result.accuracyRate).toBeCloseTo(33.33, 2);
        expect(result.averageDistance).toBe(5);
        expect(result.maxDistance).toBe(10);
    });

    it('should skip items without metrics', () => {
        const positions: Record<string, ElementAbsolutePosition> = {
            elem1: {
                id: 'elem1',
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                metrics: {
                    status: 'accurate',
                    absoluteDistance: 0,
                    horizontalDelta: 0,
                    verticalDelta: 0,
                },
            },
            elem2: {
                id: 'elem2',
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                // No metrics
            },
            elem3: {
                id: 'elem3',
                left: 200,
                top: 200,
                width: 75,
                height: 75,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 10,
                    horizontalDelta: 6,
                    verticalDelta: 8,
                },
            },
        };

        const result = calculatePositionMetrics(positions);

        expect(result.comparableItems).toBe(2);
        expect(result.accurateItems).toBe(1);
        expect(result.misalignedItems).toBe(1);
    });

    it('should round metrics to 2 decimal places', () => {
        const positions: Record<string, ElementAbsolutePosition> = {
            elem1: {
                id: 'elem1',
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 1.234567,
                    horizontalDelta: 0.7,
                    verticalDelta: 1.0,
                },
            },
            elem2: {
                id: 'elem2',
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 2.345678,
                    horizontalDelta: 1.2,
                    verticalDelta: 2.0,
                },
            },
        };

        const result = calculatePositionMetrics(positions);

        expect(result.mae).toBe(1.79);
        expect(result.averageDistance).toBe(1.79);
        expect(result.maxDistance).toBe(2.35);
    });

    it('should handle single item correctly', () => {
        const positions: Record<string, ElementAbsolutePosition> = {
            elem1: {
                id: 'elem1',
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 5.5,
                    horizontalDelta: 3,
                    verticalDelta: 4.5,
                },
            },
        };

        const result = calculatePositionMetrics(positions);

        expect(result.mae).toBe(5.5);
        expect(result.mse).toBe(30.25);
        expect(result.rmse).toBe(5.5);
        expect(result.accurateItems).toBe(0);
        expect(result.misalignedItems).toBe(1);
        expect(result.comparableItems).toBe(1);
        expect(result.accuracyRate).toBe(0);
        expect(result.maxDistance).toBe(5.5);
    });

    it('should calculate RMSE correctly', () => {
        const positions: Record<string, ElementAbsolutePosition> = {
            elem1: {
                id: 'elem1',
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 3,
                    horizontalDelta: 0,
                    verticalDelta: 3,
                },
            },
            elem2: {
                id: 'elem2',
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                metrics: {
                    status: 'misaligned',
                    absoluteDistance: 4,
                    horizontalDelta: 0,
                    verticalDelta: 4,
                },
            },
        };

        const result = calculatePositionMetrics(positions);

        // MAE = (3 + 4) / 2 = 3.5
        expect(result.mae).toBe(3.5);
        // MSE = (9 + 16) / 2 = 12.5
        expect(result.mse).toBe(12.5);
        // RMSE = sqrt(12.5) ≈ 3.54
        expect(result.rmse).toBeCloseTo(3.54, 2);
    });
});
