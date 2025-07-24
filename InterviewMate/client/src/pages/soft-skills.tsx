import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Target,
  Star,
  ArrowRight,
  Brain
} from "lucide-react";

interface SoftSkillFeedback {
  empathyScore: number;
  structureScore: number;
  relevanceScore: number;
  improvementSuggestions: string[];
  strengthsIdentified: string[];
  overallFeedback: string;
}

interface SoftSkillSession {
  currentQuestion: number;
  questions: string[];
  responses: string[];
  feedbacks: SoftSkillFeedback[];
  isComplete: boolean;
}

export default function SoftSkills() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentResponse, setCurrentResponse] = useState("");
  const [session, setSession] = useState<SoftSkillSession | null>(null);

  // Fetch usage stats
  const { data: usage, refetch: refetchUsage } = useQuery<{
    interviewsRemaining: number;
    resumeChecksRemaining: number;
    pitchReviewsRemaining: number;
    softSkillSessionsRemaining: number;
    resetsAt: string;
  }>({
    queryKey: ['/api/usage']
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/soft-skills/start', {});
      return response.json();
    },
    onSuccess: (result) => {
      setSession(result);
      toast({
        title: "Session Started!",
        description: "Answer 3 scenario-based questions to practice your soft skills.",
      });
    },
    onError: (error: any) => {
      if (error.type === "rate_limit") {
        toast({
          title: "Daily Limit Reached",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to Start",
          description: error.message || "Failed to start soft skills session",
          variant: "destructive"
        });
      }
    }
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (response: string) => {
      const result = await apiRequest('POST', '/api/soft-skills/submit', {
        sessionId: session?.currentQuestion,
        response,
        questionIndex: session?.currentQuestion
      });
      return result.json();
    },
    onSuccess: (result) => {
      setSession(result);
      setCurrentResponse("");
      if (result.isComplete) {
        refetchUsage();
        toast({
          title: "Session Complete!",
          description: "Great job practicing your soft skills!",
        });
      } else {
        toast({
          title: "Response Submitted!",
          description: `Moving to question ${result.currentQuestion + 1} of 3.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit response",
        variant: "destructive"
      });
    }
  });

  const handleStartSession = () => {
    startSessionMutation.mutate();
  };

  const handleSubmitResponse = () => {
    if (!currentResponse.trim()) {
      toast({
        title: "Response Required",
        description: "Please provide your response before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (currentResponse.trim().length < 50) {
      toast({
        title: "Response Too Short",
        description: "Please provide a more detailed response for better feedback.",
        variant: "destructive"
      });
      return;
    }

    submitResponseMutation.mutate(currentResponse);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">SoftSkillSim</h1>
              </div>
            </div>
            
            {/* Usage indicator */}
            {usage && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{usage.softSkillSessionsRemaining || 1} session remaining today</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Soft Skills Simulation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practice scenario-based questions and get AI feedback on empathy, structure, and relevance.
          </p>
        </div>

        {!session ? (
          // Start Session Card
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to Practice Soft Skills?
                </h3>
                <p className="text-gray-600 mb-6">
                  You'll answer 3 scenario-based questions and receive detailed feedback on your empathy, 
                  communication structure, and relevance to each situation.
                </p>
                <div className="flex justify-center space-x-4 mb-6">
                  <Badge variant="secondary">3 Questions</Badge>
                  <Badge variant="secondary">AI Feedback</Badge>
                  <Badge variant="secondary">1 Session/Day</Badge>
                </div>
                <Button 
                  onClick={handleStartSession}
                  disabled={startSessionMutation.isPending || (usage?.softSkillSessionsRemaining === 0)}
                  size="lg"
                  className="px-8"
                >
                  {startSessionMutation.isPending ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Starting Session...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Start Session</span>
                    </span>
                  )}
                </Button>
                
                {usage?.softSkillSessionsRemaining === 0 && (
                  <Alert className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You've completed today's soft skills session. Try again tomorrow!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        ) : session.isComplete ? (
          // Session Complete - Show All Feedback
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600">
                  🎉 Session Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 mb-6">
                  Great job completing your soft skills practice! Here's your detailed feedback:
                </p>
              </CardContent>
            </Card>

            {session.feedbacks.map((feedback, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Question {index + 1} Feedback</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 italic">"{session.questions[index]}"</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(feedback.empathyScore)}`}>
                        {feedback.empathyScore}%
                      </div>
                      <div className="text-sm text-gray-600">Empathy</div>
                      <Progress value={feedback.empathyScore} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(feedback.structureScore)}`}>
                        {feedback.structureScore}%
                      </div>
                      <div className="text-sm text-gray-600">Structure</div>
                      <Progress value={feedback.structureScore} className="mt-1" />
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(feedback.relevanceScore)}`}>
                        {feedback.relevanceScore}%
                      </div>
                      <div className="text-sm text-gray-600">Relevance</div>
                      <Progress value={feedback.relevanceScore} className="mt-1" />
                    </div>
                  </div>

                  {/* Strengths */}
                  {feedback.strengthsIdentified.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Strengths Identified</span>
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {feedback.strengthsIdentified.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>Areas for Improvement</span>
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {feedback.improvementSuggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Overall Feedback */}
                  <div className="pt-4 border-t">
                    <p className="text-gray-700 leading-relaxed">{feedback.overallFeedback}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="text-center">
              <Button onClick={() => setLocation('/')} variant="outline">
                Return to Home
              </Button>
            </div>
          </div>
        ) : (
          // Active Session - Show Current Question
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Question {session.currentQuestion + 1} of 3
                  </span>
                  <div className="flex-1 mx-4">
                    <Progress value={((session.currentQuestion + 1) / 3) * 100} />
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(((session.currentQuestion + 1) / 3) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Scenario Question</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {session.questions[session.currentQuestion]}
                  </p>
                </div>
                
                <Textarea
                  placeholder="Type your response here... Focus on demonstrating empathy, clear structure, and relevance to the scenario."
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{currentResponse.length} characters</span>
                  <span>Aim for at least 50 characters for detailed feedback</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitResponse}
                disabled={!currentResponse.trim() || submitResponseMutation.isPending}
                size="lg"
              >
                {submitResponseMutation.isPending ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Submit Response</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}