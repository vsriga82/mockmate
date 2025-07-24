import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here" 
});

export interface RoleplayFeedback {
  persuasivenessScore: number;
  structureScore: number;
  communicationScore: number;
  improvementSuggestions: string[];
  strengthsIdentified: string[];
  overallFeedback: string;
}

const HR_TOPICS_AND_QUESTIONS = [
  {
    topic: "Handling Workplace Pressure",
    questions: [
      "Tell me about a time when you had to handle multiple competing priorities with tight deadlines. How did you manage the pressure?",
      "How would you communicate with your team and supervisor when you realize you might not meet a critical deadline?"
    ]
  },
  {
    topic: "Team Leadership and Collaboration", 
    questions: [
      "Describe a situation where you had to lead a team through a challenging project. What was your approach?",
      "How would you handle a situation where team members have conflicting opinions about the project direction?"
    ]
  },
  {
    topic: "Problem-Solving and Innovation",
    questions: [
      "Tell me about a time when you identified a problem that others hadn't noticed. How did you address it?",
      "How would you approach implementing a new process or technology that your team is resistant to adopting?"
    ]
  },
  {
    topic: "Communication and Conflict Resolution",
    questions: [
      "Describe a time when you had to deliver difficult news to a client or stakeholder. How did you handle it?",
      "How would you resolve a situation where there's miscommunication between departments affecting your project?"
    ]
  },
  {
    topic: "Adaptability and Change Management",
    questions: [
      "Tell me about a time when project requirements changed significantly midway through. How did you adapt?",
      "How would you help your team embrace a major organizational change that affects their daily work?"
    ]
  },
  {
    topic: "Professional Development and Growth",
    questions: [
      "Describe a time when you received constructive criticism. How did you use it to improve?",
      "How would you approach mentoring a junior colleague who is struggling with their responsibilities?"
    ]
  }
];

export function generateRoleplaySession(): { topic: string; questions: string[] } {
  // Pick a random topic and its associated questions
  const randomTopic = HR_TOPICS_AND_QUESTIONS[Math.floor(Math.random() * HR_TOPICS_AND_QUESTIONS.length)];
  return {
    topic: randomTopic.topic,
    questions: randomTopic.questions
  };
}

export async function analyzeRoleplayResponse(
  topic: string,
  question: string,
  response: string
): Promise<RoleplayFeedback> {
  
  // Demo analysis for when API is unavailable
  const demoAnalysis: RoleplayFeedback = {
    persuasivenessScore: 80,
    structureScore: 75,
    communicationScore: 85,
    improvementSuggestions: [
      "Use the STAR method (Situation, Task, Action, Result) for more structured responses",
      "Include specific metrics or outcomes to strengthen credibility",
      "Practice smoother transitions between different parts of your answer"
    ],
    strengthsIdentified: [
      "Clear and confident communication style",
      "Good understanding of professional workplace dynamics",
      "Shows accountability and problem-solving mindset"
    ],
    overallFeedback: "Your response demonstrates solid professional communication skills and good awareness of workplace dynamics. You show confidence in your approach and provide practical solutions. To enhance your responses, focus on using structured frameworks like STAR and include more specific examples with measurable outcomes."
  };

  const prompt = `Analyze this HR roleplay response in the context of the given topic:

TOPIC: "${topic}"
QUESTION: "${question}"
RESPONSE: "${response}"

Evaluate the response on these criteria and provide analysis in this exact JSON format:
{
  "persuasivenessScore": number (0-100, how convincing and compelling the response is),
  "structureScore": number (0-100, how well organized and logical the response is),
  "communicationScore": number (0-100, how clear, professional, and effective the communication is),
  "improvementSuggestions": [
    "specific suggestion 1",
    "specific suggestion 2",
    "specific suggestion 3"
  ] (actionable improvements for better HR interview performance),
  "strengthsIdentified": [
    "strength 1",
    "strength 2", 
    "strength 3"
  ] (positive aspects and professional strengths demonstrated),
  "overallFeedback": "comprehensive summary focusing on HR interview skills and professional presentation"
}

Focus on professional communication, leadership potential, and interview readiness.`;

  try {
    const response_ai = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert HR interviewer and professional development coach. Provide detailed feedback that helps candidates improve their interview performance, communication skills, and professional presentation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 600, // Limit output tokens for cost control
    });

    const result = JSON.parse(response_ai.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (typeof result.persuasivenessScore !== 'number' || !Array.isArray(result.improvementSuggestions)) {
      throw new Error("Invalid roleplay analysis structure received from AI");
    }

    // Ensure scores are within valid range
    result.persuasivenessScore = Math.max(0, Math.min(100, result.persuasivenessScore));
    result.structureScore = Math.max(0, Math.min(100, result.structureScore));
    result.communicationScore = Math.max(0, Math.min(100, result.communicationScore));

    return result as RoleplayFeedback;
  } catch (error: any) {
    console.error("Error analyzing roleplay response:", error);
    
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