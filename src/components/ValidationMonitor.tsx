import React from 'react';
import { AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface ValidationMonitorProps {
  isProcessing: boolean;
  rejectionReason?: string;
  onRetry?: () => void;
}

export const ValidationMonitor: React.FC<ValidationMonitorProps> = ({
  isProcessing,
  rejectionReason,
  onRetry
}) => {
  if (!isProcessing && !rejectionReason) {
    return null;
  }

  // Helper to sanitize rejection reasons to ensure clean customer-facing messages
  const cleanReason = (reason: string) => {
    return reason
      .replace(/Layer\s*\d+\s*(check|heuristics|classifier|validation)?:?/gi, '')
      .replace(/score\s*\d+\/\d+/gi, '')
      .replace(/HTTP\s*\d+/gi, '')
      .replace(/Gemini AI classification failed:?/gi, '')
      .replace(/Heuristic scoring failed:?/gi, '')
      .trim();
  };

  return (
    <div className="space-y-4">
      {/* Active Processing Indicator */}
      {isProcessing && (
        <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF5F1] flex items-center justify-center text-[#087A5B] border border-[#087A5B]/20">
              <RefreshCw className="w-4 h-4 animate-spin text-[#087A5B]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#111111]">
                Verifying Resume & Generating Portfolio...
              </h3>
              <p className="text-xs text-[#4B5563]">
                Extracting career milestones, skills, and projects with structured AI logic
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#087A5B] bg-[#EBF5F1] px-3 py-1 rounded-full border border-[#087A5B]/20">
            Processing
          </span>
        </div>
      )}

      {/* Rejection Warning Banner (Clean, user-friendly language) */}
      {rejectionReason && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50/90 border border-red-200 text-red-900 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-red-900">
                Unable to verify as a resume
              </h3>
              <p className="text-xs text-red-700 leading-relaxed">
                {cleanReason(rejectionReason)}
              </p>
            </div>
          </div>
          {onRetry && (
            <div className="pt-1 flex justify-end">
              <button
                id="btn-validation-retry"
                type="button"
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-2xs"
              >
                Try Another Resume File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
