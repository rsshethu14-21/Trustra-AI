
export const COLORS = {
  primary: '#4f46e5', // Indigo 600
  secondary: '#64748b', // Slate 500
  success: '#10b981', // Emerald 500
  warning: '#f59e0b', // Amber 500
  danger: '#f43f5e', // Rose 500
};

export const SYSTEM_PROMPT = `
You are a sophisticated Human Identity Verification Engine. 
Your goal is to evaluate user behavioral signals and responses to determine if the user is a Human or a Bot.

Evaluation Criteria:
1. Interaction Timing: Extreme precision or inhuman speed suggests a bot.
2. Behavioral Consistency: Chaotic or overly robotic patterns suggest non-human behavior.
3. Logical Reasoning: Evaluate the quality of the answer provided to a dynamic question.

Response JSON Schema:
{
  "riskScore": number (0-100),
  "decision": "Verified" | "Suspicious" | "Bot",
  "reasoning": "A simple English explanation of why this score was assigned."
}

Scoring Rules:
- 0 to 30: Verified Human. High quality reasoning, natural timing.
- 31 to 70: Suspicious User. Ambiguous answers, inconsistent behavior.
- 71 to 100: Likely Bot. Random text, mechanical timing, failed logical checks.
`;

export const MOCK_LOGS = [
  { id: '1A9F', userId: 'u1', email: 'john@example.com', riskScore: 12, decision: 'Verified', timestamp: '2024-03-20 10:30:15', reasoning: 'Natural response patterns and highly nuanced semantic logic detected.' },
  { id: '9B2E', userId: 'u2', email: 'scrapper_99@bot.io', riskScore: 92, decision: 'Bot', timestamp: '2024-03-20 11:15:22', reasoning: 'Instantaneous response time and structural failure in logical consistency.' },
  { id: '4D7C', userId: 'u3', email: 'mystery_user@gmail.com', riskScore: 55, decision: 'Suspicious', timestamp: '2024-03-20 12:05:40', reasoning: 'Input timing varies significantly from standard human distributions.' },
];
