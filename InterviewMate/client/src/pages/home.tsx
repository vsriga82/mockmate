import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import RoleCard from "@/components/role-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Role, UserFeedback } from "@/types";
import { 
  Bus, 
  Menu, 
  Play, 
  ArrowRight, 
  Check, 
  Clock, 
  Brain,
  Star,
  Target,
  Gift,
  Smartphone,
  TrendingUp,
  Twitter,
  Linkedin,
  Github,
  MessageSquare,
  Send
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<number>(4); // Default to "😍"
  const [feedbackForm, setFeedbackForm] = useState<UserFeedback>({
    rating: 4,
    role: "",
    experience: "",
    suggestions: "",
    followUp: ""
  });

  // Fetch available roles
  const { data: roles = {}, isLoading: rolesLoading } = useQuery<Record<string, Role>>({
    queryKey: ['/api/roles']
  });

  // Fetch usage stats
  const { data: usage } = useQuery<{
    interviewsRemaining: number;
    resumeChecksRemaining: number;
    resetsAt: string;
  }>({
    queryKey: ['/api/usage']
  });

  // Start interview mutation
  const startInterviewMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('POST', '/api/interview/start', { role });
      return response.json();
    },
    onSuccess: (session) => {
      setLocation(`/interview/${session.id}`);
    },
    onError: (error: any) => {
      // Handle different error types
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
          title: "Error",
          description: error.message || "Failed to start interview session",
          variant: "destructive"
        });
      }
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: UserFeedback) => {
      const response = await apiRequest('POST', '/api/feedback', feedback);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      setFeedbackForm({
        rating: 4,
        role: "",
        experience: "",
        suggestions: "",
        followUp: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive"
      });
    }
  });

  const handleRoleSelect = (roleKey: string) => {
    startInterviewMutation.mutate(roleKey);
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackForm.rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    submitFeedbackMutation.mutate(feedbackForm);
  };

  const ratingEmojis = ["😢", "😐", "😊", "😍", "🤩"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Bus className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MockMate</h1>
                <p className="text-xs text-gray-500">AI Mock Interview Assistant</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Features</a>
              <a href="#roles" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Practice Roles</a>
              <Button 
                variant="ghost"
                onClick={() => setLocation('/resume-check')}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Resume Check
              </Button>
              <a href="#feedback" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Feedback</a>
              <Button className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600">
                Start Practice
              </Button>
            </nav>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center bg-success-100 text-success-600 px-3 py-1 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  Perfect for Tier 2/3 College Students
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Master Your Next <span className="text-primary-500">Job Interview</span> with AI
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Practice real-world interview scenarios for entry-level tech and business roles. Get instant AI-powered feedback to build confidence and land your dream job.
                </p>
                
                {/* Usage Stats */}
                {usage && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    <span>{usage.interviewsRemaining} free interviews remaining today</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-600 transition-colors shadow-material"
                  onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Free – Level Up Your Interview Skills
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" className="border-2 border-primary-200 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50">
                  <Play className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-gray-600">
                <div className="flex items-center">
                  <Check className="text-success-500 mr-2 w-4 h-4" />
                  <span className="font-medium">Start Free</span>
                </div>
                <div className="flex items-center">
                  <Clock className="text-success-500 mr-2 w-4 h-4" />
                  <span className="font-medium">5-Min Sessions</span>
                </div>
                <div className="flex items-center">
                  <Brain className="text-success-500 mr-2 w-4 h-4" />
                  <span className="font-medium">AI-Powered</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Hero demo interface */}
              <Card className="bg-white rounded-2xl shadow-material-lg p-8 relative">
                <CardContent className="p-0 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Product Manager Practice</h3>
                    <div className="bg-success-100 text-success-600 px-3 py-1 rounded-full text-sm font-medium">
                      Question 3/5
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      "How would you prioritize features for a new mobile app when you have limited development resources?"
                    </p>
                  </div>
                  <Textarea 
                    className="w-full p-4 border border-gray-200 rounded-lg resize-none" 
                    rows={4} 
                    placeholder="Type your answer here..."
                    value="I would start by identifying the core user needs through user research and data analysis..."
                    readOnly
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Characters: 127/500</span>
                    <Button className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600">
                      Next Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Floating achievement badges */}
              <div className="absolute -top-4 -right-4 bg-accent-500 text-white p-3 rounded-xl shadow-material">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-success-500 text-white px-4 py-2 rounded-lg shadow-material text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2 inline" />
                85% Score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selector */}
      <section id="roles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Choose Your Practice Role</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select from 5 high-demand entry-level positions and practice with role-specific questions tailored for freshers and career switchers.
            </p>
          </div>

          {rolesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-gray-200 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(roles).map(([key, role]) => (
                <RoleCard
                  key={key}
                  roleKey={key}
                  role={role}
                  onSelect={handleRoleSelect}
                  isLoading={startInterviewMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose MockMate?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Tier 2/3 college students and freshers with features that actually help you land interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description: "Advanced GPT-4o technology analyzes your responses and provides human-like feedback with specific improvement suggestions."
              },
              {
                icon: Target,
                title: "Role-Specific Questions", 
                description: "Questions tailored for entry-level positions with real scenarios you'll face in Product, Data, QA, Customer Success, and Business Analysis roles."
              },
              {
                icon: ({ className }: { className: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
                title: "Instant Feedback",
                description: "Get detailed analysis within seconds, not days. Identify strengths, improvement areas, and actionable next steps immediately."
              },
              {
                icon: Gift,
                title: "Start Free",
                description: "Get started at no cost. Built for students who need quality practice without financial barriers."
              },
              {
                icon: Smartphone,
                title: "Mobile Optimized", 
                description: "Practice anywhere, anytime. Fully responsive design works perfectly on your phone, tablet, or desktop."
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                description: "Monitor your improvement over time with session history, score trends, and personalized recommendations."
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-white rounded-2xl p-8 shadow-material text-center">
                <CardContent className="p-0 space-y-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
                    <feature.icon className="text-primary-600 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistics */}
          <Card className="bg-white rounded-2xl shadow-material-lg p-8 md:p-12">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600">7,500+</div>
                  <div className="text-gray-600 font-medium">Students Helped</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-success-600">85%</div>
                  <div className="text-gray-600 font-medium">Interview Success Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-accent-600">15min</div>
                  <div className="text-gray-600 font-medium">Average Session</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600">4.8/5</div>
                  <div className="text-gray-600 font-medium">Student Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feedback Form */}
      <section id="feedback" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Help Us Improve MockMate</h2>
            <p className="text-xl text-gray-600">
              Your feedback helps us build features that actually matter to students like you.
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">Share Your Experience</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We're constantly improving MockMate based on student feedback. Tell us what you love, what needs work, and what features would help you land your dream job.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">What We're Looking For:</h4>
                  <ul className="space-y-2 text-gray-600">
                    {[
                      "How easy was MockMate to use?",
                      "Did the feedback help you improve?", 
                      "What features should we add next?",
                      "Any bugs or issues you encountered?"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="text-success-500 mr-3 w-4 h-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Card className="bg-white p-6 rounded-xl shadow-material">
                  <CardContent className="p-0">
                    <h5 className="font-semibold text-gray-900 mb-2">Quick Stats</h5>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">2min</div>
                        <div className="text-sm text-gray-500">To Complete</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-success-600">Anonymous</div>
                        <div className="text-sm text-gray-500">& Optional</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback Form */}
              <Card className="bg-white rounded-xl shadow-material-lg overflow-hidden">
                <div className="bg-primary-500 px-6 py-4">
                  <h4 className="text-white font-semibold">MockMate Feedback Form</h4>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How would you rate your overall experience? *
                      </label>
                      <div className="flex space-x-2">
                        {ratingEmojis.map((emoji, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className={`w-10 h-10 rounded-full border-2 transition-colors ${
                              selectedRole === index 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                            }`}
                            onClick={() => {
                              setSelectedRole(index);
                              setFeedbackForm(prev => ({ ...prev, rating: index + 1 }));
                            }}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Which role did you practice? *
                      </label>
                      <Select value={feedbackForm.role} onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product-management">Product Management</SelectItem>
                          <SelectItem value="ai-data-analyst">AI/Data Analyst</SelectItem>
                          <SelectItem value="qa-testing">QA Testing</SelectItem>
                          <SelectItem value="customer-success">Customer Success</SelectItem>
                          <SelectItem value="business-analyst">Business/Operations Analyst</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What feature would you like to see next?
                      </label>
                      <Textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                        rows={3}
                        placeholder="Video practice, more roles, group sessions, etc..."
                        value={feedbackForm.suggestions}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, suggestions: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="follow-up" 
                        checked={!!feedbackForm.followUp}
                        onCheckedChange={(checked) => setFeedbackForm(prev => ({ ...prev, followUp: checked ? "yes" : "" }))}
                      />
                      <label htmlFor="follow-up" className="text-sm text-gray-700">
                        I'd like to be notified about new features and updates
                      </label>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    onClick={handleFeedbackSubmit}
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Bus className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">MockMate</h3>
                  <p className="text-gray-400 text-sm">AI Mock Interview Assistant</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Helping Tier 2/3 college students build confidence and land their dream jobs through AI-powered interview practice.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Practice Roles */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Practice Roles</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#roles" className="hover:text-white transition-colors">Product Management</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">AI/Data Analyst</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">QA Testing</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Customer Success</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Business Analyst</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Interview Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Guidance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resume Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#feedback" className="hover:text-white transition-colors">Feedback</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2024 MockMate. Made with ❤️ for students everywhere.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Built with OpenAI GPT-4o</span>
                <span>•</span>
                <span>100% Student-Focused</span>
                <span>•</span>
                <span>Always Free</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
