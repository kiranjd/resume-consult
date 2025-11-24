import React, { useRef, useState, useEffect } from 'react';
import { Printer, ArrowLeft, AlertTriangle, CheckCircle2, Search, BookOpen, ExternalLink, FileEdit, Copy, X, Columns, FileText, Sparkles, Wand2 } from 'lucide-react';
import { OptimizationResponse, ResumeData } from '../types';

interface ResultsViewProps {
  data: OptimizationResponse;
  originalContent: string;
  onReset: () => void;
  onRefine: (instruction: string, selectedText: string) => Promise<void>;
  isRefining: boolean;
}

// --- A4 & Pagination Constants ---
const A4_HEIGHT_PX = 1123; // Approx height at 96 DPI
const PAGE_PADDING_PX = 80; 
const CONTENT_HEIGHT = A4_HEIGHT_PX - (PAGE_PADDING_PX * 2);

const ResultsView: React.FC<ResultsViewProps> = ({ data, originalContent, onReset, onRefine, isRefining }) => {
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'split'>('single');
  const [pages, setPages] = useState<React.ReactNode[][]>([]);
  
  // Inline Editing State
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [refineInput, setRefineInput] = useState('');
  
  const { analysis, optimizedResume: resume, changeOverview } = data;

  // --- Inline Editing Logic ---
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setSelectionRect(null);
      setSelectedText('');
      return;
    }

    // Check if selection is inside the resume container
    const container = document.getElementById('resume-preview-container');
    if (container && container.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionRect(rect);
        setSelectedText(selection.toString());
    } else {
        setSelectionRect(null);
    }
  };

  const submitRefinement = async () => {
    if (!refineInput.trim() || !selectedText) return;
    await onRefine(refineInput, selectedText);
    setSelectionRect(null);
    setSelectedText('');
    setRefineInput('');
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // --- Pagination Logic ---
  // This effectively chunks the resume data into visual pages
  useEffect(() => {
    const generatePages = () => {
        const newPages: React.ReactNode[][] = [];
        let currentPage: React.ReactNode[] = [];
        let currentHeight = 0;

        const addToPage = (node: React.ReactNode, estimatedHeight: number) => {
            if (currentHeight + estimatedHeight > CONTENT_HEIGHT) {
                newPages.push(currentPage);
                currentPage = [node];
                currentHeight = estimatedHeight;
            } else {
                currentPage.push(node);
                currentHeight += estimatedHeight;
            }
        };

        // 1. Header (Always top of Page 1)
        currentPage.push(
             <div key="header" className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                <h1 className="text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight mb-2">{resume.header.fullName}</h1>
                {resume.header.title && <div className="text-lg text-blue-600 font-bold mb-2">{resume.header.title}</div>}
                <div className="text-sm text-slate-600">
                    {[resume.header.location, resume.header.phone, resume.header.email, resume.header.linkedinUrl].filter(Boolean).join(' | ')}
                </div>
            </div>
        );
        currentHeight += 150; // Approx height

        // 2. Summary
        if (resume.summary) {
            const summaryNode = (
                <div key="summary" className="mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Professional Summary</h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
                </div>
            );
            addToPage(summaryNode, 100);
        }

        // 3. Skills
        if (resume.skills.length > 0) {
             const skillsNode = (
                <div key="skills" className="mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Core Competencies</h2>
                    <div className="flex flex-wrap gap-y-1 gap-x-3 text-sm text-slate-700">
                        {resume.skills.map((skill, i) => (
                            <span key={i}>• {skill}</span>
                        ))}
                    </div>
                </div>
             );
             addToPage(skillsNode, 80 + (resume.skills.length / 3 * 20));
        }

        // 4. Experience
        if (resume.experience.length > 0) {
             // Title
             currentPage.push(
                 <h2 key="exp-title" className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 mt-4">Professional Experience</h2>
             );
             currentHeight += 40;

             resume.experience.forEach((job, idx) => {
                 const jobHeight = 60 + (job.achievements.length * 24); // Approx calc
                 const jobNode = (
                    <div key={`job-${idx}`} className="mb-5">
                        <div className="flex justify-between items-baseline mb-1">
                            <div className="font-bold text-slate-900">{job.company}</div>
                            <div className="font-bold text-slate-900 text-sm">{job.dateRange}</div>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                            <div className="italic text-slate-800">{job.role}</div>
                            <div className="text-xs text-slate-500 italic">{job.location}</div>
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                            {job.achievements.map((ach, ai) => (
                                <li key={ai} className="text-sm text-slate-700 pl-1">{ach}</li>
                            ))}
                        </ul>
                    </div>
                 );
                 addToPage(jobNode, jobHeight);
             });
        }

        // 5. Education
        if (resume.education.length > 0) {
            const eduTitle = (
                 <h2 key="edu-title" className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 mt-4">Education</h2>
            );
             if (currentHeight + 40 > CONTENT_HEIGHT) {
                newPages.push(currentPage);
                currentPage = [eduTitle];
                currentHeight = 40;
             } else {
                 currentPage.push(eduTitle);
                 currentHeight += 40;
             }

            resume.education.forEach((edu, idx) => {
                 const eduNode = (
                    <div key={`edu-${idx}`} className="mb-4">
                         <div className="flex justify-between items-baseline">
                            <div className="font-bold text-slate-900">{edu.institution}</div>
                            <div className="font-bold text-slate-900 text-sm">{edu.dateRange}</div>
                        </div>
                        <div className="italic text-slate-800 text-sm">{edu.degree}</div>
                        {edu.details && <div className="text-xs text-slate-600 mt-1">{edu.details}</div>}
                    </div>
                 );
                 addToPage(eduNode, 60);
            });
        }

        newPages.push(currentPage);
        setPages(newPages);
    };

    generatePages();
  }, [resume]);


  const handlePrint = () => {
    window.print();
  };

  const handleGoogleDocs = async () => {
    const container = document.getElementById('resume-full-content'); // We need a hidden container with full content for copy
    if (container) {
        try {
            const content = container.innerHTML;
            const blob = new Blob([content], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([clipboardItem]);
            setShowDocsModal(true);
        } catch (err) {
            console.error('Clipboard error', err);
            alert('Could not copy to clipboard. Please select text manually.');
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100" onMouseUp={handleMouseUp}>
      
      {/* --- Inline Edit Popover --- */}
      {selectionRect && (
        <div 
            className="fixed z-50 bg-slate-900 text-white p-3 rounded-lg shadow-2xl flex gap-2 items-center animate-in fade-in zoom-in duration-200"
            style={{ 
                top: `${selectionRect.top - 60}px`, 
                left: `${Math.min(window.innerWidth - 320, Math.max(20, selectionRect.left))}px`,
                width: '320px'
            }}
        >
            <Wand2 className="w-4 h-4 text-purple-400 animate-pulse" />
            <input 
                autoFocus
                type="text" 
                className="bg-slate-800 border-none rounded px-2 py-1 text-sm text-white focus:ring-1 focus:ring-purple-400 w-full placeholder:text-slate-400"
                placeholder="E.g. Make this punchier..."
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitRefinement()}
            />
            <button 
                onClick={submitRefinement}
                className="bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
            >
                Fix
            </button>
        </div>
      )}

      {/* Header - No Print */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Optimization Results</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-1 rounded-lg flex items-center mr-4 border border-slate-200">
                <button 
                  onClick={() => setViewMode('single')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FileText className="w-3 h-3" /> Result
                </button>
                <button 
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Columns className="w-3 h-3" /> Compare
                </button>
             </div>

            <button 
              onClick={handleGoogleDocs}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <FileEdit className="w-4 h-4" /> Open in Google Docs
            </button>
            <button 
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Google Docs Instruction Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setShowDocsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Content Copied!</h3>
            <p className="text-gray-600 mb-6">Paste (Ctrl+V) into a new Google Doc to begin editing.</p>
            <a href="https://docs.new" target="_blank" rel="noreferrer" className="px-5 py-2 bg-blue-600 text-white rounded-lg flex justify-center items-center gap-2 font-bold">
                Open New Doc <ExternalLink className="w-4 h-4"/>
            </a>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-500 ${viewMode === 'split' ? 'max-w-[95vw]' : ''}`}>
        
        {/* Refining Overlay */}
        {isRefining && (
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center cursor-wait">
                <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-lg font-bold text-slate-800">Refining Resume...</p>
                    <p className="text-slate-500">Applying your changes strategically</p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR - Hidden in Print */}
            {viewMode === 'single' && (
                 <div className="lg:col-span-4 space-y-6 no-print">
                 {/* Change Overview */}
                 <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-600">
                     <div className="flex items-center gap-2 mb-3">
                         <Sparkles className="w-5 h-5 text-blue-600" />
                         <h3 className="text-lg font-bold text-gray-900">Latest Changes</h3>
                     </div>
                     <p className="text-sm text-slate-600 leading-relaxed">{changeOverview}</p>
                 </div>

                 {/* Categories Breakdown */}
                 <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-900">Optimization Categories</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-purple-100 p-1.5 rounded text-purple-600"><BookOpen className="w-4 h-4"/></div>
                                <span className="font-semibold text-sm text-slate-800">Skill Gaps</span>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-10">
                                {analysis.hardSkillGaps.slice(0, 3).map((g,i) => (
                                    <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">{g}</span>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-100 p-1.5 rounded text-green-600"><Search className="w-4 h-4"/></div>
                                <span className="font-semibold text-sm text-slate-800">ATS Optimization</span>
                            </div>
                             <div className="flex flex-wrap gap-2 pl-10">
                                {analysis.missingKeywords.length > 0 ? analysis.missingKeywords.slice(0,3).map((k,i) => (
                                    <span key={i} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">{k}</span>
                                )) : <span className="text-xs text-slate-400">Optimized</span>}
                            </div>
                        </div>
                    </div>
                 </div>
               </div>
            )}

            {/* RIGHT / CENTER COLUMN - RESUME PREVIEW */}
            <div className={`${viewMode === 'single' ? 'lg:col-span-8' : 'lg:col-span-12 flex gap-8'}`}>
                
                {viewMode === 'split' && (
                    <div className="w-1/2 bg-slate-200 rounded p-8 overflow-y-auto h-[800px] border border-slate-300 shadow-inner">
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 sticky top-0">Original Source</h3>
                         <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700">{originalContent}</pre>
                    </div>
                )}

                <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'}`} id="resume-preview-container">
                     {/* Visual Pagination Render */}
                     <div className="print:hidden flex flex-col gap-8 items-center">
                        {pages.map((pageContent, pageIndex) => (
                            <div 
                                key={pageIndex}
                                className="bg-white shadow-2xl relative transition-transform hover:scale-[1.005]"
                                style={{ 
                                    width: '210mm', 
                                    minHeight: '297mm', 
                                    padding: '40px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {pageContent}
                                <div className="absolute bottom-4 right-8 text-xs text-slate-300 font-mono">Page {pageIndex + 1}</div>
                            </div>
                        ))}
                     </div>

                    {/* Hidden Full Content for Printing & Copying */}
                    {/* This maps exactly to the logic above but in one continuous flow for the print driver to paginate */}
                     <div id="resume-full-content" className="hidden print:block bg-white w-full h-auto p-[40px]">
                        <style>{`
                            @media print {
                                @page { margin: 0; size: auto; }
                                body { background: white; }
                                .print\\:block { display: block !important; }
                                .no-print { display: none !important; }
                                /* Ensure breaks happen nicely */
                                h1, h2, h3 { break-after: avoid; }
                                div { break-inside: avoid; }
                            }
                        `}</style>
                        {/* Re-render full content for print stream */}
                        <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                            <h1 className="text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight mb-2">{resume.header.fullName}</h1>
                             {resume.header.title && <div className="text-lg text-blue-600 font-bold mb-2">{resume.header.title}</div>}
                            <div className="text-sm text-slate-600">
                                {[resume.header.location, resume.header.phone, resume.header.email, resume.header.linkedinUrl].filter(Boolean).join(' | ')}
                            </div>
                        </div>
                        <div className="mb-6">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Professional Summary</h2>
                            <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
                        </div>
                        <div className="mb-6">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">Core Competencies</h2>
                             <div className="flex flex-wrap gap-y-1 gap-x-3 text-sm text-slate-700">
                                {resume.skills.map((skill, i) => <span key={i}>• {skill}</span>)}
                            </div>
                        </div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 mt-4">Professional Experience</h2>
                        {resume.experience.map((job, idx) => (
                            <div key={`p-job-${idx}`} className="mb-5">
                                <div className="flex justify-between items-baseline mb-1">
                                    <div className="font-bold text-slate-900">{job.company}</div>
                                    <div className="font-bold text-slate-900 text-sm">{job.dateRange}</div>
                                </div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <div className="italic text-slate-800">{job.role}</div>
                                    <div className="text-xs text-slate-500 italic">{job.location}</div>
                                </div>
                                <ul className="list-disc pl-5 space-y-1">
                                    {job.achievements.map((ach, ai) => (
                                        <li key={ai} className="text-sm text-slate-700 pl-1">{ach}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 mt-4">Education</h2>
                         {resume.education.map((edu, idx) => (
                            <div key={`p-edu-${idx}`} className="mb-4">
                                <div className="flex justify-between items-baseline">
                                    <div className="font-bold text-slate-900">{edu.institution}</div>
                                    <div className="font-bold text-slate-900 text-sm">{edu.dateRange}</div>
                                </div>
                                <div className="italic text-slate-800 text-sm">{edu.degree}</div>
                                {edu.details && <div className="text-xs text-slate-600 mt-1">{edu.details}</div>}
                            </div>
                        ))}
                     </div>

                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ResultsView;
