import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FeedbackCard from "@/components/feedback-card";
import { InterviewSession } from "@/types";
import { ArrowLeft } from "lucide-react";

export default function Feedback() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();

  // Fetch interview session with feedback
  const { data: session, isLoading, error } = useQuery<InterviewSession>({
    queryKey: ['/api/interview', sessionId],
    enabled: !!sessionId
  });

  const handleRetake = () => {
    // Navigate back to home to start a new session with the same role
    setLocation('/');
  };

  const handleNewRole = () => {
    // Navigate back to home to select a different role
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600">Loading your feedback...</p>
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

  if (session.status !== 'completed' || !session.feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Feedback Not Ready</h1>
            <p className="text-gray-600">
              This interview session is not yet completed or feedback is still being generated.
            </p>
            <div className="flex space-x-3 justify-center">
              <Button 
                onClick={() => setLocation(`/interview/${sessionId}`)}
                className="bg-primary-500 text-white hover:bg-primary-600"
              >
                Continue Interview
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/')}
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
              <p className="text-gray-600">
                {session.role.charAt(0).toUpperCase() + session.role.slice(1).replace('-', ' ')} Practice Session
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Feedback Content */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Instant AI-Powered Feedback</h2>
            <p className="text-xl text-gray-600">
              Get detailed analysis of your responses with actionable improvement recommendations.
            </p>
          </div>

          <FeedbackCard
            feedback={session.feedback}
            role={session.role}
            onRetake={handleRetake}
            onNewRole={handleNewRole}
          />
        </div>
      </div>
    </div>
  );
}
