import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { HelpCircle, Save, Mic } from "lucide-react";

interface QuestionCardProps {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  initialResponse?: string;
  onSubmit: (response: string) => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  initialResponse = "",
  onSubmit,
  onPrevious,
  onSkip,
  isLoading = false
}: QuestionCardProps) {
  const [response, setResponse] = useState(initialResponse);
  const maxLength = 1000;

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response);
    }
  };

  const canGoPrevious = questionIndex > 0 && onPrevious;
  const isLastQuestion = questionIndex === totalQuestions - 1;

  return (
    <Card className="bg-white rounded-2xl shadow-material-lg overflow-hidden">
      <CardContent className="p-8 space-y-6">
        <div className="bg-blue-50 border-l-4 border-primary-500 p-6 rounded-r-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Interview Question</h4>
              <p className="text-gray-700 leading-relaxed text-lg">
                {question}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Your Response</label>
          <div className="relative">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-h-[200px]"
              placeholder="Type your detailed answer here. Be specific about your approach, reasoning, and expected outcomes..."
              maxLength={maxLength}
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              Characters: {response.length}/{maxLength}
            </span>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                <Save className="w-4 h-4 mr-1" />
                Save Draft
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-600">
                <Mic className="w-4 h-4 mr-1" />
                Voice Input
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          {canGoPrevious ? (
            <Button
              variant="ghost"
              onClick={onPrevious}
              className="text-gray-600 hover:text-gray-700"
            >
              ← Previous Question
            </Button>
          ) : (
            <div />
          )}
          
          <div className="flex space-x-3">
            {onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Skip Question
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!response.trim() || isLoading}
              className="bg-primary-500 text-white px-8 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              {isLoading ? "Submitting..." : isLastQuestion ? "Complete Interview" : "Next Question →"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
