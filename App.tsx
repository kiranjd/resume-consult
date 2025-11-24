import React, { useState } from 'react';
import LandingHero from './components/LandingHero';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import ProcessingView from './components/ProcessingView';
import AnalysisReview from './components/AnalysisReview';
import { performInitialAnalysis, generateTailoredResume, refineResumeContent } from './services/geminiService';
import { AppStep, OptimizationResponse, InitialAnalysis } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  
  // State for data persistence across steps
  const [currentTargetRole, setCurrentTargetRole] = useState<string>('');
  const [currentResumeContent, setCurrentResumeContent] = useState<string>('');
  const [initialAnalysis, setInitialAnalysis] = useState<InitialAnalysis | null>(null);
  const [finalResult, setFinalResult] = useState<OptimizationResponse | null>(null);

  const handleStart = () => {
    setStep(AppStep.INPUT);
    setErrorMessage(null);
  };

  // STEP 1: Trigger Analysis
  const handleInitialSubmit = async (targetRole: string, resumeContent: string) => {
    setStep(AppStep.PROCESSING_ANALYSIS);
    setErrorMessage(null);
    setCurrentTargetRole(targetRole);
    setCurrentResumeContent(resumeContent);
    
    try {
      const analysisData = await performInitialAnalysis(resumeContent, targetRole);
      setInitialAnalysis(analysisData);
      setStep(AppStep.ANALYSIS_REVIEW);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to analyze resume. Please check your input and try again.");
      setStep(AppStep.INPUT);
    }
  };

  // STEP 2: Trigger Final Generation
  const handleStrategySubmit = async (userAnswers: Record<string, string>, selectedStrategyIds: string[]) => {
    if (!initialAnalysis) return;
    
    setStep(AppStep.PROCESSING_GENERATION);
    
    try {
      const result = await generateTailoredResume(
        currentResumeContent,
        currentTargetRole,
        initialAnalysis,
        userAnswers,
        selectedStrategyIds
      );

      setFinalResult(result);
      setStep(AppStep.RESULT);

    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to generate final resume.");
      // Go back to review so they don't lose progress
      setStep(AppStep.ANALYSIS_REVIEW);
    }
  };

  // STEP 3: Inline Refinement
  const handleRefine = async (instruction: string, selectedText: string) => {
    if (!finalResult) return;
    setIsRefining(true);

    try {
        const updatedResume = await refineResumeContent(
            finalResult.optimizedResume,
            instruction,
            selectedText
        );
        
        setFinalResult({
            ...finalResult,
            optimizedResume: updatedResume,
            changeOverview: `Manual Update: ${instruction}`
        });
    } catch (error) {
        console.error("Refinement failed", error);
        setErrorMessage("Could not apply change. Please try again.");
    } finally {
        setIsRefining(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setFinalResult(null);
    setInitialAnalysis(null);
    setErrorMessage(null);
    setCurrentTargetRole('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{errorMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setErrorMessage(null)}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
        </div>
      )}

      {step === AppStep.LANDING && <LandingHero onStart={handleStart} />}
      
      {step === AppStep.INPUT && (
        <InputForm onSubmit={handleInitialSubmit} isLoading={false} />
      )}

      {step === AppStep.ANALYSIS_REVIEW && initialAnalysis && (
        <AnalysisReview 
          analysis={initialAnalysis} 
          targetRole={currentTargetRole} 
          onProceed={handleStrategySubmit} 
        />
      )}

      {step === AppStep.RESULT && finalResult && (
        <ResultsView 
          data={finalResult} 
          originalContent={currentResumeContent} 
          onReset={handleReset} 
          onRefine={handleRefine}
          isRefining={isRefining}
        />
      )}

      {/* Loading Overlays */}
      {step === AppStep.PROCESSING_ANALYSIS && (
        <ProcessingView targetRole={currentTargetRole} mode="ANALYSIS" />
      )}
      
      {step === AppStep.PROCESSING_GENERATION && (
        <ProcessingView targetRole={currentTargetRole} mode="GENERATION" />
      )}
    </div>
  );
};

export default App;
