import { z } from "zod";

// Direct type definitions (no database)
export interface User {
  id: number;
  username: string;
  password: string;
}

export interface InterviewSession {
  id: number;
  role: string;
  status: "in_progress" | "completed" | "abandoned";
  currentQuestionIndex: number;
  questions: string[];
  responses: string[];
  feedback: InterviewFeedback | null;
  overallScore: number | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface UserFeedback {
  id: number;
  sessionId: number | null;
  role: string | null;
  rating: number;
  experience: string | null;
  suggestions: string | null;
  followUp: string | null;
  createdAt: Date;
}

// Zod validation schemas
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertInterviewSessionSchema = z.object({
  role: z.string(),
});

export const updateInterviewSessionSchema = z.object({
  currentQuestionIndex: z.number().optional(),
  responses: z.array(z.string()).optional(),
  status: z.enum(["in_progress", "completed", "abandoned"]).optional(),
  questions: z.array(z.string()).optional(),
}).partial();

export const insertUserFeedbackSchema = z.object({
  sessionId: z.number().optional(),
  role: z.string().optional(),
  rating: z.number(),
  experience: z.string().optional(),
  suggestions: z.string().optional(),
  followUp: z.string().optional(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type UpdateInterviewSession = z.infer<typeof updateInterviewSessionSchema>;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

// Interview feedback structure
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

// Role definitions
export const INTERVIEW_ROLES = {
  "product-management": {
    title: "Product Management",
    description: "Practice feature prioritization, user research, and product strategy questions for APM roles.",
    icon: "lightbulb",
    color: "primary",
    duration: "~15 minutes",
    popularity: "Most Popular",
    gradient: "from-blue-500 to-blue-600"
  },
  "ai-data-analyst": {
    title: "AI/Data Analyst", 
    description: "Master data interpretation, SQL basics, and analytical thinking for data-driven roles.",
    icon: "chart-bar",
    color: "accent",
    duration: "~20 minutes",
    popularity: "High Demand",
    gradient: "from-orange-500 to-orange-600"
  },
  "qa-testing": {
    title: "QA Testing",
    description: "Learn test case design, bug reporting, and quality assurance methodologies.",
    icon: "bug",
    color: "success",
    duration: "~12 minutes", 
    popularity: "Beginner Friendly",
    gradient: "from-green-500 to-green-600"
  },
  "customer-success": {
    title: "Customer Success",
    description: "Practice client relationship management, problem-solving, and communication skills.",
    icon: "handshake",
    color: "purple",
    duration: "~18 minutes",
    popularity: "People-Focused", 
    gradient: "from-purple-500 to-purple-600"
  },
  "business-analyst": {
    title: "Business Analyst",
    description: "Master process optimization, stakeholder management, and business requirement analysis.",
    icon: "cogs",
    color: "indigo",
    duration: "~16 minutes",
    popularity: "Career Switcher Friendly",
    gradient: "from-indigo-500 to-indigo-600"
  }
} as const;

export type RoleKey = keyof typeof INTERVIEW_ROLES;
