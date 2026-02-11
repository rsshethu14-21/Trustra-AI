
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AIResponse } from "../types";

// Always use process.env.API_KEY directly and instantiate inside the function to ensure current key usage.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateVerification = async (data: {
  behavioralData: any;
  userAnswer: string;
  faceImageBase64?: string;
}): Promise<AIResponse> => {
  try {
    const ai = getAI();
    
    const parts: any[] = [
      {
        text: `Evaluate this verification request:
        - Timing: ${data.behavioralData.timing}ms
        - Behavioral Markers: ${data.behavioralData.markersCount} samples.
        - Interaction Logic: User provided a natural logical answer.
        - User Content Answer: "${data.userAnswer}"
        - Biometric Check: A face scan has been provided. Verify if this looks like a live human face and not a bot or a static image.`
      }
    ];

    if (data.faceImageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: data.faceImageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      // Use gemini-3-flash-preview for its multi-modal capabilities and reasoning efficiency.
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT + "\nAdditionally, analyze the face image for 'liveness'. If the image appears fake, significantly increase the risk score.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            decision: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: ["riskScore", "decision", "reasoning"],
          propertyOrdering: ["riskScore", "decision", "reasoning"],
        },
      },
    });

    // Access text property directly (it is a property, not a method).
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return {
      riskScore: 45,
      decision: "Suspicious",
      reasoning: "Face scan and behavioral data were partially processed. Fallback score assigned."
    };
  }
};

export const getDynamicQuestion = async (): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            // Selecting gemini-3-flash-preview for prompt-based text generation tasks.
            model: 'gemini-3-flash-preview',
            contents: "Provide exactly one creative, open-ended logical question that a human could answer easily but a simple bot would struggle with. Keep it under 20 words.",
        });
        // Correctly accessing the .text property.
        return response.text?.trim() || "What is a color you associate with your favorite childhood memory?";
    } catch (e) {
        return "Describe what a sunset looks like to someone who cannot see.";
    }
};
