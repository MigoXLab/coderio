import type { Rectangle } from './aggregate-elements';

export function toRect(rectLike: { x: number; y: number; width: number; height: number }): Rectangle {
    return { x: rectLike.x, y: rectLike.y, width: rectLike.width, height: rectLike.height };
}
