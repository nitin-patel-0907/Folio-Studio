import React from 'react';
import { Sparkles, Layers, RefreshCw, FileText, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  currentTab: 'upload' | 'preview' | 'editor';
  onTabChange: (tab: 'upload' | 'preview' | 'editor') => void;
  hasPortfolio: boolean;
  onReset: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  hasPortfolio,
  onReset,
  isProcessing
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5ECE8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onReset}
              className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087A5B] rounded-lg p-0.5"
              title="Folio Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#087A5B] to-[#0A7F5B] flex items-center justify-center text-white shadow-sm shadow-[#087A5B]/20 transition-transform group-hover:scale-[1.03]">
                <div className="w-4 h-4 border-2 border-white/90 rounded-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-xs"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-xl font-bold tracking-tight text-[#111111] leading-none">
                    Folio
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#EBF5F1] text-[#087A5B] border border-[#087A5B]/20">
                    Studio
                  </span>
                </div>
                <span className="text-[11px] text-[#8A9691] font-medium hidden md:block">
                  Resume to Portfolio
                </span>
              </div>
            </button>
          </div>

          {/* Segmented Modern Navigation Control */}
          <nav 
            aria-label="Main Navigation"
            className="flex items-center p-1 bg-[#F8FAF9] rounded-xl border border-[#E5ECE8] shadow-xs"
          >
            <button
              id="nav-tab-upload"
              type="button"
              onClick={() => onTabChange('upload')}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087A5B] ${
                currentTab === 'upload'
                  ? 'bg-white text-[#087A5B] shadow-xs font-semibold border border-[#E5ECE8]'
                  : 'text-[#4B5563] hover:text-[#111111] hover:bg-white/60'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${currentTab === 'upload' ? 'text-[#087A5B]' : 'text-[#8A9691]'}`} />
              <span>Upload & Validate</span>
              {isProcessing && (
                <RefreshCw className="w-3 h-3 text-[#087A5B] animate-spin ml-0.5" />
              )}
            </button>

            <button
              id="nav-tab-preview"
              type="button"
              disabled={!hasPortfolio}
              onClick={() => onTabChange('preview')}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087A5B] ${
                !hasPortfolio
                  ? 'opacity-40 cursor-not-allowed text-[#8A9691]'
                  : currentTab === 'preview'
                  ? 'bg-white text-[#087A5B] shadow-xs font-semibold border border-[#E5ECE8]'
                  : 'text-[#4B5563] hover:text-[#111111] hover:bg-white/60'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${currentTab === 'preview' ? 'text-[#087A5B]' : 'text-[#8A9691]'}`} />
              <span>Portfolio Preview</span>
              {hasPortfolio && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A36B] shadow-xs" title="Ready" />
              )}
            </button>

            <button
              id="nav-tab-editor"
              type="button"
              disabled={!hasPortfolio}
              onClick={() => onTabChange('editor')}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 items-center gap-2 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087A5B] hidden sm:flex ${
                !hasPortfolio
                  ? 'opacity-40 cursor-not-allowed text-[#8A9691]'
                  : currentTab === 'editor'
                  ? 'bg-white text-[#087A5B] shadow-xs font-semibold border border-[#E5ECE8]'
                  : 'text-[#4B5563] hover:text-[#111111] hover:bg-white/60'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${currentTab === 'editor' ? 'text-[#087A5B]' : 'text-[#8A9691]'}`} />
              <span>Content & JSON</span>
            </button>
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {hasPortfolio ? (
              <button
                id="btn-header-reset"
                type="button"
                onClick={onReset}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#087A5B] bg-[#EBF5F1] hover:bg-[#DDF0E8] border border-[#087A5B]/20 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-[0.98]"
                title="Start over with a new resume"
              >
                <RefreshCw className="w-3 h-3 text-[#087A5B]" />
                <span>New Resume</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-2 text-xs text-[#8A9691]">
                <span className="w-2 h-2 rounded-full bg-[#16A36B] animate-pulse"></span>
                <span>Ready to build</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
