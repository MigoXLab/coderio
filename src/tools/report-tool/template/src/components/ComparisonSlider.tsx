import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripVertical, Flame } from 'lucide-react';

interface ComparisonSliderProps {
    beforeImage: string; // Design
    afterImage: string; // Implementation (Page Screenshot)
    heatmapImage?: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage, heatmapImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    }, []);

    const handleMouseDown = () => setIsDragging(true);
    const handleTouchStart = () => setIsDragging(true);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);
    const handleTouchEnd = useCallback(() => setIsDragging(false), []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX);
        },
        [isDragging, handleMove]
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (isDragging) handleMove(e.touches[0].clientX);
        },
        [isDragging, handleMove]
    );

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
        <div className="relative flex flex-col gap w-full h-full">
            <div className="flex justify-between items-center w-full px-4 py-3">
                <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">Design</div>
                {/* Controls: Heatmap Toggle */}
                <label className="flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm group">
                    <input type="checkbox" className="sr-only" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} />
                    <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${showHeatmap ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-100 border-slate-300'}`}
                    >
                        {showHeatmap && <Flame size={10} fill="currentColor" />}
                    </div>
                    <span className={`text-xs font-medium ${showHeatmap ? 'text-orange-600' : 'text-slate-600'}`}>Heatmap</span>
                </label>
                <div className="bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">Page</div>
            </div>

            <div
                ref={containerRef}
                className="relative w-full h-full select-none overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white"
            >
                {/* 
                LOGIC EXPLANATION:
                - Layer 1 (Bottom): Design Mockup (Visible on the RIGHT side when clipped)
                - Layer 2 (Top): Code Implementation (Visible on the LEFT side, clipped from the right)
                */}

                {/* 1. Design Mockup (Full Width Background) */}
                {!showHeatmap && (
                    <img
                        src={beforeImage}
                        alt="Design Mockup"
                        className="absolute inset-0 h-full w-full object-contain object-top pointer-events-none"
                    />
                )}

                {/* 2. Implementation (Clipped to show only the left part based on slider position) */}
                {!showHeatmap && (
                    <img
                        src={afterImage}
                        alt="Implementation"
                        className="absolute inset-0 h-full w-full object-contain object-top pointer-events-none z-10"
                        style={{
                            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                        }}
                    />
                )}

                {/* 3. Heatmap Overlay */}
                {showHeatmap && heatmapImage && (
                    <img
                        src={heatmapImage}
                        alt="heatmap"
                        className="absolute inset-0 h-full w-full object-contain object-top pointer-events-none z-15"
                    />
                )}

                {/* Slider Handle */}
                {!showHeatmap && (
                    <div
                        className="absolute inset-y-0 cursor-ew-resize z-40 group"
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                    >
                        <div className="h-full w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] group-hover:bg-indigo-400 transition-colors"></div>
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                            <GripVertical size={16} className="text-slate-400" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparisonSlider;
