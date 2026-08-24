import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, ArrowRight, FileCode, ClipboardPaste, ShieldCheck, HelpCircle } from 'lucide-react';
import { SAMPLE_RESUMES } from '../services/sampleResumes';
import { SampleResume } from '../types';

interface UploadZoneProps {
  onProcessFile: (file: File) => void;
  onProcessText: (text: string, filename?: string) => void;
  onSelectSample: (sample: SampleResume) => void;
  isProcessing: boolean;
  activeSampleId?: string;
  isDevMode?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onProcessFile,
  onProcessText,
  onSelectSample,
  isProcessing,
  activeSampleId,
  isDevMode = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onProcessFile(file);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setPastedText(clipText);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or not supported', err);
    }
  };

  const handleLoadSampleToTextarea = () => {
    const validSample = SAMPLE_RESUMES.find(s => s.expectedResult === 'pass') || SAMPLE_RESUMES[0];
    setPastedText(validSample.content);
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedText.trim().length >= 20) {
      onProcessText(pastedText, 'pasted_resume.txt');
    }
  };

  const wordCount = pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0;
  const charCount = pastedText.length;

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5F1] text-[#087A5B] text-xs font-bold tracking-wide uppercase mb-3 border border-[#087A5B]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#087A5B]" />
          <span>Next-Gen Portfolio Builder</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight leading-tight">
          Transform Your Resume into a Modern Portfolio
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed">
          Upload your resume file or paste plain text. Folio extracts your career milestones and compiles a standalone, production-ready developer website.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white border border-[#E5ECE8] rounded-2xl shadow-xs overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-[#E5ECE8] bg-[#F8FAF9]">
          <button
            id="tab-input-upload"
            type="button"
            onClick={() => setInputMode('upload')}
            className={`flex-1 py-3.5 px-4 text-center font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border-b-2 ${
              inputMode === 'upload'
                ? 'border-[#087A5B] text-[#087A5B] bg-white'
                : 'border-transparent text-[#4B5563] hover:text-[#111111] hover:bg-white/60'
            }`}
          >
            <Upload className="w-4 h-4 text-[#087A5B]" />
            <span>Upload Resume File (.pdf, .txt)</span>
          </button>

          <button
            id="tab-input-paste"
            type="button"
            onClick={() => setInputMode('paste')}
            className={`flex-1 py-3.5 px-4 text-center font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border-b-2 ${
              inputMode === 'paste'
                ? 'border-[#087A5B] text-[#087A5B] bg-white'
                : 'border-transparent text-[#4B5563] hover:text-[#111111] hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4 text-[#087A5B]" />
            <span>Paste Resume Text Directly</span>
          </button>
        </div>

        {/* Tab 1: File Drag & Drop Upload */}
        {inputMode === 'upload' ? (
          <div className="p-6 sm:p-10">
            <div
              id="dropzone-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 bg-[#F8FAF9] hover:bg-white ${
                isDragOver
                  ? 'border-[#087A5B] bg-[#EBF5F1] scale-[1.005]'
                  : 'border-[#C9D8D0] hover:border-[#087A5B]/60'
              } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                id="file-upload-input"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5ECE8] flex items-center justify-center text-[#087A5B] mb-4 shadow-xs group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8 text-[#087A5B]" />
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#111111]">
                  {isDragOver ? 'Drop your resume file here' : 'Click to browse or drag & drop resume file'}
                </h3>
                
                <p className="text-xs sm:text-sm text-[#4B5563] mt-1.5 mb-4">
                  Supported formats: <strong className="text-[#111111]">PDF (.pdf)</strong> or <strong className="text-[#111111]">Text (.txt)</strong> only
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-[#087A5B] text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-[#065842] active:scale-[0.98] transition-all"
                  >
                    Select PDF / TXT File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputMode('paste');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#E5ECE8] text-[#111111] text-xs sm:text-sm font-semibold hover:bg-[#F8FAF9] active:scale-[0.98] transition-colors"
                  >
                    Or Paste Text
                  </button>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-1.5 text-xs text-[#8A9691]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16A36B]" />
                    <span>Multi-layer resume verification. Non-resume documents will be rejected.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Direct Resume Text Input Area */
          <form onSubmit={handlePasteSubmit} className="p-6 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Resume Plain Text
                </span>
                <span className="text-[11px] text-[#8A9691]">
                  (Paste your complete career history below)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-3 py-1.5 rounded-lg bg-[#F8FAF9] hover:bg-[#EBF5F1] text-xs font-semibold text-[#087A5B] border border-[#E5ECE8] flex items-center gap-1.5 transition-colors"
                  title="Paste directly from your clipboard"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>{copiedNotification ? 'Pasted!' : 'Paste Clipboard'}</span>
                </button>

                {isDevMode && (
                  <button
                    type="button"
                    onClick={handleLoadSampleToTextarea}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAF9] hover:bg-[#E5ECE8] text-xs font-semibold text-[#111111] border border-[#E5ECE8] flex items-center gap-1.5 transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-[#087A5B]" />
                    <span>Load Sample</span>
                  </button>
                )}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                id="pasted-resume-textarea"
                rows={11}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your complete resume text here (summary, work history, skills, education, contact info)..."
                className="w-full p-4 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs sm:text-sm font-sans text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white resize-y leading-relaxed"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#E5ECE8]">
              <div className="flex items-center gap-3 text-xs text-[#8A9691]">
                <span className="font-medium">
                  {charCount} characters • {wordCount} words
                </span>
                <span>•</span>
                <span className={charCount >= 150 ? 'text-[#087A5B] font-semibold' : 'text-amber-600'}>
                  {charCount >= 150 ? 'Ready to generate' : 'Minimum 150 characters recommended'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {pastedText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPastedText('')}
                    className="px-3 py-2 text-xs text-[#8A9691] hover:text-red-600 font-medium transition-colors"
                  >
                    Clear text
                  </button>
                )}

                <button
                  id="btn-submit-pasted-resume"
                  type="submit"
                  disabled={pastedText.trim().length < 20 || isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-[#087A5B] hover:bg-[#065842] text-white text-xs sm:text-sm font-semibold disabled:opacity-50 transition-all flex items-center gap-2 shadow-xs active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Validating...' : 'Validate & Generate Portfolio'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>

      {/* QA Test Scenarios in Dev Mode */}
      {isDevMode && (
        <div className="bg-white border border-[#E5ECE8] rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#087A5B]" />
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#111111]">
                QA Test Scenarios (Dev Mode)
              </h3>
            </div>
            <span className="text-xs text-[#8A9691]">
              Rapid test fixture benchmarks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_RESUMES.map((sample) => {
              const isSelected = activeSampleId === sample.id;
              const isPass = sample.expectedResult === 'pass';
              
              return (
                <button
                  key={sample.id}
                  id={`sample-card-${sample.id}`}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  disabled={isProcessing}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative ${
                    isSelected
                      ? 'border-[#087A5B] bg-[#EBF5F1] ring-1 ring-[#087A5B]'
                      : 'border-[#E5ECE8] bg-[#F8FAF9] hover:bg-white hover:border-[#087A5B]/50 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-xs text-[#111111] line-clamp-1">
                      {sample.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        isPass
                          ? 'bg-[#EBF5F1] text-[#087A5B]'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {sample.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-[#087A5B]">
                    <span className="text-[#8A9691] font-mono text-[10px]">{sample.filename}</span>
                    <span className="inline-flex items-center gap-1 font-semibold">
                      Run Test <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
