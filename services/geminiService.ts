
import { GoogleGenAI, Type } from "@google/genai";
import type { PromptAnalysis } from "../types";
import { ANALYSIS_SYSTEM_PROMPT } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    persona: { type: Type.STRING, description: 'The role the AI is asked to assume.' },
    task: { type: Type.STRING, description: 'The primary action the AI is instructed to perform.' },
    domain: { type: Type.STRING, description: 'The subject matter or field.' },
    tone: { type: Type.STRING, description: 'The desired style or mood of the response.' },
    constraints: { type: Type.STRING, description: 'Any limitations or rules the AI must follow.' },
    outputFormat: { type: Type.STRING, description: 'The specified structure for the output.' },
  },
  required: ['persona', 'task', 'domain', 'tone', 'constraints', 'outputFormat'],
};

export const analyzePrompt = async (prompt: string): Promise<PromptAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as PromptAnalysis;

  } catch (error) {
    console.error("Error analyzing prompt:", error);
    throw new Error("Failed to analyze prompt. Please check the console for details.");
  }
};
