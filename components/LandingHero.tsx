import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  onStart: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      {/* Navigation / Brand Header */}
      <header className="pt-8 px-6 md:px-12">
         <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
            <div className="text-2xl font-serif font-black tracking-tight text-slate-900">RESUMAKE<span className="text-slate-400">.AI</span></div>
            <div className="hidden md:block text-sm font-medium text-slate-500 tracking-widest uppercase">Executive Career Strategy</div>
         </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-5xl mx-auto">
        
        <div className="mb-8 inline-block border border-slate-300 px-4 py-1.5 bg-white text-xs font-bold tracking-widest uppercase text-slate-500">
            The Intelligent Way to Pivot
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
          You are capable.<br/>
          <span className="text-slate-400 italic">Your resume is just quiet.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          We don't just rewrite your resume. We perform a <strong>strategic audit</strong> of your career history, identify the gap between you and the role, and architect a narrative that bridges it.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <button
            onClick={onStart}
            className="bg-slate-900 text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3"
          >
            Begin Consultation <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-slate-400 text-sm">No sign-up required. Immediate analysis.</span>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white py-16">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div>
                <div className="text-4xl font-serif font-bold text-slate-200 mb-4">01</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">The Audit</h3>
                <p className="text-slate-600 leading-relaxed text-sm">We analyze your history against market standards, identifying specifically where your current profile undersells your potential.</p>
            </div>
            <div>
                <div className="text-4xl font-serif font-bold text-slate-200 mb-4">02</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">The Strategy</h3>
                <p className="text-slate-600 leading-relaxed text-sm">We categorize improvements into Narrative, Impact, and Alignment buckets, explaining exactly <em>why</em> each change matters.</p>
            </div>
            <div>
                <div className="text-4xl font-serif font-bold text-slate-200 mb-4">03</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">The Execution</h3>
                <p className="text-slate-600 leading-relaxed text-sm">We draft a professional, ATS-compliant document using classic typography and clean formatting that respects the reader's time.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LandingHero;