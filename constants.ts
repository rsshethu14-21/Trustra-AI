
export const COLORS = {
  primary: '#4f46e5', // Indigo 600
  secondary: '#64748b', // Slate 500
  success: '#10b981', // Emerald 500
  warning: '#f59e0b', // Amber 500
  danger: '#f43f5e', // Rose 500
};

export const SYSTEM_PROMPT = `
You are a specialized Behavioral Biometric Analyst. Your task is to distinguish between high-functioning AI/Bots and Humans based on interaction telemetry and semantic reasoning.

EVALUATION PHILOSOPHY:
- HUMANS: Exhibit "cadence." They have a delay before starting (thinking time), followed by irregular typing speeds, and often include conversational nuances or slight imperfections.
- BOTS: Exhibit "efficiency." They usually have near-instant start times, perfectly uniform typing speeds, or provide answers that are grammatically perfect but "soul-less."

SCORING MATRIX (Risk Score 0-100):
- 0-25 (Verified Human): Natural start-up delay (>1s), varied typing cadence, semantic depth, and organic mouse movement.
- 26-60 (Suspicious): Extremely brief answers, "too perfect" grammar without a thinking delay, or movement patterns that are perfectly linear.
- 61-100 (Likely Bot): Instant submission (<500ms), gibberish, or answers that clearly come from a different LLM's boilerplate.

Your response must be a valid JSON object.
`;

export const MOCK_LOGS = [
  { id: '1A9F', userId: 'u1', email: 'john@example.com', riskScore: 12, decision: 'Verified', timestamp: '2024-03-20 10:30:15', reasoning: 'Natural response patterns and highly nuanced semantic logic detected.' },
  { id: '9B2E', userId: 'u2', email: 'scrapper_99@bot.io', riskScore: 92, decision: 'Bot', timestamp: '2024-03-20 11:15:22', reasoning: 'Instantaneous response time and structural failure in logical consistency.' },
  { id: '4D7C', userId: 'u3', email: 'mystery_user@gmail.com', riskScore: 55, decision: 'Suspicious', timestamp: '2024-03-20 12:05:40', reasoning: 'Input timing varies significantly from standard human distributions.' },
];
