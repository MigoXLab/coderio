/**
 * Aggregate element-level rectangles into component-level bounds and misalignment metrics.
 */

/**
 * Rectangle with position and dimensions.
 */
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Aggregate bounding box result.
 */
export interface BoundingBox {
    minX: number;
    minY: number;
    maxRight: number;
    maxBottom: number;
    width: number;
    height: number;
}

/**
 * Position error calculation result.
 */
export interface PositionError {
    errorX: number;
    errorY: number;
    distance: number;
}

/**
 * Minimum shape required for component-level aggregation.
 */
export interface ComponentAggregationData {
    positions: Rectangle[];
    targets: Rectangle[];
}

export function calculateAggregateBoundingBox(rectangles: Rectangle[]): BoundingBox {
    if (rectangles.length === 0) {
        throw new Error('Cannot calculate bounding box from empty array');
    }

    const minX = Math.min(...rectangles.map(r => r.x));
    const minY = Math.min(...rectangles.map(r => r.y));
    const maxRight = Math.max(...rectangles.map(r => r.x + r.width));
    const maxBottom = Math.max(...rectangles.map(r => r.y + r.height));

    return {
        minX,
        minY,
        maxRight,
        maxBottom,
        width: maxRight - minX,
        height: maxBottom - minY,
    };
}

export function calculatePositionError(current: BoundingBox, target: BoundingBox): PositionError {
    const errorX = Math.abs(target.minX - current.minX);
    const errorY = Math.abs(target.minY - current.minY);
    const distance = Math.sqrt(errorX ** 2 + errorY ** 2);

    return { errorX, errorY, distance };
}

export function calculateComponentMetrics(
    compData: ComponentAggregationData,
    positionThreshold: number
): {
    currentBounds: BoundingBox;
    targetBounds: BoundingBox;
    error: PositionError;
} | null {
    if (compData.positions.length === 0 || compData.targets.length === 0) {
        return null;
    }

    const currentBounds = calculateAggregateBoundingBox(compData.positions);
    const targetBounds = calculateAggregateBoundingBox(compData.targets);
    const error = calculatePositionError(currentBounds, targetBounds);

    if (error.distance <= positionThreshold) {
        return null;
    }

    return { currentBounds, targetBounds, error };
}

