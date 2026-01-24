import React, { useState } from 'react';
import { Layers, ScanEye, Code2, ChevronRight, FlaskConical } from 'lucide-react';
import ComparisonSlider from './components/ComparisonSlider';
import AnnotationView from './components/AnnotationView';
import FeedbackPanel from './components/FeedbackPanel';
import { ViewMode, UserReport } from './types';

// ... imports ...

// Define global interface for injected data
declare global {
    interface Window {
        __REPORT_DATA__?: UserReport;
    }
}

const App: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('annotation');
    const { design, page, report } = window.__REPORT_DATA__;

    return (
        <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            {/* --- Top Navigation Bar --- */}
            <header className="h-16 flex-none bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <Code2 size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">CodeRio</h1>
                        <span className="text-[10px] font-semibold tracking-widest text-indigo-500 uppercase">Design2Code</span>
                    </div>
                </div>

                {/* Mode Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewMode('annotation')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                            viewMode === 'annotation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <ScanEye size={16} />
                        <span>Annotation Mode</span>
                    </button>
                    <button
                        onClick={() => setViewMode('rubbing')}
                        className={`relative flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                            viewMode === 'rubbing' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Layers size={16} />
                        <span>Rubbing Mode</span>
                        {/* Fun Badge */}
                        <span className="flex h-2 w-2 absolute top-1 right-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                        </span>
                        <div className="ml-1 text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold tracking-wide uppercase">
                            <FlaskConical size={10} /> Lab
                        </div>
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Settings size={20} />
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <Download size={16} />
                        Export Report
                    </button> */}
                </div>
            </header>

            {/* --- Main Workspace --- */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left/Center: Visualization Area */}
                <section className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
                    {/* Breadcrumb / Context Bar */}
                    <div className="h-12 border-b border-slate-200 flex items-center px-6 text-sm text-slate-500 gap-2 bg-white/50 backdrop-blur-sm">
                        <span className="font-medium text-slate-800">Home Page</span>
                        <ChevronRight size={14} />
                        <span className={viewMode === 'rubbing' ? 'text-indigo-600 font-medium' : ''}>
                            {viewMode === 'rubbing' ? 'Rubbing Mode' : 'Annotation Mode'}
                        </span>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 p-6 overflow-hidden">
                        <div className="w-full h-full shadow-lg rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white">
                            {viewMode === 'rubbing' ? (
                                <ComparisonSlider beforeImage={page.snap} afterImage={design.snap} heatmapImage={report.heatmap} />
                            ) : (
                                <AnnotationView designUrl={design.markedSnap} pageUrl={page.markedSnap} />
                            )}
                        </div>
                    </div>
                </section>

                {/* Right: Feedback Panel */}
                <aside className="w-[340px] flex-none z-20 shadow-xl shadow-slate-200/50">
                    <FeedbackPanel detail={report.detail} />
                </aside>
            </main>
        </div>
    );
};

export default App;
