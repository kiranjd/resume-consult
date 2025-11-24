import React, { useState } from 'react';
import { InitialAnalysis, StrategicSuggestion, StrategyCategory } from '../types';
import { ArrowRight, Check, AlertCircle, PenTool, BookOpen, Cpu } from 'lucide-react';

interface AnalysisReviewProps {
  analysis: InitialAnalysis;
  targetRole: string;
  onProceed: (userAnswers: Record<string, string>, selectedStrategyIds: string[]) => void;
}

interface StrategyItemProps {
  item: StrategicSuggestion;
  isSelected: boolean;
  onToggle: () => void;
}

const StrategyItem: React.FC<StrategyItemProps> = ({ item, isSelected, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`group flex items-start gap-4 p-4 cursor-pointer border transition-all duration-200 ${
      isSelected ? 'border-slate-800 bg-white' : 'border-transparent opacity-50 hover:opacity-100'
    }`}
  >
    <div className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors ${
      isSelected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-400 bg-transparent'
    }`}>
      {isSelected && <Check className="h-3 w-3" />}
    </div>
    <div>
      <h4 className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</h4>
      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
      <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wide">Benefit: {item.benefit}</p>
    </div>
  </div>
);

const AnalysisReview: React.FC<AnalysisReviewProps> = ({ analysis, targetRole, onProceed }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(
    analysis.strategicSuggestions.map(s => s.id)
  );

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const toggleStrategy = (id: string) => {
    setSelectedStrategies(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    onProceed(answers, selectedStrategies);
  };

  const strategiesByCategory = {
    Formatting: analysis.strategicSuggestions.filter(s => s.category === 'Formatting & Tone'),
    Skills: analysis.strategicSuggestions.filter(s => s.category === 'Skill Gaps'),
    ATS: analysis.strategicSuggestions.filter(s => s.category === 'ATS & Systems'),
  };

  return (
    <div className="min-h-screen bg-[#e5e5e5] py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      
      {/* The Paper Document Container */}
      <div className="max-w-4xl mx-auto bg-paper shadow-paper min-h-[800px] p-12 md:p-16 relative border-t-4 border-slate-800">
        
        {/* Letterhead */}
        <div className="border-b-2 border-slate-800 pb-8 mb-12">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Strategy Audit</h1>
              <p className="text-slate-600 mt-2 font-serif italic">Prepared for the role of {targetRole}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Match Potential</div>
              <div className="text-5xl font-serif font-black text-slate-900">{analysis.matchScore}<span className="text-2xl text-slate-400 font-normal">/100</span></div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="mb-16">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">01. Executive Summary</h2>
          <div className="prose prose-lg text-slate-800 font-serif leading-relaxed max-w-none">
            <p>{analysis.executiveSummary}</p>
          </div>
        </div>

        {/* Section 2: The Plan (Buckets) */}
        <div className="mb-16">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">02. Strategic Roadmap</h2>
          <p className="text-slate-600 mb-8 italic border-l-2 border-accent pl-4">
            We have identified specific pivots required to position you as a top-tier candidate. Uncheck any you disagree with.
          </p>

          <div className="space-y-10">
            
            {/* Bucket: Formatting & Tone */}
            {strategiesByCategory.Formatting.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
                   <div className="bg-blue-100 p-2 rounded text-blue-700"><PenTool className="w-5 h-5" /></div>
                   <h3 className="text-xl font-serif font-bold text-slate-900">Formatting & Tone</h3>
                </div>
                <div className="space-y-4">
                  {strategiesByCategory.Formatting.map(s => (
                    <StrategyItem key={s.id} item={s} isSelected={selectedStrategies.includes(s.id)} onToggle={() => toggleStrategy(s.id)} />
                  ))}
                </div>
              </div>
            )}

             {/* Bucket: Skill Gaps */}
             {strategiesByCategory.Skills.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
                   <div className="bg-purple-100 p-2 rounded text-purple-700"><BookOpen className="w-5 h-5" /></div>
                   <h3 className="text-xl font-serif font-bold text-slate-900">Skill Gaps & Evidence</h3>
                </div>
                <div className="space-y-4">
                  {strategiesByCategory.Skills.map(s => (
                    <StrategyItem key={s.id} item={s} isSelected={selectedStrategies.includes(s.id)} onToggle={() => toggleStrategy(s.id)} />
                  ))}
                </div>
              </div>
            )}

             {/* Bucket: ATS */}
             {strategiesByCategory.ATS.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
                   <div className="bg-green-100 p-2 rounded text-green-700"><Cpu className="w-5 h-5" /></div>
                   <h3 className="text-xl font-serif font-bold text-slate-900">ATS & Systems</h3>
                </div>
                <div className="space-y-4">
                  {strategiesByCategory.ATS.map(s => (
                    <StrategyItem key={s.id} item={s} isSelected={selectedStrategies.includes(s.id)} onToggle={() => toggleStrategy(s.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Missing Data */}
        <div className="mb-16 p-8 -mx-8 border-t border-b border-slate-200 bg-white">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">03. Required Information</h2>
          <div className="space-y-8">
            {analysis.clarificationQuestions.map((q, idx) => (
              <div key={q.id}>
                <label className="block font-serif text-lg font-medium text-slate-900 mb-2">
                  <span className="text-slate-400 mr-2">{idx + 1}.</span> {q.question}
                </label>
                <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                   <AlertCircle className="w-3 h-3" /> {q.context}
                </p>
                <input
                  type="text"
                  className="block w-full border-0 border-b-2 border-slate-300 bg-transparent py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-0 sm:text-sm transition-colors"
                  placeholder="Enter details here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Action */}
        <div className="flex items-center justify-between pt-8">
          <p className="text-slate-500 italic font-serif text-sm">
            By proceeding, we will draft your document based on the strategy above.
          </p>
          <button
            onClick={handleSubmit}
            className="group relative inline-flex items-center gap-3 bg-slate-900 px-8 py-4 text-white hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="font-bold tracking-wide uppercase text-sm">Execute Strategy</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AnalysisReview;
