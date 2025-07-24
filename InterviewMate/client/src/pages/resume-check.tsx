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
  FileText, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Lightbulb,
  ArrowLeft,
  AlertCircle,
  Target,
  Award
} from "lucide-react";

interface ResumeAnalysis {
  matchScore: number;
  missingKeywords: string[];
  improvementSuggestions: string[];
  improvedBulletPoints: string[];
  overallFeedback: string;
}

export default function ResumeCheck() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  // Fetch usage stats
  const { data: usage, refetch: refetchUsage } = useQuery<{
    interviewsRemaining: number;
    resumeChecksRemaining: number;
    resetsAt: string;
  }>({
    queryKey: ['/api/usage']
  });

  // Resume analysis mutation
  const analyzeResumeMutation = useMutation({
    mutationFn: async ({ resume, jobDesc }: { resume: string; jobDesc?: string }) => {
      const response = await apiRequest('POST', '/api/resume/analyze', {
        resumeText: resume,
        jobDescription: jobDesc
      });
      return response.json();
    },
    onSuccess: (result) => {
      setAnalysis(result);
      refetchUsage();
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been analyzed successfully.",
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
          description: error.message || "Failed to analyze resume",
          variant: "destructive"
        });
      }
    }
  });

  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume Required",
        description: "Please paste your resume text before analyzing.",
        variant: "destructive"
      });
      return;
    }

    if (resumeText.trim().length < 100) {
      toast({
        title: "Resume Too Short",
        description: "Please provide a more complete resume for better analysis.",
        variant: "destructive"
      });
      return;
    }

    analyzeResumeMutation.mutate({
      resume: resumeText,
      jobDesc: jobDescription.trim() || undefined
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Improvement";
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
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">ResumeFix</h1>
              </div>
            </div>
            
            {/* Usage indicator */}
            {usage && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{usage.resumeChecksRemaining} checks remaining today</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Resume Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant feedback on your resume with keyword matching, improvement suggestions, and enhanced bullet points.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Resume Text</span>
                  <Badge variant="destructive">Required</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your complete resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {resumeText.length} characters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Job Description</span>
                  <Badge variant="secondary">Optional</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description for better matching analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Adding a job description improves keyword matching and relevance analysis
                </p>
              </CardContent>
            </Card>

            <Button 
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || analyzeResumeMutation.isPending || (usage?.resumeChecksRemaining === 0)}
              className="w-full"
              size="lg"
            >
              {analyzeResumeMutation.isPending ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Resume...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Analyze Resume</span>
                </span>
              )}
            </Button>

            {usage?.resumeChecksRemaining === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached today's resume check limit. Try again tomorrow!
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Match Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Match Score</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className={`text-4xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                        {analysis.matchScore}%
                      </div>
                      <p className="text-lg font-medium text-gray-700">
                        {getScoreLabel(analysis.matchScore)}
                      </p>
                      <Progress value={analysis.matchScore} className="w-full" />
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Keywords */}
                {analysis.missingKeywords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span>Missing Keywords</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((keyword, index) => (
                          <Badge key={index} variant="destructive">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Improvement Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <span>Improvement Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Improved Bullet Points */}
                {analysis.improvedBulletPoints.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Enhanced Bullet Points</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.improvedBulletPoints.map((bullet, index) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-gray-700">{bullet}</p>
                          </div>
                        ))}
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
                    <p className="text-gray-700 leading-relaxed">{analysis.overallFeedback}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-600">
                    Paste your resume text and optionally add a job description to get started with AI-powered analysis.
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