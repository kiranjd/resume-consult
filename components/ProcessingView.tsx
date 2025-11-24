import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, BrainCircuit, FileSearch, Search, PenTool, Layout, UserCog, MessagesSquare } from 'lucide-react';
import { AppStep } from '../types';

interface ProcessingViewProps {
  targetRole: string;
  mode: 'ANALYSIS' | 'GENERATION';
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ targetRole, mode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    {
      label: "Extracting Profile Data",
      description: "Parsing your resume structure and professional history...",
      icon: FileSearch,
    },
    {
      label: "Market Analysis",
      description: `Scanning industry standards for ${targetRole} roles...`,
      icon: Search,
    },
    {
      label: "Gap Identification",
      description: "Detecting where your experience doesn't match the target...",
      icon: BrainCircuit,
    },
    {
      label: "Formulating Strategy",
      description: "Preparing strategic questions for your review...",
      icon: UserCog,
    },
  ];

  const generationSteps = [
    {
      label: "Applying Strategy",
      description: "Integrating your feedback and selected pivots...",
      icon: BrainCircuit,
    },
    {
      label: "Content Optimization",
      description: "Rewriting bullet points with action verbs & metrics...",
      icon: PenTool,
    },
    {
      label: "ATS Formatting",
      description: "Structuring data for automated tracking systems...",
      icon: Layout,
    },
    {
      label: "Final Polish",
      description: "Generating your professional document...",
      icon: CheckCircle2,
    },
  ];

  const steps = mode === 'ANALYSIS' ? analysisSteps : generationSteps;

  useEffect(() => {
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [mode, steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 px-8 py-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'ANALYSIS' ? 'Analyzing Your Gap' : 'Building Your Future'}
          </h2>
          <p className="text-blue-100 mt-2">
            Targeting: <span className="font-semibold text-white">{targetRole}</span>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="px-8 py-8">
          <div className="relative">
             {/* Connecting Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100"></div>

            <div className="space-y-8 relative">
              {steps.map((step, index) => {
                const isCompleted = currentStep > index;
                const isActive = currentStep === index;
                
                const Icon = step.icon;

                return (
                  <div key={index} className={`flex gap-4 transition-all duration-500 ${isActive ? 'scale-105 transform' : 'opacity-70'}`}>
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                        isCompleted ? 'bg-green-100 border-green-500 text-green-600' :
                        isActive ? 'bg-blue-50 border-primary text-primary shadow-lg shadow-blue-100' :
                        'bg-white border-gray-200 text-gray-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : isActive ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <h3 className={`font-semibold text-base ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${
                        isActive ? 'text-primary mt-1' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingView;
