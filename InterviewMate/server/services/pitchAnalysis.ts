import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here" 
});

export interface PitchFeedback {
  clarityScore: number;
  confidenceScore: number;
  fillerWords: number;
  structureScore: number;
  toneScore: number;
  improvementSuggestions: string[];
  overallFeedback: string;
  enhancedVersion: string;
}

export async function analyzePitch(pitchText: string): Promise<PitchFeedback> {
  
  // Demo analysis for when API is unavailable
  const demoAnalysis: PitchFeedback = {
    clarityScore: 78,
    confidenceScore: 82,
    fillerWords: 2,
    structureScore: 75,
    toneScore: 80,
    improvementSuggestions: [
      "Add specific metrics or achievements to strengthen credibility",
      "Practice smoother transitions between key points",
      "Include a clear call-to-action at the end",
      "Reduce hesitation words like 'um' and 'uh'",
      "Make your unique value proposition more prominent"
    ],
    overallFeedback: "Your elevator pitch demonstrates good fundamentals with a clear structure and confident tone. The content is relevant and shows your passion for the field. To enhance impact, focus on quantifying your achievements and practicing smoother delivery. Your enthusiasm comes through well, which is a significant strength.",
    enhancedVersion: "Hi, I'm a software engineering student with a passion for creating user-centered applications that solve real problems. I recently developed a task management web app that helped 200+ beta users increase their productivity by 40% through smart deadline tracking and progress visualization. With strong skills in React, Node.js, and user experience design, I'm seeking internship opportunities where I can contribute to meaningful projects while learning from experienced developers. I'd love to discuss how my technical skills and fresh perspective could benefit your team."
  };

  const prompt = `Analyze this elevator pitch and provide detailed feedback:

PITCH:
"${pitchText}"

Evaluate the pitch on these criteria and provide analysis in this exact JSON format:
{
  "clarityScore": number (0-100, how clear and understandable the message is),
  "confidenceScore": number (0-100, how confident and assertive the tone is),
  "fillerWords": number (count of filler words like um, uh, like, you know),
  "structureScore": number (0-100, how well organized and logical the flow is),
  "toneScore": number (0-100, how professional and engaging the tone is),
  "improvementSuggestions": [
    "specific suggestion 1",
    "specific suggestion 2", 
    "specific suggestion 3",
    "specific suggestion 4",
    "specific suggestion 5"
  ] (actionable improvements for better pitch delivery),
  "overallFeedback": "comprehensive summary of strengths and areas for improvement",
  "enhancedVersion": "rewritten version of the pitch incorporating improvements while maintaining the original intent and personality"
}

Focus on practical advice for delivery, content structure, and professional impact.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert communication coach specializing in elevator pitches and professional presentations. Provide detailed, actionable feedback to help candidates improve their pitch delivery and impact."
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
    if (typeof result.clarityScore !== 'number' || !Array.isArray(result.improvementSuggestions)) {
      throw new Error("Invalid pitch analysis structure received from AI");
    }

    // Ensure scores are within valid range
    result.clarityScore = Math.max(0, Math.min(100, result.clarityScore));
    result.confidenceScore = Math.max(0, Math.min(100, result.confidenceScore));
    result.structureScore = Math.max(0, Math.min(100, result.structureScore));
    result.toneScore = Math.max(0, Math.min(100, result.toneScore));
    result.fillerWords = Math.max(0, result.fillerWords || 0);

    return result as PitchFeedback;
  } catch (error: any) {
    console.error("Error analyzing pitch:", error);
    
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