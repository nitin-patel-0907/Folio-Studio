import React, { useState, useRef } from 'react';
import { 
  Download, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RefreshCw, 
  Lock,
  Maximize2,
  Minimize2,
  UploadCloud
} from 'lucide-react';
import { ResumeData } from '../types';

interface PortfolioViewProps {
  portfolioHtml: string;
  extractedData?: ResumeData;
  sourceFilename?: string;
  onRegenerate: () => void;
  onEdit?: () => void;
  onUploadNew: () => void;
  isProcessing?: boolean;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolioHtml,
  extractedData,
  sourceFilename = 'resume_document.pdf',
  onRegenerate,
  onEdit,
  onUploadNew,
  isProcessing = false,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullPageMode, setIsFullPageMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleDownloadHtml = () => {
    const blob = new Blob([portfolioHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(extractedData?.name || 'portfolio').replace(/[^a-zA-Z0-9]/g, '_')}_Portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Standalone open in new tab
  const handleViewFullPage = () => {
    const blob = new Blob([portfolioHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const cleanSlug = (extractedData?.name || 'alex-vance')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Immersive 100% fullscreen modal
  if (isFullPageMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAF9] flex flex-col">
        {/* Floating Top Control Bar */}
        <div className="bg-white/95 backdrop-blur-md border-b border-[#E5ECE8] px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFullPageMode(false)}
              className="px-3 py-1.5 rounded-lg border border-[#E5ECE8] bg-white hover:bg-[#F8FAF9] text-xs font-semibold text-[#111111] flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Minimize2 className="w-3.5 h-3.5 text-[#087A5B]" />
              <span>Exit Fullscreen</span>
            </button>
            <span className="text-xs text-[#8A9691] font-mono hidden sm:inline">
              Viewing portfolio for {extractedData?.name || 'Candidate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleViewFullPage}
              className="px-3 py-1.5 rounded-lg bg-[#EBF5F1] hover:bg-[#087A5B] text-[#087A5B] hover:text-white border border-[#087A5B]/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Open pure webpage in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab ↗</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 rounded-lg bg-[#087A5B] hover:bg-[#065842] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
          </div>
        </div>

        {/* 100% Full-Viewport Iframe */}
        <div className="flex-1 w-full h-full bg-[#F8FAF9]">
          <iframe
            id="portfolio-fullpage-iframe"
            ref={iframeRef}
            srcDoc={portfolioHtml}
            title="Generated Standalone Portfolio"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-[#E5ECE8] bg-white shadow-md">
      
      {/* Top Sleek Toolbar for Full Wide Screen Mode */}
      <div className="bg-[#F8FAF9] border-b border-[#E5ECE8] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
        
        {/* Left Side: Window Controls & Page Details */}
        <div className="flex items-center gap-3">
          {/* Window control dots */}
          <div className="hidden sm:flex gap-1.5 items-center">
            <div className="w-3 h-3 rounded-full bg-[#E5ECE8] hover:bg-red-400 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-[#E5ECE8] hover:bg-amber-400 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-[#E5ECE8] hover:bg-emerald-400 transition-colors"></div>
          </div>

          {/* URL address pill */}
          <div className="bg-white border border-[#E5ECE8] px-3.5 py-1.5 rounded-xl text-xs text-[#4B5563] font-mono flex items-center gap-2 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-[#16A36B] shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md font-semibold text-[#111111]">
              folio.app/p/{cleanSlug}
            </span>
          </div>

          <button
            type="button"
            onClick={onUploadNew}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#111111] hover:bg-white rounded-lg border border-transparent hover:border-[#E5ECE8] transition-all"
            title="Upload a new resume"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#087A5B]" />
            <span>New Resume</span>
          </button>
        </div>

        {/* Center / Responsive Device Selectors */}
        <div className="flex items-center bg-white border border-[#E5ECE8] rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              deviceMode === 'desktop' ? 'bg-[#087A5B] text-white shadow-2xs' : 'text-[#8A9691] hover:text-[#111111]'
            }`}
            title="Desktop View (Full Width)"
            aria-label="Desktop Preview"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              deviceMode === 'tablet' ? 'bg-[#087A5B] text-white shadow-2xs' : 'text-[#8A9691] hover:text-[#111111]'
            }`}
            title="Tablet View (768px)"
            aria-label="Tablet Preview"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              deviceMode === 'mobile' ? 'bg-[#087A5B] text-white shadow-2xs' : 'text-[#8A9691] hover:text-[#111111]'
            }`}
            title="Mobile View (375px)"
            aria-label="Mobile Preview"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          
          <button
            id="btn-preview-view-full-page"
            type="button"
            onClick={handleViewFullPage}
            className="px-3 py-1.5 text-[#087A5B] hover:text-white hover:bg-[#087A5B] rounded-xl border border-[#087A5B]/30 bg-[#EBF5F1] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
            title="Open pure portfolio webpage in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab ↗</span>
          </button>

          <button
            id="btn-preview-download"
            type="button"
            onClick={handleDownloadHtml}
            className="px-3.5 py-1.5 bg-[#087A5B] hover:bg-[#065842] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs shadow-[#087A5B]/20 active:scale-[0.98]"
            title="Download standalone HTML file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullPageMode(true)}
            className="p-2 text-[#4B5563] hover:text-[#087A5B] hover:bg-white rounded-xl border border-[#E5ECE8] transition-all flex items-center justify-center shadow-2xs"
            title="Fullscreen Mode"
            aria-label="Expand to Fullscreen View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Main Full-Wide Iframe Viewport Area */}
      <div className="w-full bg-[#F0F4F2] flex justify-center items-stretch overflow-hidden relative min-h-[820px] h-[85vh]">
        <iframe
          id="portfolio-live-iframe"
          ref={iframeRef}
          srcDoc={portfolioHtml}
          title="Generated Portfolio Website"
          className={`h-full border-0 transition-all duration-300 ${
            deviceMode === 'desktop'
              ? 'w-full bg-white'
              : deviceMode === 'tablet'
              ? 'w-[768px] max-w-full border-x border-[#E5ECE8] shadow-2xl bg-white my-2 rounded-t-xl'
              : 'w-[375px] max-w-full border-x border-[#E5ECE8] shadow-2xl bg-white my-2 rounded-t-xl'
          }`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />

        {/* Floating processing indicator during regeneration */}
        {isProcessing && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            <div className="px-4 py-2.5 bg-[#111111] text-white text-xs rounded-full shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
              <RefreshCw className="w-3.5 h-3.5 text-[#2ECC71] animate-spin" />
              <span className="font-medium tracking-wide">Regenerating portfolio...</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
