import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Ruler, Info } from 'lucide-react';
import type { UserReport } from '../types';

interface FeedbackPanelProps {
    detail: UserReport['report']['detail'];
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ detail }) => {
    // Group by status for a quick summary
    const { metrics, components } = detail;

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full">
            {/* Header */}
            <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Analysis Report</h2>

                <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-100">
                        <Info size={14} />
                        MAE: {metrics.mae.toFixed(2)}, SAE: {metrics.sae.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100">
                        <AlertTriangle size={14} />
                        {components?.length || 0} instances mismatched
                    </div>
                </div>

                <span className="text-xs text-slate-500 mt-1 italic">Only positional detection supported currently</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {components.map(item => (
                    <FeedbackCard key={item.componentId} item={item} />
                ))}
            </div>
        </div>
    );
};

const FeedbackCard: React.FC<{ item: UserReport['report']['detail']['components'][number] }> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`border rounded-lg transition-all duration-200 ${isExpanded ? 'border-indigo-100 shadow-md bg-white' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 text-left focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-slate-800">{item.componentId}</h3>
                    {item.elements && item.elements?.length > 0 && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold ml-1">
                            {item.elements?.length} elements
                        </span>
                    )}
                </div>
                {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>

            {isExpanded && (
                <div className="px-3 pb-4 pt-0 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 mt-2">Path: {item.componentPath}</p>
                    {/* Metrics */}
                    <div className="space-y-2 mt-3 mb-2">
                        {item.elements?.map(el => (
                            <div key={el.elementId} className="bg-slate-50 p-2 rounded border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <Ruler size={10} />{' '}
                                        <span className="text-[9px] text-slate-800 font-mono truncate max-w-[100px]" title={el.elementId}>
                                            ID: <strong>{el.elementId}</strong>
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500">Index: {el.elementIndex}</span>
                                </div>
                                <div className="font-mono text-[10px] text-slate-800 font-medium">
                                    x: <span className={el.validationInfo.x !== 0 ? 'text-red-500' : ''}>{el.validationInfo.x}px</span>, y:{' '}
                                    <span className={el.validationInfo.y !== 0 ? 'text-red-500' : ''}>{el.validationInfo.y}px</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackPanel;
