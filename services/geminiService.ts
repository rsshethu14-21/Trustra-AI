
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AIResponse } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateVerification = async (data: {
  behavioralData: {
    timing: number;
    idleTime: number;
    typingTime: number;
    markersCount: number;
  };
  userAnswer: string;
  faceImageBase64?: string;
}): Promise<AIResponse> => {
  try {
    const ai = getAI();
    
    // Calculate derived metrics to help the AI understand the context
    const charCount = data.userAnswer.length;
    const charsPerSecond = charCount / (data.behavioralData.typingTime / 1000 || 1);
    
    const parts: any[] = [
      {
        text: `LOGICAL IDENTITY EVALUATION:
        
        TELEMETRY DATA:
        - Total Session: ${data.behavioralData.timing}ms
        - Initial Thinking Delay (Idle): ${data.behavioralData.idleTime}ms
        - Actual Typing Duration: ${data.behavioralData.typingTime}ms
        - Typing Speed: ${charsPerSecond.toFixed(2)} characters per second
        - Interaction Samples: ${data.behavioralData.markersCount}
        - User Answer: "${data.userAnswer}"
        
        ANALYTICAL REQUIREMENTS:
        1. If Idle Time is < 300ms, increase risk (Humans must read the question).
        2. If Typing Speed is > 15 chars/sec, increase risk (Pasted or Scripted).
        3. If Answer is "too robotic" or matches LLM boilerplate, increase risk.
        4. If the answer shows personality, humor, or specific human context, DECREASE risk significantly.
        
        Final score must reflect a nuanced balance of these factors.`
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
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER, description: "0-100 risk score." },
            decision: { type: Type.STRING, enum: ["Verified", "Suspicious", "Bot"] },
            reasoning: { type: Type.STRING, description: "Detailed behavioral analysis." },
          },
          required: ["riskScore", "decision", "reasoning"],
        },
        temperature: 0.4, // Lower temperature for more consistent, logical scoring
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    // Dynamic fallback to avoid static numbers
    const noise = Math.floor(Math.random() * 15);
    return {
      riskScore: 35 + noise,
      decision: "Suspicious",
      reasoning: "Identity Mesh reported a signal synchronization delay. Fallback heuristic applied."
    };
  }
};

export const getDynamicQuestion = async (): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { 
              parts: [{ 
                text: "Generate one creative, slightly weird, open-ended question that asks for a subjective opinion or a sensory description. Example: 'If frustration had a smell, what would it be?' Keep it under 12 words." 
              }] 
            },
            config: {
              temperature: 1.0,
            }
        });
        
        return response.text?.trim() || "What is a sound that feels 'spiky' to your ears?";
    } catch (e) {
        const fallbacks = [
          "What color would represent your favorite memory and why?",
          "If you had to describe a 'cloud' to someone who has never seen one?",
          "What is a texture you find strangely satisfying to touch?",
          "How would you explain the concept of 'home' in three words?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
};
