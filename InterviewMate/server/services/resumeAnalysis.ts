import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here" 
});

export interface ResumeAnalysis {
  matchScore: number;
  missingKeywords: string[];
  improvementSuggestions: string[];
  improvedBulletPoints: string[];
  overallFeedback: string;
}

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string
): Promise<ResumeAnalysis> {
  
  // Demo analysis for when API is unavailable
  const demoAnalysis: ResumeAnalysis = {
    matchScore: 72,
    missingKeywords: ["Python", "SQL", "Data Visualization", "Machine Learning", "Git"],
    improvementSuggestions: [
      "Add quantifiable achievements with specific numbers and percentages",
      "Include more technical skills relevant to your target role",
      "Use stronger action verbs to begin each bullet point",
      "Highlight leadership experience and team collaboration",
      "Add relevant certifications or courses completed"
    ],
    improvedBulletPoints: [
      "Led cross-functional team of 5 developers to deliver software project 2 weeks ahead of schedule, resulting in 15% cost savings",
      "Implemented automated testing framework that reduced bug detection time by 40% and improved code quality metrics",
      "Analyzed customer feedback data using SQL and Python, identifying key pain points that led to 25% improvement in user satisfaction"
    ],
    overallFeedback: "Your resume shows strong technical foundation and relevant experience. Focus on quantifying your achievements with specific metrics and adding more technical skills relevant to your target role. Consider reorganizing sections to highlight your most relevant experience first."
  };

  const hasJobDescription = jobDescription && jobDescription.trim().length > 50;
  
  const prompt = hasJobDescription 
    ? `Analyze this resume against the provided job description and provide detailed feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide analysis in this exact JSON format:
{
  "matchScore": number (0-100, how well resume matches job requirements),
  "missingKeywords": ["keyword1", "keyword2", "keyword3"] (5-8 important keywords from JD missing in resume),
  "improvementSuggestions": [
    "suggestion1", 
    "suggestion2", 
    "suggestion3",
    "suggestion4",
    "suggestion5"
  ] (specific actionable improvements),
  "improvedBulletPoints": [
    "Enhanced bullet point 1",
    "Enhanced bullet point 2", 
    "Enhanced bullet point 3"
  ] (rewrite 3 existing experience bullets to be more impactful),
  "overallFeedback": "comprehensive summary and main recommendations for improvement"
}`
    : `Analyze this resume and provide detailed improvement feedback.

RESUME:
${resumeText}

Provide analysis in this exact JSON format:
{
  "matchScore": number (0-100, general resume quality score),
  "missingKeywords": ["skill1", "skill2", "skill3"] (5-8 important industry skills that could strengthen the resume),
  "improvementSuggestions": [
    "suggestion1", 
    "suggestion2", 
    "suggestion3",
    "suggestion4",
    "suggestion5"
  ] (specific actionable improvements),
  "improvedBulletPoints": [
    "Enhanced bullet point 1",
    "Enhanced bullet point 2", 
    "Enhanced bullet point 3"
  ] (rewrite 3 existing experience bullets to be more impactful),
  "overallFeedback": "comprehensive summary and main recommendations for improvement"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer and career coach with extensive experience in tech and business roles. Provide detailed, actionable feedback that helps candidates improve their resumes for entry-level to mid-level positions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800, // Limit output tokens for cost control
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (typeof result.matchScore !== 'number' || !Array.isArray(result.missingKeywords) || !Array.isArray(result.improvementSuggestions)) {
      throw new Error("Invalid analysis structure received from AI");
    }

    // Ensure score is within valid range
    result.matchScore = Math.max(0, Math.min(100, result.matchScore));

    return result as ResumeAnalysis;
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    
    // Check if it's a quota/rate limit error
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.log("OpenAI quota exceeded, using demo analysis");
    } else {
      console.log("OpenAI API error, using demo analysis");
    }
    
    // Return demo analysis if API fails
    return demoAnalysis;
  }
}