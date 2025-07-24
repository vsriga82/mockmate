import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateInterviewQuestions, analyzeInterviewResponses } from "./services/openai";
import { 
  insertInterviewSessionSchema,
  updateInterviewSessionSchema,
  insertUserFeedbackSchema,
  RoleKey,
  INTERVIEW_ROLES
} from "@shared/schema";
import { z } from "zod";
import { 
  canStartInterview, 
  recordInterviewUsage, 
  getUserUsageStats,
  canCheckResume,
  recordResumeUsage 
} from "./rateLimiter";
import { analyzeResume } from "./services/resumeAnalysis";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get available roles
  app.get("/api/roles", (req, res) => {
    res.json(INTERVIEW_ROLES);
  });

  // Get user usage stats
  app.get("/api/usage", (req, res) => {
    const stats = getUserUsageStats(req);
    res.json({
      interviewsRemaining: Math.max(0, 3 - stats.interviews),
      resumeChecksRemaining: Math.max(0, 2 - stats.resumeChecks),
      resetsAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
    });
  });

  // Create new interview session
  app.post("/api/interview/start", async (req, res) => {
    try {
      // Check rate limit
      const rateCheck = canStartInterview(req);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: rateCheck.message,
          type: "rate_limit"
        });
      }

      const { role } = insertInterviewSessionSchema.parse(req.body);
      
      if (!INTERVIEW_ROLES[role as RoleKey]) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      // Create session
      const session = await storage.createInterviewSession({ role });
      
      // Generate questions
      const questions = await generateInterviewQuestions(role as RoleKey);
      
      // Update session with questions
      const updatedSession = await storage.updateInterviewSession(session.id, {
        questions
      });

      // Record usage after successful creation
      recordInterviewUsage(req);

      res.json(updatedSession);
    } catch (error: any) {
      console.error("Error starting interview:", error);
      
      // Check if it's an OpenAI quota error
      if (error.status === 429 || error.code === 'insufficient_quota') {
        return res.status(503).json({ 
          message: "Our servers are currently at capacity. Please try again later!",
          type: "capacity_error"
        });
      }
      
      res.status(500).json({ message: error.message || "Failed to start interview session" });
    }
  });

  // Get interview session
  app.get("/api/interview/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getInterviewSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Interview session not found" });
      }

      res.json(session);
    } catch (error: any) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch interview session" });
    }
  });

  // Submit answer and move to next question
  app.post("/api/interview/:id/answer", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { answer, questionIndex } = z.object({
        answer: z.string(),
        questionIndex: z.number()
      }).parse(req.body);

      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Interview session not found" });
      }

      // Update responses array
      const newResponses = [...session.responses];
      newResponses[questionIndex] = answer;

      const updatedSession = await storage.updateInterviewSession(sessionId, {
        responses: newResponses,
        currentQuestionIndex: questionIndex + 1
      });

      res.json(updatedSession);
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: error.message || "Failed to submit answer" });
    }
  });

  // Complete interview and generate feedback
  app.post("/api/interview/:id/complete", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getInterviewSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Interview session not found" });
      }

      // Generate AI feedback
      const feedback = await analyzeInterviewResponses(
        session.role as RoleKey,
        session.questions,
        session.responses
      );

      // Complete the session
      const completedSession = await storage.completeInterviewSession(
        sessionId,
        feedback,
        feedback.overallScore
      );

      res.json(completedSession);
    } catch (error: any) {
      console.error("Error completing interview:", error);
      res.status(500).json({ message: error.message || "Failed to complete interview" });
    }
  });

  // Submit user feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertUserFeedbackSchema.parse(req.body);
      const feedback = await storage.createUserFeedback(feedbackData);
      res.json(feedback);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: error.message || "Failed to submit feedback" });
    }
  });

  // Resume analysis endpoint
  app.post("/api/resume/analyze", async (req, res) => {
    try {
      // Check rate limit
      const rateCheck = canCheckResume(req);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          message: rateCheck.message,
          type: "rate_limit"
        });
      }

      const { resumeText, jobDescription } = z.object({
        resumeText: z.string().min(100, "Resume text must be at least 100 characters"),
        jobDescription: z.string().optional()
      }).parse(req.body);

      // Analyze resume
      const analysis = await analyzeResume(resumeText, jobDescription);

      // Record usage after successful analysis
      recordResumeUsage(req);

      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing resume:", error);
      
      // Check if it's an OpenAI quota error
      if (error.status === 429 || error.code === 'insufficient_quota') {
        return res.status(503).json({ 
          message: "Our servers are currently at capacity. Please try again later!",
          type: "capacity_error"
        });
      }
      
      res.status(500).json({ 
        message: error.message || "Failed to analyze resume",
        type: "analysis_error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
