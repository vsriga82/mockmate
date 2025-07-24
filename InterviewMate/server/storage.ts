import { 
  type User, 
  type InsertUser,
  type InterviewSession,
  type InsertInterviewSession,
  type UpdateInterviewSession,
  type UserFeedback,
  type InsertUserFeedback,
  type InterviewFeedback
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Interview session methods
  createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession>;
  getInterviewSession(id: number): Promise<InterviewSession | undefined>;
  updateInterviewSession(id: number, updates: UpdateInterviewSession): Promise<InterviewSession | undefined>;
  completeInterviewSession(id: number, feedback: InterviewFeedback, overallScore: number): Promise<InterviewSession | undefined>;

  // User feedback methods
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getUserFeedback(): Promise<UserFeedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private interviewSessions: Map<number, InterviewSession>;
  private userFeedbackStore: Map<number, UserFeedback>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentFeedbackId: number;

  constructor() {
    this.users = new Map();
    this.interviewSessions = new Map();
    this.userFeedbackStore = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentFeedbackId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createInterviewSession(insertSession: InsertInterviewSession): Promise<InterviewSession> {
    const id = this.currentSessionId++;
    const session: InterviewSession = {
      id,
      ...insertSession,
      status: "in_progress",
      currentQuestionIndex: 0,
      questions: [],
      responses: [],
      feedback: null,
      overallScore: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.interviewSessions.set(id, session);
    return session;
  }

  async getInterviewSession(id: number): Promise<InterviewSession | undefined> {
    return this.interviewSessions.get(id);
  }

  async updateInterviewSession(id: number, updates: UpdateInterviewSession): Promise<InterviewSession | undefined> {
    const session = this.interviewSessions.get(id);
    if (!session) return undefined;

    const updatedSession: InterviewSession = { 
      ...session, 
      ...updates
    };
    this.interviewSessions.set(id, updatedSession);
    return updatedSession;
  }

  async completeInterviewSession(id: number, feedback: InterviewFeedback, overallScore: number): Promise<InterviewSession | undefined> {
    const session = this.interviewSessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      status: "completed" as const,
      feedback,
      overallScore,
      completedAt: new Date(),
    };
    this.interviewSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createUserFeedback(insertFeedback: InsertUserFeedback): Promise<UserFeedback> {
    const id = this.currentFeedbackId++;
    const feedback: UserFeedback = {
      id,
      sessionId: insertFeedback.sessionId || null,
      role: insertFeedback.role || null,
      rating: insertFeedback.rating,
      experience: insertFeedback.experience || null,
      suggestions: insertFeedback.suggestions || null,
      followUp: insertFeedback.followUp || null,
      createdAt: new Date(),
    };
    this.userFeedbackStore.set(id, feedback);
    return feedback;
  }

  async getUserFeedback(): Promise<UserFeedback[]> {
    return Array.from(this.userFeedbackStore.values());
  }
}

export const storage = new MemStorage();
