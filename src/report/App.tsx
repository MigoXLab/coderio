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

// src/report/App.tsx

const MOCK_DATA: UserReport = {
    design: {
        snap: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/17e35ee9-4df3-4793-9f29-b98113ca62a7',
        markedSnap: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/17e35ee9-4df3-4793-9f29-b98113ca62a7',
    },
    page: {
        url: 'http://localhost:5173',
        snap: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/17e35ee9-4df3-4793-9f29-b98113ca62a7',
        markedSnap: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/17e35ee9-4df3-4793-9f29-b98113ca62a7',
    },
    report: {
        heatmap: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/17e35ee9-4df3-4793-9f29-b98113ca62a7',
        detail: {
            metrics: {
                mae: 76.34,
                sae: 720335.04,
                misalignedCount: 17,
            },
            components: [
                {
                    componentId: 'NavigationLinks',
                    componentPath: '@/components/global-header/navigation-links',
                    elements: [
                        { elementId: '1:1618', elementIndex: 1, validationInfo: { x: 442.89, y: 0 } },
                        { elementId: '1:1619', elementIndex: 2, validationInfo: { x: 442.05, y: 0 } },
                        { elementId: '1:1620', elementIndex: 3, validationInfo: { x: 442.89, y: 0 } },
                    ],
                },
                {
                    componentId: 'HeroTitle',
                    componentPath: '@/components/hero-section/hero-title',
                    elements: [{ elementId: '1:1630', elementIndex: 4, validationInfo: { x: -42, y: 0 } }],
                },
                {
                    componentId: 'HeroSubtitle',
                    componentPath: '@/components/hero-section/hero-subtitle',
                    elements: [{ elementId: '1:1631', elementIndex: 5, validationInfo: { x: 81.08, y: 0 } }],
                },
                {
                    componentId: 'EvaluationVideoCard',
                    componentPath: '@/components/video-card',
                    elements: [
                        { elementId: '1:1578', elementIndex: 6, validationInfo: { x: 0, y: -24 } },
                        { elementId: '1:1627', elementIndex: 7, validationInfo: { x: 0, y: -24 } },
                    ],
                },
                {
                    componentId: 'HelperText',
                    componentPath: '@/components/helper-text',
                    elements: [{ elementId: '1:1589', elementIndex: 8, validationInfo: { x: 252, y: -36 } }],
                },
                {
                    componentId: 'ActionButtons',
                    componentPath: '@/components/action-buttons',
                    elements: [{ elementId: '1:1590', elementIndex: 9, validationInfo: { x: 0, y: -68 } }],
                },
                {
                    componentId: 'StartButton',
                    componentPath: '@/components/action-buttons/start-button',
                    elements: [
                        { elementId: '1:1601', elementIndex: 10, validationInfo: { x: 0, y: -68 } },
                        { elementId: '1:1602', elementIndex: 11, validationInfo: { x: 0, y: -68 } },
                        { elementId: '1:1603', elementIndex: 12, validationInfo: { x: 0, y: -68 } },
                    ],
                },
                {
                    componentId: 'ApiButton',
                    componentPath: '@/components/action-buttons/api-button',
                    elements: [
                        { elementId: '1:1591', elementIndex: 13, validationInfo: { x: 0.53, y: -66 } },
                        { elementId: '1:1592', elementIndex: 14, validationInfo: { x: 0.53, y: -68 } },
                        { elementId: '1:1593', elementIndex: 15, validationInfo: { x: 0.53, y: -68 } },
                        { elementId: '1:1600', elementIndex: 16, validationInfo: { x: 0.53, y: -68 } },
                    ],
                },
                {
                    componentId: 'Footer',
                    componentPath: '@/components/footer',
                    elements: [{ elementId: '1:1604', elementIndex: 17, validationInfo: { x: 0.2, y: -147 } }],
                },
            ],
        },
    },
};

const App: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('annotation');
    const { design, page, report } = window.__REPORT_DATA__ || MOCK_DATA;

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
