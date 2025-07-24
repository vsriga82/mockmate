export interface Role {
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  popularity: string;
  gradient: string;
}

export interface InterviewSession {
  id: number;
  role: string;
  status: "in_progress" | "completed" | "abandoned";
  currentQuestionIndex: number;
  questions: string[];
  responses: string[];
  feedback?: InterviewFeedback | null;
  overallScore?: number | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface InterviewFeedback {
  overallScore: number;
  grade: string;
  communication: number;
  strengths: Array<{
    title: string;
    description: string;
  }>;
  improvements: Array<{
    title: string;
    description: string;
    tip: string;
  }>;
  questionAnalysis: Array<{
    questionIndex: number;
    question: string;
    score: number;
    whatWorked: string[];
    couldImprove: string[];
  }>;
  nextSteps: {
    practiceAreas: string[];
    resources: string[];
  };
}

export interface UserFeedback {
  sessionId?: number;
  role?: string;
  rating: number;
  experience?: string;
  suggestions?: string;
  followUp?: string;
}
