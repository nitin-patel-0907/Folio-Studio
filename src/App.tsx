import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ValidationMonitor } from './components/ValidationMonitor';
import { PortfolioView } from './components/PortfolioView';
import { PortfolioEditor } from './components/PortfolioEditor';
import { ResumeData, SampleResume } from './types';
import { parseResumeTextClient, validateResumeTextClient } from './utils/clientResumeParser';
import { extractTextFromPdf } from './utils/pdfExtractor';
import { buildPortfolioHtml } from './services/portfolioBuilder';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'upload' | 'preview' | 'editor'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | undefined>(undefined);
  const [isDevMode, setIsDevMode] = useState(false);

  const [extractedData, setExtractedData] = useState<ResumeData | null>(null);
  const [portfolioHtml, setPortfolioHtml] = useState<string | null>(null);
  const [currentResumeText, setCurrentResumeText] = useState<string>('');
  const [currentFilename, setCurrentFilename] = useState<string>('resume_document.pdf');
  const [activeSampleId, setActiveSampleId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setIsDevMode(urlParams.get('dev') === 'true');
    }
  }, []);

  const resetValidationState = () => {
    setRejectionReason(undefined);
  };

  const sanitizeErrorMessage = (raw: string): string => {
    if (!raw) return 'Unable to verify document as a genuine resume.';
    return raw
      .replace(/Layer\s*\d+\s*(check|heuristics|classifier|validation)?:?/gi, '')
      .replace(/score\s*\d+\/\d+/gi, '')
      .replace(/HTTP\s*\d+/gi, '')
      .replace(/failed:?/gi, '')
      .trim() || "This document doesn't appear to be a resume.";
  };

  const safeParseResponse = async (response: Response): Promise<{ valid: boolean; isHttpError?: boolean; status?: number; [key: string]: any }> => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const json = await response.json();
        return { ...json, status: response.status };
      } catch {
        return { valid: false, isHttpError: true, status: response.status, rejectionReason: 'Invalid JSON received from server.' };
      }
    }
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return { ...json, status: response.status };
    } catch {
      return {
        valid: false,
        isHttpError: true,
        status: response.status,
        rejectionReason: response.ok
          ? 'Server communication error. Please try again.'
          : `Server returned HTTP status ${response.status}.`
      };
    }
  };

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    resetValidationState();
    setActiveSampleId(undefined);
    setCurrentFilename(file.name);

    // Client-side quick file extension check: PDF or TXT only
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.txt')) {
      setIsProcessing(false);
      setRejectionReason(`Invalid file format "${file.name.substring(file.name.lastIndexOf('.'))}". Only PDF (.pdf) and Text (.txt) files are supported.`);
      return;
    }

    if (file.size === 0) {
      setIsProcessing(false);
      setRejectionReason('The selected file is empty (0 bytes). Please upload a valid resume.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/validate-and-generate', {
        method: 'POST',
        body: formData,
      });

      const result = await safeParseResponse(response);

      // If server explicitly validated and generated
      if (response.ok && result.valid && result.portfolioHtml) {
        setExtractedData(result.extractedData);
        setPortfolioHtml(result.portfolioHtml);
        setCurrentResumeText(result.cleanedText || '');
        setCurrentTab('preview');
        return;
      }

      // If server returned a semantic validation rejection (e.g. HTTP 422 with validation failure details)
      if (response.status === 422 || (result.valid === false && !result.isHttpError && result.rejectionReason && !result.rejectionReason.includes('HTTP status'))) {
        setRejectionReason(sanitizeErrorMessage(result.rejectionReason || 'Document verification failed. The file is not a resume.'));
        return;
      }

      // If network, 404, 500, HTML response or fallback triggered: run client-side extraction & validation
      try {
        const rawFileText = lowerName.endsWith('.pdf') ? await extractTextFromPdf(file) : await file.text();
        const clientValidation = validateResumeTextClient(rawFileText);
        if (!clientValidation.isValid) {
          setRejectionReason(clientValidation.rejectionReason || 'Unable to verify as a resume.');
          return;
        }

        const clientData = parseResumeTextClient(rawFileText);
        const clientHtml = buildPortfolioHtml(clientData);
        setExtractedData(clientData);
        setPortfolioHtml(clientHtml);
        setCurrentResumeText(rawFileText);
        setCurrentTab('preview');
        return;
      } catch (clientErr) {
        console.error('Client file extraction/validation fallback notice:', clientErr);
        setRejectionReason('Unable to extract text from this document. Please ensure the PDF is not encrypted or upload a text version.');
      }
    } catch (err: any) {
      console.error('File processing error:', err);
      // Client-side local execution on network failure
      try {
        const rawFileText = lowerName.endsWith('.pdf') ? await extractTextFromPdf(file) : await file.text();
        const clientValidation = validateResumeTextClient(rawFileText);
        if (!clientValidation.isValid) {
          setRejectionReason(clientValidation.rejectionReason || 'Unable to verify as a resume.');
          return;
        }

        const clientData = parseResumeTextClient(rawFileText);
        const clientHtml = buildPortfolioHtml(clientData);
        setExtractedData(clientData);
        setPortfolioHtml(clientHtml);
        setCurrentResumeText(rawFileText);
        setCurrentTab('preview');
        return;
      } catch {
        setRejectionReason('Network or connection error. Please try uploading again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessText = async (text: string, filename?: string) => {
    setIsProcessing(true);
    resetValidationState();
    const displayFile = filename || 'pasted_resume.txt';
    setCurrentFilename(displayFile);

    // Initial check on text length
    if (!text || text.trim().length < 50) {
      setIsProcessing(false);
      setRejectionReason('The provided text is too brief (< 50 characters) to be a valid resume.');
      return;
    }

    try {
      const response = await fetch('/api/validate-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, filename: displayFile }),
      });

      const result = await safeParseResponse(response);

      if (response.ok && result.valid && result.portfolioHtml) {
        setExtractedData(result.extractedData);
        setPortfolioHtml(result.portfolioHtml);
        setCurrentResumeText(result.cleanedText || text);
        setCurrentTab('preview');
        return;
      }

      // If server returned an explicit validation rejection (e.g. HTTP 422)
      if (response.status === 422 || (result.valid === false && !result.isHttpError && result.rejectionReason && !result.rejectionReason.includes('HTTP status'))) {
        setRejectionReason(sanitizeErrorMessage(result.rejectionReason || 'Document verification failed. The provided text is not a resume.'));
        return;
      }

      // If server returned 404/500/HTML or network issue, perform client validation & build
      const clientValidation = validateResumeTextClient(text);
      if (!clientValidation.isValid) {
        setRejectionReason(clientValidation.rejectionReason || 'Unable to verify as a resume.');
        return;
      }

      const clientData = parseResumeTextClient(text);
      const clientHtml = buildPortfolioHtml(clientData);
      setExtractedData(clientData);
      setPortfolioHtml(clientHtml);
      setCurrentResumeText(text);
      setCurrentTab('preview');
      return;
    } catch (err: any) {
      console.error('Text validation error:', err);
      // Offline / client fallback
      const clientValidation = validateResumeTextClient(text);
      if (!clientValidation.isValid) {
        setRejectionReason(clientValidation.rejectionReason || 'Unable to verify as a resume.');
        return;
      }

      try {
        const clientData = parseResumeTextClient(text);
        const clientHtml = buildPortfolioHtml(clientData);
        setExtractedData(clientData);
        setPortfolioHtml(clientHtml);
        setCurrentResumeText(text);
        setCurrentTab('preview');
      } catch {
        setRejectionReason('Network or connection error. Please try submitting again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSample = (sample: SampleResume) => {
    setActiveSampleId(sample.id);
    setCurrentFilename(sample.filename);
    handleProcessText(sample.content, sample.filename);
  };

  const handleSaveEditedData = async (updatedData: ResumeData) => {
    try {
      const response = await fetch('/api/build-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.portfolioHtml) {
          setExtractedData(updatedData);
          setPortfolioHtml(result.portfolioHtml);
          setCurrentTab('preview');
          return;
        }
      }
    } catch (err) {
      console.error('Failed to update portfolio via API:', err);
    }

    // Client-side instant build fallback
    const clientHtml = buildPortfolioHtml(updatedData);
    setExtractedData(updatedData);
    setPortfolioHtml(clientHtml);
    setCurrentTab('preview');
  };

  const handleRegenerate = () => {
    if (currentResumeText) {
      handleProcessText(currentResumeText, currentFilename);
    }
  };

  const handleReset = () => {
    resetValidationState();
    setExtractedData(null);
    setPortfolioHtml(null);
    setCurrentResumeText('');
    setCurrentFilename('resume_document.pdf');
    setActiveSampleId(undefined);
    setCurrentTab('upload');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#111111] flex flex-col font-sans selection:bg-[#EBF5F1] selection:text-[#087A5B]">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        hasPortfolio={Boolean(portfolioHtml)}
        onReset={handleReset}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className={`${currentTab === 'preview' ? 'w-full max-w-[1700px] px-2 sm:px-4 lg:px-6 py-4' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6'} mx-auto flex-1 w-full space-y-6`}>
        
        {/* Dynamic View rendering */}
        {currentTab === 'upload' && (
          <div className="space-y-6">
            <UploadZone
              onProcessFile={handleProcessFile}
              onProcessText={handleProcessText}
              onSelectSample={handleSelectSample}
              isProcessing={isProcessing}
              activeSampleId={activeSampleId}
              isDevMode={isDevMode}
            />

            {/* Validation Indicator / Rejection Display */}
            <ValidationMonitor
              isProcessing={isProcessing}
              rejectionReason={rejectionReason}
              onRetry={resetValidationState}
            />

            {/* Quick jump banner if portfolio is already generated */}
            {portfolioHtml && !rejectionReason && (
              <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF5F1] flex items-center justify-center text-[#087A5B] border border-[#087A5B]/20 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#16A36B]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#111111]">
                      Portfolio Ready for {extractedData?.name || 'Professional'}
                    </h3>
                    <p className="text-xs text-[#4B5563]">
                      Resume verified. You can view, customize content, or download your standalone webpage.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-jump-to-portfolio"
                  type="button"
                  onClick={() => setCurrentTab('preview')}
                  className="px-4 py-2 bg-[#087A5B] hover:bg-[#065842] active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>View Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {currentTab === 'preview' && portfolioHtml && (
          <PortfolioView
            portfolioHtml={portfolioHtml}
            extractedData={extractedData || undefined}
            sourceFilename={currentFilename}
            onRegenerate={handleRegenerate}
            onEdit={() => setCurrentTab('editor')}
            onUploadNew={handleReset}
            isProcessing={isProcessing}
          />
        )}

        {currentTab === 'editor' && extractedData && (
          <PortfolioEditor
            data={extractedData}
            onSave={handleSaveEditedData}
            onCancel={() => setCurrentTab('preview')}
          />
        )}

      </main>

      {/* App Footer */}
      <footer className="border-t border-[#E5ECE8] bg-white py-6 text-center text-xs text-[#8A9691]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#087A5B] text-sm">Folio</span>
            <span>—</span>
            <span className="font-medium text-[#4B5563]">Turn your resume into a portfolio.</span>
          </div>
          <div>
            <span className="text-[#8A9691] text-[11px]">
              AI-extracted directly from your resume — zero fabricated data.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
