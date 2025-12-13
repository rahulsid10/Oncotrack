import { GoogleGenAI } from "@google/genai";
import { Patient } from "../types";

// Initialize Gemini
// NOTE: We assume process.env.API_KEY is available.
// In a real env, you would guard against missing keys.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getPatientInsight = async (patient: Patient): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Unable to generate AI insight.";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert oncology clinical assistant. 
      Analyze the following patient data and provide a concise clinical summary (max 150 words).
      
      Patient: ${patient.name} (${patient.age} ${patient.gender})
      Diagnosis: ${patient.diagnosis}, ${patient.stage}
      Status: ${patient.status}
      
      Radiation Plan: ${patient.radiationPlan ? 
        `Site: ${patient.radiationPlan.targetSite}, Progress: ${patient.radiationPlan.fractionsCompleted}/${patient.radiationPlan.fractionsTotal} fractions.` : 'None'}
      
      Chemotherapy: ${patient.chemoProtocol ? 
        `Protocol: ${patient.chemoProtocol.protocolName}, Cycle: ${patient.chemoProtocol.cycleCurrent}/${patient.chemoProtocol.cycleTotal}.` : 'None'}
      
      Recent Vitals (Last entry): ${JSON.stringify(patient.vitalsHistory[patient.vitalsHistory.length - 1])}

      Please format the response in Markdown. Include:
      1. A brief status overview.
      2. Any potential red flags based on the treatment progress or vitals (simulated/general advice).
      3. Recommendation for next nurse check-in focus.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insight at this time due to a service error.";
  }
};