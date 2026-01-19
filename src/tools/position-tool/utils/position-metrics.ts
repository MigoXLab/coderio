/**
 * For 100% Figma replication, all elements matter equally (standard MAE, not area-weighted).
 */

import type { ElementAbsolutePosition, ValidationMetrics } from '../types';

export function calculatePositionMetrics(positions: Record<string, ElementAbsolutePosition>): ValidationMetrics {
    const positionValues = Object.values(positions);
    const comparableItems = positionValues.filter(p => p.metrics);
    const comparableCount = comparableItems.length;

    if (comparableCount === 0) {
        return {
            mae: 0,
            mse: 0,
            rmse: 0,
            accurateItems: 0,
            misalignedItems: 0,
            comparableItems: 0,
            accuracyRate: 0,
            averageDistance: 0,
            maxDistance: 0,
        };
    }

    const distances = comparableItems.map(p => p.metrics!.absoluteDistance);

    const mae = distances.reduce((sum, d) => sum + d, 0) / comparableCount;
    const mse = distances.reduce((sum, d) => sum + d * d, 0) / comparableCount;
    const rmse = Math.sqrt(mse);
    const maxDistance = Math.max(...distances);

    const accurateItems = comparableItems.filter(p => p.metrics!.status === 'accurate').length;
    const misalignedItems = comparableItems.filter(p => p.metrics!.status === 'misaligned').length;
    const accuracyRate = comparableCount > 0 ? (accurateItems / comparableCount) * 100 : 0;

    return {
        mae: Math.round(mae * 100) / 100,
        mse: Math.round(mse * 100) / 100,
        rmse: Math.round(rmse * 100) / 100,
        accurateItems,
        misalignedItems,
        comparableItems: comparableCount,
        accuracyRate: Math.round(accuracyRate * 100) / 100,
        averageDistance: Math.round(mae * 100) / 100,
        maxDistance: Math.round(maxDistance * 100) / 100,
    };
}

