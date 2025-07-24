import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuestionCard from "@/components/question-card";
import ProgressBar from "@/components/progress-bar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InterviewSession } from "@/types";
import { ArrowLeft, Clock } from "lucide-react";

export default function Interview() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds

  // Fetch interview session
  const { data: session, isLoading: sessionLoading, error } = useQuery<InterviewSession>({
    queryKey: ['/api/interview', sessionId],
    enabled: !!sessionId
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ answer, questionIndex }: { answer: string; questionIndex: number }) => {
      const response = await apiRequest('POST', `/api/interview/${sessionId}/answer`, {
        answer,
        questionIndex
      });
      return response.json();
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(['/api/interview', sessionId], updatedSession);
      
      // Check if this was the last question
      if (updatedSession.currentQuestionIndex >= updatedSession.questions.length) {
        completeInterviewMutation.mutate();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive"
      });
    }
  });

  // Complete interview mutation
  const completeInterviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/interview/${sessionId}/complete`);
      return response.json();
    },
    onSuccess: (completedSession) => {
      toast({
        title: "Interview Complete!",
        description: "Your feedback is ready. Redirecting...",
      });
      setTimeout(() => {
        setLocation(`/feedback/${sessionId}`);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete interview",
        variant: "destructive"
      });
    }
  });

  // Timer countdown
  useEffect(() => {
    if (!session || session.status !== 'in_progress') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-complete interview when time runs out
          completeInterviewMutation.mutate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = (answer: string) => {
    if (!session) return;
    
    submitAnswerMutation.mutate({
      answer,
      questionIndex: session.currentQuestionIndex
    });
  };

  const handlePreviousQuestion = () => {
    if (!session || session.currentQuestionIndex === 0) return;
    
    // Update current question index without submitting
    queryClient.setQueryData(['/api/interview', sessionId], {
      ...session,
      currentQuestionIndex: session.currentQuestionIndex - 1
    });
  };

  const handleSkipQuestion = () => {
    if (!session) return;
    
    submitAnswerMutation.mutate({
      answer: "", // Empty answer for skipped question
      questionIndex: session.currentQuestionIndex
    });
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600">Loading your interview session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Session Not Found</h1>
            <p className="text-gray-600">
              The interview session could not be found or has expired.
            </p>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-primary-500 text-white hover:bg-primary-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === 'completed') {
    setLocation(`/feedback/${sessionId}`);
    return null;
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const currentResponse = session.responses[session.currentQuestionIndex] || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Interview Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">
                {session.role.charAt(0).toUpperCase() + session.role.slice(1).replace('-', ' ')} Interview
              </h3>
              <p className="text-primary-100">
                Practice Session • Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                {formatTime(timeRemaining)}
              </div>
              <div className="text-primary-100 text-sm">Time Remaining</div>
            </div>
          </div>
          
          <div className="mt-6">
            <ProgressBar 
              current={session.currentQuestionIndex} 
              total={session.questions.length}
            />
          </div>
        </div>
      </div>

      {/* Question Section */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              questionIndex={session.currentQuestionIndex}
              totalQuestions={session.questions.length}
              initialResponse={currentResponse}
              onSubmit={handleSubmitAnswer}
              onPrevious={session.currentQuestionIndex > 0 ? handlePreviousQuestion : undefined}
              onSkip={handleSkipQuestion}
              isLoading={submitAnswerMutation.isPending || completeInterviewMutation.isPending}
            />
          ) : (
            <Card className="bg-white rounded-2xl shadow-material-lg">
              <CardContent className="p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">No Questions Available</h2>
                <p className="text-gray-600">
                  There seems to be an issue with loading the interview questions.
                </p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-primary-500 text-white hover:bg-primary-600"
                >
                  Return Home
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Exit Interview Button */}
      <div className="fixed bottom-6 left-6">
        <Button
          variant="outline"
          onClick={() => {
            if (window.confirm("Are you sure you want to exit this interview? Your progress will be lost.")) {
              setLocation('/');
            }
          }}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-material"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Interview
        </Button>
      </div>
    </div>
  );
}
