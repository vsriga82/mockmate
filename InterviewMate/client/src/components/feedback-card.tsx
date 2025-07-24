import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewFeedback } from "@/types";
import { 
  ThumbsUp, 
  Target, 
  List, 
  Download, 
  Share2, 
  RotateCcw, 
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  Book,
  Users,
  TrendingUp,
  ExternalLink,
  Video,
  Rocket
} from "lucide-react";

interface FeedbackCardProps {
  feedback: InterviewFeedback;
  role: string;
  onRetake: () => void;
  onNewRole: () => void;
}

export default function FeedbackCard({ feedback, role, onRetake, onNewRole }: FeedbackCardProps) {
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-success-600';
    if (grade.startsWith('B')) return 'text-primary-600';
    if (grade.startsWith('C')) return 'text-accent-600';
    return 'text-gray-600';
  };

  return (
    <Card className="bg-white rounded-2xl shadow-material-lg overflow-hidden">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-success-500 to-success-600 px-8 py-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold">{feedback.overallScore}</div>
            <div className="text-success-100">Overall Score</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold">{feedback.communication}</div>
            <div className="text-success-100">Communication</div>
          </div>
          <div className="space-y-2">
            <div className={`text-4xl font-bold ${getGradeColor(feedback.grade)}`}>
              {feedback.grade}
            </div>
            <div className="text-success-100">Performance Grade</div>
          </div>
        </div>
      </div>

      <CardContent className="p-8 space-y-8">
        {/* Strengths Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <ThumbsUp className="w-6 h-6 text-success-500 mr-3" />
            Your Strengths
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.strengths.map((strength, index) => (
              <div key={index} className="bg-success-50 border border-success-200 rounded-lg p-4">
                <h4 className="font-semibold text-success-800 mb-2">{strength.title}</h4>
                <p className="text-success-700 text-sm">{strength.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Target className="w-6 h-6 text-accent-500 mr-3" />
            Areas for Improvement
          </h3>
          <div className="space-y-4">
            {feedback.improvements.map((improvement, index) => (
              <div key={index} className="bg-accent-50 border border-accent-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {index === 0 ? <Clock className="w-4 h-4 text-white" /> : <DollarSign className="w-4 h-4 text-white" />}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-accent-800">{improvement.title}</h4>
                    <p className="text-accent-700">{improvement.description}</p>
                    <div className="bg-white p-3 rounded border border-accent-200">
                      <strong className="text-accent-800 text-sm">Tip:</strong>
                      <span className="text-accent-700 text-sm"> {improvement.tip}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <List className="w-6 h-6 text-primary-500 mr-3" />
            Detailed Question Analysis
          </h3>
          <div className="space-y-4">
            {feedback.questionAnalysis.map((analysis, index) => (
              <Card key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">
                      Question {analysis.questionIndex + 1}: {analysis.question.substring(0, 50)}...
                    </h4>
                    <div className="bg-success-100 text-success-600 px-3 py-1 rounded-full text-sm font-medium">
                      Score: {analysis.score}/10
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm italic">
                    "{analysis.question}"
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                        What Worked Well
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.whatWorked.map((point, i) => (
                          <li key={i}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 text-accent-500 mr-2" />
                        Could Improve
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.couldImprove.map((point, i) => (
                          <li key={i}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-8">
          <h3 className="text-xl font-bold text-primary-900 mb-6 flex items-center">
            <Rocket className="w-6 h-6 text-primary-600 mr-3" />
            Next Steps for Improvement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary-800">Recommended Practice Areas</h4>
              <ul className="space-y-2 text-primary-700">
                {feedback.nextSteps.practiceAreas.map((area, index) => (
                  <li key={index} className="flex items-center">
                    <Book className="w-4 h-4 text-primary-600 mr-3" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-primary-800">Additional Resources</h4>
              <ul className="space-y-2 text-primary-700">
                {feedback.nextSteps.resources.map((resource, index) => (
                  <li key={index} className="flex items-center">
                    {index === 0 && <ExternalLink className="w-4 h-4 text-primary-600 mr-3" />}
                    {index === 1 && <Video className="w-4 h-4 text-primary-600 mr-3" />}
                    {index === 2 && <RotateCcw className="w-4 h-4 text-primary-600 mr-3" />}
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <Button className="bg-primary-500 text-white px-8 py-3 rounded-xl hover:bg-primary-600">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50">
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
          <Button 
            onClick={onRetake}
            className="bg-success-500 text-white px-8 py-3 rounded-xl hover:bg-success-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button 
            onClick={onNewRole}
            className="bg-accent-500 text-white px-8 py-3 rounded-xl hover:bg-accent-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Try New Role
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
