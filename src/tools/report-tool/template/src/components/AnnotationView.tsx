import React, { useRef } from 'react';
// import { AlertCircle } from 'lucide-react';

interface AnnotationViewProps {
    designUrl: string;
    pageUrl: string;
}

const AnnotationView: React.FC<AnnotationViewProps> = ({ designUrl, pageUrl }) => {
    const designRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);
    const isSyncingDesign = useRef(false);
    const isSyncingPage = useRef(false);

    const handleDesignScroll = () => {
        if (!designRef.current || !pageRef.current) return;
        if (isSyncingDesign.current) {
            isSyncingDesign.current = false;
            return;
        }

        isSyncingPage.current = true;
        pageRef.current.scrollTop = designRef.current.scrollTop;
        pageRef.current.scrollLeft = designRef.current.scrollLeft;
    };

    const handlePageScroll = () => {
        if (!designRef.current || !pageRef.current) return;
        if (isSyncingPage.current) {
            isSyncingPage.current = false;
            return;
        }

        isSyncingDesign.current = true;
        designRef.current.scrollTop = pageRef.current.scrollTop;
        designRef.current.scrollLeft = pageRef.current.scrollLeft;
    };

    return (
        <div className="flex h-full w-full gap-4">
            {/* Left: Design Mockup */}
            <div className="flex-1 flex flex-col min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Design</span>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
                <div 
                    ref={designRef}
                    onScroll={handleDesignScroll}
                    className="flex-1 relative overflow-auto bg-slate-100/50"
                >
                    <img src={designUrl} alt="Design" className="w-full h-auto object-contain object-top" />
                </div>
            </div>

            {/* Right: Live Iframe */}
            <div className="flex-1 flex flex-col min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Page</span>
                        <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 bg-slate-200 rounded">
                            Rectangle indicates positional mismatch
                        </span>
                    </div>
                    {/* <a href={liveUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <ExternalLink size={14} />
                    </a> */}
                </div>
                <div 
                    ref={pageRef}
                    onScroll={handlePageScroll}
                    className="flex-1 relative overflow-auto bg-white"
                >
                    <img src={pageUrl} alt="Design" className="w-full h-auto object-contain object-top" />
                    {/* Fallback overlay for demo purposes since localhost might not be running for the user */}
                    {/* <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-slate-900/5">
                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                            <AlertCircle size={14} />
                            Ensure {liveUrl} is running
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default AnnotationView;
