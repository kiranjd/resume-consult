import { GoogleGenAI, Type } from "@google/genai";
import { InitialAnalysis, OptimizationResponse, ResumeData, StrategyCategory } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Step 1: Analyze the Gap
export const performInitialAnalysis = async (
  currentResumeText: string,
  targetRole: string
): Promise<InitialAnalysis> => {
  const ai = getClient();

  const prompt = `
    You are a distinguished Executive Career Consultant.
    The user is applying for the role of: "${targetRole}".
    
    Resume Data:
    """
    ${currentResumeText}
    """

    **Objective:**
    Analyze the gap between the candidate's current presentation and what is required to win a "${targetRole}" offer. 
    Do NOT rewrite the resume yet. Create a Strategic Audit Report.

    **Requirements:**
    1. **Executive Summary**: A formal, direct, and professional paragraph (80-100 words). Address the candidate directly. State clearly where they are strong, but ruthlessly highlight the "Gap" that will cause rejection. Use a professional, "New York Times" editorial tone.
    2. **Strengths**: List 3-4 key assets the candidate already has.
    3. **Clarification Questions**: Identify 2-3 specific details missing from their history that are critical for this role (e.g., "What was the budget size?", "Which specific cloud technologies?").
    4. **Strategic Suggestions**: Provide exactly 4-5 pivotal changes, categorized strictly into these three buckets:
       - **Formatting & Tone**: Narrative flow, action verbs, professional voice.
       - **Skill Gaps**: Missing hard skills, certifications, or specific tools required for the role.
       - **ATS & Systems**: Keywords, standard headings, and machine-readability optimizations.
    5. **Gaps**: List missing hard/soft skills and specific missing ATS keywords.

    Return strictly JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER },
          executiveSummary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          hardSkillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          softSkillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          clarificationQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                context: { type: Type.STRING },
              },
              required: ["id", "question", "context"],
            },
          },
          strategicSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Formatting & Tone", "Skill Gaps", "ATS & Systems"] },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                benefit: { type: Type.STRING },
              },
              required: ["id", "category", "label", "description", "benefit"],
            },
          },
        },
        required: ["matchScore", "executiveSummary", "strengths", "hardSkillGaps", "softSkillGaps", "missingKeywords", "clarificationQuestions", "strategicSuggestions"],
      },
    },
  });

  if (!response.text) throw new Error("Empty response from AI Analysis");
  
  const data = JSON.parse(response.text);
  
  // Hydrate selections
  return {
    ...data,
    strategicSuggestions: data.strategicSuggestions.map((s: any) => ({ ...s, isSelected: true }))
  };
};

// Step 2: Generate Resume based on Feedback
export const generateTailoredResume = async (
  originalResume: string,
  targetRole: string,
  analysis: InitialAnalysis,
  userAnswers: Record<string, string>,
  selectedStrategies: string[]
): Promise<OptimizationResponse> => {
  const ai = getClient();

  const strategyContext = analysis.strategicSuggestions
    .filter(s => selectedStrategies.includes(s.id))
    .map(s => `[${s.category}] ${s.label}: ${s.description}`)
    .join("; ");

  const answerContext = analysis.clarificationQuestions
    .map(q => `Q: ${q.question} \n Context: ${q.context} \n User Answer: ${userAnswers[q.id] || "No details provided."}`)
    .join("\n\n");

  const prompt = `
    You are a professional Resume Writer. 
    Target Role: "${targetRole}".
    
    Original Data:
    """${originalResume}"""

    **Strategic Directive:**
    ${strategyContext}

    **New Evidence Provided by User:**
    ${answerContext}

    Task:
    1. Rewrite the resume completely. Use a formal, executive tone. Incorporate the new evidence. Execute the strategic directives. Optimize for ATS keywords.
    2. Provide a "Change Overview": A detailed paragraph (bulleted string) explaining exactly what was changed and why. Contrast the old vs. new.
    
    **Important**: Ensure every experience item and education item has a unique ID if possible, or I will assign one later. But focusing on content is key.

    Structure output as strict JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          changeOverview: { type: Type.STRING, description: "A detailed summary of specific changes made to the resume, highlighting improvements." },
          optimizedResume: {
            type: Type.OBJECT,
            properties: {
              header: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  linkedinUrl: { type: Type.STRING },
                  location: { type: Type.STRING },
                  title: { type: Type.STRING },
                },
                required: ["fullName", "email"],
              },
              summary: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    dateRange: { type: Type.STRING },
                    location: { type: Type.STRING },
                    achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["company", "role", "dateRange", "achievements"],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    dateRange: { type: Type.STRING },
                    details: { type: Type.STRING },
                  },
                  required: ["institution", "degree", "dateRange"],
                },
              },
            },
            required: ["header", "summary", "skills", "experience", "education"],
          }
        },
        required: ["changeOverview", "optimizedResume"],
      },
    },
  });

  if (!response.text) throw new Error("Empty response from AI Generation");
  
  const result = JSON.parse(response.text);
  return {
    analysis,
    optimizedResume: result.optimizedResume,
    changeOverview: result.changeOverview
  };
};

// Step 3: Inline Refinement
export const refineResumeContent = async (
  currentResume: ResumeData,
  instruction: string,
  selectedText: string
): Promise<ResumeData> => {
  const ai = getClient();

  const prompt = `
    You are an expert Resume Editor.
    
    Current Resume Data (JSON):
    ${JSON.stringify(currentResume)}

    User Selection: "${selectedText}"
    User Instruction: "${instruction}"

    **Task:**
    1. Locate the section in the resume that corresponds to the User Selection.
    2. Apply the User Instruction ONLY to that section. Do not change other parts of the resume.
    3. If the instruction implies adding a skill, add it to the skills array.
    4. If the instruction implies changing a bullet point, rewrite that specific bullet point to be more impactful, professional, or accurate based on the instruction.
    
    Return the FULL updated resume JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          header: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              linkedinUrl: { type: Type.STRING },
              location: { type: Type.STRING },
              title: { type: Type.STRING },
            },
            required: ["fullName", "email"],
          },
          summary: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                dateRange: { type: Type.STRING },
                location: { type: Type.STRING },
                achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["company", "role", "dateRange", "achievements"],
            },
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                institution: { type: Type.STRING },
                degree: { type: Type.STRING },
                dateRange: { type: Type.STRING },
                details: { type: Type.STRING },
              },
              required: ["institution", "degree", "dateRange"],
            },
          },
        },
        required: ["header", "summary", "skills", "experience", "education"],
      },
    },
  });

  if (!response.text) throw new Error("Empty response from AI Refinement");
  
  return JSON.parse(response.text);
};
