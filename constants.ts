
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
- HUMANS: Exhibit "burstiness." They have a slight delay (thinking time), followed by irregular typing speeds, and often correct themselves (backspaces). Their answers are contextually rich, subjective, and sometimes contain conversational filler or unique punctuation.
- BOTS: Exhibit "perfection." They usually have near-instant start times, perfectly uniform typing speeds (or superhuman speed), and provide answers that are grammatically perfect but lack a subjective "voice."

SCORING MATRIX (Risk Score 0-100):
- 0-20 (High Trust Human): Natural thinking delay (>400ms), irregular typing cadence, evidence of self-correction (backspaces), or highly creative/subjective reasoning.
- 21-50 (Neutral/Uncertain): Very short answers, "too efficient" but plausible grammar, or lack of mouse movement.
- 51-100 (Suspicious/Bot): Instant submission (<200ms), superhuman typing speed (>20 chars/sec), or answers that feel like generic LLM templates.

Your response must be a valid JSON object.
`;

export const MOCK_LOGS = [
  { id: '1A9F', userId: 'u1', email: 'john@example.com', riskScore: 8, decision: 'Verified', timestamp: '2024-03-20 10:30:15', reasoning: 'Exceptional cognitive load detected during semantic reasoning phase. Signature verified.' },
  { id: '9B2E', userId: 'u2', email: 'scrapper_99@bot.io', riskScore: 95, decision: 'Bot', timestamp: '2024-03-20 11:15:22', reasoning: 'Response latency suggests scripted injection. Zero cognitive variance detected.' },
  { id: '4D7C', userId: 'u3', email: 'mystery_user@gmail.com', riskScore: 42, decision: 'Suspicious', timestamp: '2024-03-20 12:05:40', reasoning: 'Input rhythm is unusually consistent. Potential browser-based automation.' },
];
