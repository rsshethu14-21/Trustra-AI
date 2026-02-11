
export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  SUSPICIOUS = 'SUSPICIOUS',
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  email: string;
  status: VerificationStatus;
  signupDate: string;
  riskScore?: number;
}

export interface VerificationLog {
  id: string;
  userId: string;
  email: string;
  riskScore: number;
  decision: 'Verified' | 'Suspicious' | 'Bot';
  reasoning: string;
  timestamp: string;
  behavioralData: {
    clickPattern: string;
    timing: number;
    answer: string;
  };
}

export interface AIResponse {
  riskScore: number;
  decision: 'Verified' | 'Suspicious' | 'Bot';
  reasoning: string;
}
