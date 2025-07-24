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
  Mic, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Target,
  Star
} from "lucide-react";

interface PitchFeedback {
  clarityScore: number;
  confidenceScore: number;
  fillerWords: number;
  structureScore: number;
  toneScore: number;
  improvementSuggestions: string[];
  overallFeedback: string;
  enhancedVersion: string;
}

export default function PitchCoach() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pitch, setPitch] = useState("");
  const [feedback, setFeedback] = useState<PitchFeedback | null>(null);

  // Fetch usage stats
  const { data: usage, refetch: refetchUsage } = useQuery<{
    interviewsRemaining: number;
    resumeChecksRemaining: number;
    pitchReviewsRemaining: number;
    resetsAt: string;
  }>({
    queryKey: ['/api/usage']
  });

  // Pitch analysis mutation
  const analyzePitchMutation = useMutation({
    mutationFn: async (pitchText: string) => {
      const response = await apiRequest('POST', '/api/pitch/analyze', {
        pitchText
      });
      return response.json();
    },
    onSuccess: (result) => {
      setFeedback(result);
      refetchUsage();
      toast({
        title: "Pitch Analysis Complete!",
        description: "Your elevator pitch has been analyzed successfully.",
      });
    },
    onError: (error: any) => {
      if (error.type === "rate_limit") {
        toast({
          title: "Daily Limit Reached",
          description: error.message,
          variant: "destructive"
        });
      } else if (error.type === "capacity_error") {
        toast({
          title: "Server Busy",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze pitch",
          variant: "destructive"
        });
      }
    }
  });

  const handleAnalyze = () => {
    if (!pitch.trim()) {
      toast({
        title: "Pitch Required",
        description: "Please enter your elevator pitch before analyzing.",
        variant: "destructive"
      });
      return;
    }

    if (pitch.trim().length < 50) {
      toast({
        title: "Pitch Too Short",
        description: "Please provide a more complete elevator pitch for better analysis.",
        variant: "destructive"
      });
      return;
    }

    analyzePitchMutation.mutate(pitch);
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
                <Mic className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">PitchPerfect</h1>
              </div>
            </div>
            
            {/* Usage indicator */}
            {usage && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{usage.pitchReviewsRemaining || 2} pitch reviews remaining today</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Perfect Your Elevator Pitch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get AI-powered feedback on clarity, confidence, structure, and tone to make your pitch unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Your Elevator Pitch</span>
                  <Badge variant="destructive">Required</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your elevator pitch here... (e.g., 'Hi, I'm a software engineering student passionate about creating user-friendly applications. I recently built a web app that helps students track their assignments, which increased productivity by 40% in user testing. I'm looking for internship opportunities where I can contribute to meaningful projects while learning from experienced developers.')"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{pitch.length} characters</span>
                  <span>Aim for 30-60 seconds when spoken</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleAnalyze}
              disabled={!pitch.trim() || analyzePitchMutation.isPending || (usage?.pitchReviewsRemaining === 0)}
              className="w-full"
              size="lg"
            >
              {analyzePitchMutation.isPending ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Pitch...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Analyze My Pitch</span>
                </span>
              )}
            </Button>

            {usage?.pitchReviewsRemaining === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached today's pitch review limit. Try again tomorrow!
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {feedback ? (
              <>
                {/* Score Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Clarity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className={`text-2xl font-bold ${getScoreColor(feedback.clarityScore)}`}>
                          {feedback.clarityScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {getScoreLabel(feedback.clarityScore)}
                        </div>
                      </div>
                      <Progress value={feedback.clarityScore} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className={`text-2xl font-bold ${getScoreColor(feedback.confidenceScore)}`}>
                          {feedback.confidenceScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {getScoreLabel(feedback.confidenceScore)}
                        </div>
                      </div>
                      <Progress value={feedback.confidenceScore} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className={`text-2xl font-bold ${getScoreColor(feedback.structureScore)}`}>
                          {feedback.structureScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {getScoreLabel(feedback.structureScore)}
                        </div>
                      </div>
                      <Progress value={feedback.structureScore} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Tone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className={`text-2xl font-bold ${getScoreColor(feedback.toneScore)}`}>
                          {feedback.toneScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {getScoreLabel(feedback.toneScore)}
                        </div>
                      </div>
                      <Progress value={feedback.toneScore} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                {/* Filler Words */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span>Filler Words Detected</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {feedback.fillerWords}
                      </div>
                      <p className="text-gray-600 mt-1">
                        {feedback.fillerWords === 0 ? "Great! No filler words detected." :
                         feedback.fillerWords <= 2 ? "Good control of filler words." :
                         "Consider reducing filler words for clearer delivery."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Improvement Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span>Improvement Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedback.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Enhanced Version */}
                {feedback.enhancedVersion && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Enhanced Version</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-gray-700 leading-relaxed italic">"{feedback.enhancedVersion}"</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Overall Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{feedback.overallFeedback}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Perfect Your Pitch
                  </h3>
                  <p className="text-gray-600">
                    Enter your elevator pitch and get detailed feedback on clarity, confidence, structure, and delivery.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}