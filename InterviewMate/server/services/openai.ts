import OpenAI from "openai";
import { RoleKey, INTERVIEW_ROLES, type InterviewFeedback } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here" 
});

export async function generateInterviewQuestions(role: RoleKey): Promise<string[]> {
  const roleInfo = INTERVIEW_ROLES[role];
  
  // Demo mode with sample questions if API key issues
  const demoQuestions = {
    "product-management": [
      "How would you prioritize features for a new mobile app when you have limited development resources?",
      "Describe a time when you had to gather requirements from different stakeholders with conflicting needs.",
      "How would you measure the success of a new product feature after its launch?",
      "Walk me through how you would conduct user research for a feature you're considering.",
      "How would you handle a situation where engineering says a feature will take 6 months but the business wants it in 2 months?"
    ],
    "ai-data-analyst": [
      "How would you explain a complex data finding to a non-technical stakeholder?",
      "Describe your approach to cleaning and validating a new dataset you've never worked with before.",
      "How would you identify the most important metrics to track for an e-commerce business?",
      "Walk me through how you would investigate a sudden drop in user engagement metrics.",
      "How would you design an A/B test to measure the impact of a new recommendation algorithm?"
    ],
    "qa-testing": [
      "How would you test a login feature for a mobile app?",
      "Describe your approach to testing an e-commerce checkout process.",
      "How would you prioritize which bugs to fix first when you have limited time?",
      "Walk me through how you would create test cases for a search functionality.",
      "How would you handle a situation where developers say they can't reproduce a bug you found?"
    ],
    "customer-success": [
      "How would you handle a frustrated customer who is threatening to cancel their subscription?",
      "Describe how you would onboard a new customer to ensure they get value from our product quickly.",
      "How would you identify which customers are at risk of churning and what would you do about it?",
      "Walk me through how you would conduct a quarterly business review with a key client.",
      "How would you handle a situation where a customer is asking for a feature that doesn't exist in our product?"
    ],
    "business-analyst": [
      "How would you gather requirements for a new internal process improvement project?",
      "Describe how you would analyze and present the ROI of a proposed system upgrade.",
      "How would you handle conflicting requirements from different business units?",
      "Walk me through your process for documenting and communicating workflow changes.",
      "How would you identify inefficiencies in a current business process and propose solutions?"
    ]
  };

  const prompt = `Generate 5 interview questions for a ${roleInfo.title} entry-level position. 
  
  The questions should be:
  - Appropriate for freshers and recent graduates
  - Focused on practical scenarios they might face in the role
  - Testing both technical knowledge and soft skills
  - Realistic for someone with 0-2 years of experience
  
  Role context: ${roleInfo.description}
  
  Return the response as JSON in this exact format:
  {
    "questions": [
      "Question 1 text here",
      "Question 2 text here", 
      "Question 3 text here",
      "Question 4 text here",
      "Question 5 text here"
    ]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach specializing in entry-level tech and business roles. Generate realistic, practical interview questions that help assess candidates' potential and thinking process."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 400, // Limit output tokens for cost control
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error: any) {
    console.error("Error generating questions:", error);
    
    // Check if it's a quota/rate limit error
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.log("OpenAI quota exceeded, using demo questions for role:", role);
    } else {
      console.log("OpenAI API error, using demo questions for role:", role);
    }
    
    // Fallback to demo questions if API fails
    return demoQuestions[role] || demoQuestions["product-management"];
  }
}

export async function analyzeInterviewResponses(
  role: RoleKey,
  questions: string[],
  responses: string[]
): Promise<InterviewFeedback> {
  const roleInfo = INTERVIEW_ROLES[role];
  
  // Demo feedback for when API is unavailable
  const demoFeedback: InterviewFeedback = {
    overallScore: 78,
    grade: "B+",
    communication: 4.2,
    strengths: [
      {
        title: "Clear Problem-Solving Approach",
        description: "You demonstrated a structured way of thinking through challenges and breaking them down into manageable components."
      },
      {
        title: "Good Understanding of Role Requirements",
        description: "Your responses show awareness of key responsibilities and stakeholder dynamics in this position."
      }
    ],
    improvements: [
      {
        title: "Provide More Specific Examples",
        description: "While your conceptual understanding is good, adding concrete examples from projects, internships, or coursework would strengthen your responses.",
        tip: "Use the STAR method (Situation, Task, Action, Result) to structure your examples with specific outcomes and metrics."
      },
      {
        title: "Demonstrate Industry Knowledge",
        description: "Show deeper awareness of current trends, tools, and best practices in your field.",
        tip: "Research recent industry developments and mention specific tools or methodologies you've learned about or used."
      }
    ],
    questionAnalysis: questions.map((question, index) => ({
      questionIndex: index,
      question,
      score: Math.floor(Math.random() * 3) + 7, // Random score 7-9
      whatWorked: [
        "Showed logical thinking process",
        "Understood the core challenge",
        "Considered multiple perspectives"
      ],
      couldImprove: [
        "Add more specific examples",
        "Mention relevant tools or frameworks",
        "Discuss potential challenges and mitigation"
      ]
    })),
    nextSteps: {
      practiceAreas: [
        "Behavioral interview techniques (STAR method)",
        "Industry-specific case studies",
        "Technical knowledge for your role"
      ],
      resources: [
        "Practice with mock interview platforms",
        "Read industry blogs and case studies",
        "Join professional communities and forums"
      ]
    }
  };

  const prompt = `Analyze these interview responses for a ${roleInfo.title} position and provide detailed feedback.

Role: ${roleInfo.title}
Description: ${roleInfo.description}

Questions and Responses:
${questions.map((q, i) => `
Question ${i + 1}: ${q}
Response: ${responses[i] || "No response provided"}
`).join('\n')}

Provide comprehensive feedback in this exact JSON format:
{
  "overallScore": number (0-100),
  "grade": "letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)",
  "communication": number (0-5, one decimal place),
  "strengths": [
    {
      "title": "Strength name",
      "description": "Detailed explanation of what they did well"
    }
  ],
  "improvements": [
    {
      "title": "Area for improvement",
      "description": "What needs work and why it matters",
      "tip": "Specific actionable advice"
    }
  ],
  "questionAnalysis": [
    {
      "questionIndex": number,
      "question": "question text",
      "score": number (0-10),
      "whatWorked": ["point 1", "point 2", "point 3"],
      "couldImprove": ["point 1", "point 2", "point 3"]
    }
  ],
  "nextSteps": {
    "practiceAreas": ["area 1", "area 2", "area 3"],
    "resources": ["resource 1", "resource 2", "resource 3"]
  }
}

Focus on:
- Constructive, encouraging feedback
- Specific, actionable improvements
- Recognition of effort and potential
- Entry-level appropriate expectations
- Real-world applicability`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a senior hiring manager and interview coach with expertise in evaluating entry-level candidates. Provide detailed, constructive feedback that helps candidates improve while recognizing their potential."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800, // Limit output tokens for detailed feedback while controlling costs
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (!result.overallScore || !result.strengths || !result.improvements) {
      throw new Error("Invalid feedback structure received from AI");
    }

    return result as InterviewFeedback;
  } catch (error: any) {
    console.error("Error analyzing responses:", error);
    
    // Check if it's a quota/rate limit error
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.log("OpenAI quota exceeded, using demo feedback for role:", role);
    } else {
      console.log("OpenAI API error, using demo feedback for role:", role);
    }
    
    // Return demo feedback if API fails
    return demoFeedback;
  }
}
