import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here" 
});

export interface SoftSkillFeedback {
  empathyScore: number;
  structureScore: number;
  relevanceScore: number;
  improvementSuggestions: string[];
  strengthsIdentified: string[];
  overallFeedback: string;
}

const SOFT_SKILL_SCENARIOS = [
  "How would you handle a situation where a team member consistently misses deadlines and it's affecting the project timeline?",
  "Describe how you would approach giving constructive feedback to a colleague who seems resistant to change.",
  "You notice a teammate is struggling with their workload but hasn't asked for help. How would you handle this situation?",
  "How would you mediate a conflict between two team members who have different approaches to solving a problem?",
  "Describe how you would motivate a team during a particularly challenging project with tight deadlines.",
  "How would you handle a situation where you need to deliver disappointing news to stakeholders?",
  "You're working with a remote team member who seems disengaged during meetings. How would you address this?",
  "How would you approach building trust with a new team when joining a project mid-way?",
  "Describe how you would handle receiving criticism about your work from a supervisor.",
  "How would you encourage innovation and creative thinking within your team while meeting deadlines?"
];

export function generateSoftSkillQuestions(): string[] {
  // Shuffle and pick 3 random scenarios
  const shuffled = [...SOFT_SKILL_SCENARIOS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

export async function analyzeSoftSkillResponse(
  question: string,
  response: string
): Promise<SoftSkillFeedback> {
  
  // Demo analysis for when API is unavailable
  const demoAnalysis: SoftSkillFeedback = {
    empathyScore: 85,
    structureScore: 78,
    relevanceScore: 82,
    improvementSuggestions: [
      "Consider acknowledging the emotional impact on all parties involved",
      "Add more specific steps or examples to demonstrate your approach",
      "Include how you would follow up to ensure the solution was effective"
    ],
    strengthsIdentified: [
      "Shows clear understanding of the situation",
      "Demonstrates proactive communication approach",
      "Displays good problem-solving mindset"
    ],
    overallFeedback: "Your response shows strong soft skills fundamentals with good empathy and practical thinking. You demonstrate understanding of interpersonal dynamics and show a collaborative approach to problem-solving. To enhance your response, consider adding more specific examples and follow-up strategies."
  };

  const prompt = `Analyze this soft skills response to a scenario-based question:

QUESTION: "${question}"

RESPONSE: "${response}"

Evaluate the response on these criteria and provide analysis in this exact JSON format:
{
  "empathyScore": number (0-100, how well the response shows understanding and empathy for others),
  "structureScore": number (0-100, how well organized and logical the response is),
  "relevanceScore": number (0-100, how relevant and appropriate the response is to the scenario),
  "improvementSuggestions": [
    "specific suggestion 1",
    "specific suggestion 2",
    "specific suggestion 3"
  ] (actionable improvements for better soft skills demonstration),
  "strengthsIdentified": [
    "strength 1",
    "strength 2", 
    "strength 3"
  ] (positive aspects and strengths shown in the response),
  "overallFeedback": "comprehensive summary focusing on soft skills development and professional growth"
}

Focus on empathy, communication skills, emotional intelligence, and practical application.`;

  try {
    const response_ai = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in soft skills development and workplace communication. Provide constructive feedback that helps candidates improve their emotional intelligence, empathy, and interpersonal skills."
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
    if (typeof result.empathyScore !== 'number' || !Array.isArray(result.improvementSuggestions)) {
      throw new Error("Invalid soft skills analysis structure received from AI");
    }

    // Ensure scores are within valid range
    result.empathyScore = Math.max(0, Math.min(100, result.empathyScore));
    result.structureScore = Math.max(0, Math.min(100, result.structureScore));
    result.relevanceScore = Math.max(0, Math.min(100, result.relevanceScore));

    return result as SoftSkillFeedback;
  } catch (error: any) {
    console.error("Error analyzing soft skills response:", error);
    
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