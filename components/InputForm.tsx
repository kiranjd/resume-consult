import React, { useState, useEffect } from 'react';
import { Upload, Briefcase, FileText, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface InputFormProps {
  onSubmit: (targetRole: string, resumeContent: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [targetRole, setTargetRole] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;
  }, []);

  const readPdfText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (err) {
      console.error("PDF Read Error", err);
      throw new Error("Could not read PDF file.");
    }
  };

  const processFile = async (file: File) => {
    setError('');
    setFileName(file.name);
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const text = await readPdfText(file);
        setResumeContent(text);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) setResumeContent(event.target.result as string);
        };
        reader.readAsText(file);
      } else {
        setError('Please upload a .pdf, .txt, or .md file.');
        setFileName(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
      setFileName(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !resumeContent.trim()) {
      setError('Both target role and resume content are required.');
      return;
    }
    onSubmit(targetRole, resumeContent);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-4 py-12 font-sans">
      <div className="max-w-2xl w-full bg-white shadow-paper border-t-4 border-slate-800 p-10 md:p-14">
        
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Initiate Analysis</h2>
          <p className="text-slate-500 text-sm tracking-wide uppercase">Confidential Career Audit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Target Role Input */}
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-bold text-slate-900 uppercase tracking-wider">
              Target Role
            </label>
            <div className="relative">
              <input
                type="text"
                name="role"
                id="role"
                className="block w-full border-0 border-b-2 border-slate-200 bg-slate-50 py-4 px-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-0 transition-colors text-lg"
                placeholder="e.g. Vice President of Product"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Resume Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider">
              Source Material
            </label>
            
            <div className="mt-2">
               <div className="flex items-center justify-center w-full mb-4">
                <label 
                  htmlFor="dropzone-file" 
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed cursor-pointer transition-all ${
                    isDragging ? 'border-slate-800 bg-slate-50' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); }}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-slate-400" />
                        <p className="text-sm text-slate-600"><span className="font-semibold underline">Upload Resume</span> (PDF/TXT)</p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange} 
                      accept=".txt,.md,.pdf" 
                      disabled={isLoading} 
                    />
                </label>
              </div>

              {fileName && (
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 p-3 border-l-4 border-slate-800">
                  <FileText className="w-4 h-4" /> {fileName}
                </div>
              )}

              <textarea
                rows={4}
                className="block w-full border-slate-200 bg-slate-50 p-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-0 text-sm resize-none"
                placeholder="Alternatively, paste raw text here..."
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Analyze & Identify Gaps"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputForm;