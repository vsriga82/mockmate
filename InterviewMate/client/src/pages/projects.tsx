import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  FolderOpen,
  Clock,
  Users,
  BarChart3,
  Search,
  Code,
  FileText,
  ExternalLink
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  role: string;
  brief: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  deliverables: string[];
}

const projects: Project[] = [
  {
    id: "pm-1",
    title: "Product Roadmap Creation",
    role: "Product Management",
    brief: "Create a 6-month product roadmap for a mobile fitness app. Define user stories, prioritize features, and plan sprint cycles. Include market research, competitive analysis, and user persona development.",
    duration: "3-5 hours",
    difficulty: "Intermediate",
    skills: ["User Research", "Market Analysis", "Roadmap Planning", "Stakeholder Management"],
    deliverables: ["Product Roadmap Document", "User Stories", "Competitive Analysis", "Feature Prioritization Matrix"]
  },
  {
    id: "analyst-1", 
    title: "Sales Performance Analysis",
    role: "Business Analyst",
    brief: "Analyze quarterly sales data for an e-commerce company. Identify trends, create dashboards, and provide actionable insights. Focus on customer segmentation, product performance, and regional analysis.",
    duration: "4-6 hours",
    difficulty: "Intermediate",
    skills: ["Data Analysis", "SQL", "Excel/Sheets", "Data Visualization", "Business Intelligence"],
    deliverables: ["Executive Summary", "Sales Dashboard", "Trend Analysis Report", "Recommendations Document"]
  },
  {
    id: "qa-1",
    title: "Mobile App Testing Strategy",
    role: "Quality Assurance",
    brief: "Design a comprehensive testing strategy for a new social media mobile app. Create test plans, identify test cases, and establish quality metrics. Include both manual and automated testing approaches.",
    duration: "3-4 hours", 
    difficulty: "Beginner",
    skills: ["Test Planning", "Test Case Design", "Mobile Testing", "Bug Reporting", "Quality Metrics"],
    deliverables: ["Test Strategy Document", "Test Case Repository", "Bug Report Template", "Quality Checklist"]
  }
];

export default function Projects() {
  const [, setLocation] = useLocation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Product Management": return <BarChart3 className="w-5 h-5" />;
      case "Business Analyst": return <Search className="w-5 h-5" />;
      case "Quality Assurance": return <Code className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Product Management": return "text-blue-600";
      case "Business Analyst": return "text-green-600";
      case "Quality Assurance": return "text-purple-600";
      default: return "text-gray-600";
    }
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
                <FolderOpen className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">ProjectHub</h1>
              </div>
            </div>
            
            {/* Status Badge */}
            <Badge variant="outline" className="text-sm">
              Phase 2 Feature
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Real-World Project Experience
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Practice with industry-realistic projects designed to build your portfolio and demonstrate practical skills to employers.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8">
          {projects.map((project, index) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${getRoleColor(project.role)}`}>
                      {getRoleIcon(project.role)}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 mb-1">
                        {project.title}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={`font-medium ${getRoleColor(project.role)}`}>
                          {project.role}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{project.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(project.difficulty)}>
                    {project.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Project Brief */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Project Brief</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {project.brief}
                  </p>
                </div>

                {/* Skills Required */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Skills You'll Practice</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Expected Deliverables</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {project.deliverables.map((deliverable, delIndex) => (
                      <div key={delIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t">
                  <Button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                    size="lg"
                  >
                    <span className="flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Submit My Work (Coming Soon)</span>
                    </span>
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Project submission functionality will be available in Phase 2
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <Users className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                More Projects Coming Soon!
              </h3>
              <p className="text-gray-700 mb-6">
                We're developing additional projects for Software Development, Data Science, Marketing, 
                and other high-demand roles. Plus, you'll soon be able to submit your work for AI-powered 
                feedback and portfolio building.
              </p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline">Portfolio Building</Badge>
                <Badge variant="outline">AI Feedback</Badge>
                <Badge variant="outline">Industry Templates</Badge>
                <Badge variant="outline">Skill Certification</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}