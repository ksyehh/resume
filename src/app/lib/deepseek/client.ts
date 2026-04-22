const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ParseResumeResponse {
  profile: {
    name: string;
    email: string;
    phone: string;
    url: string;
    location: string;
    summary?: string;
  };
  personalSummary: {
    descriptions: string[];
  };
  workExperiences: Array<{
    company: string;
    jobTitle: string;
    date: string;
    descriptions: string[];
  }>;
  educations: Array<{
    school: string;
    degree: string;
    date: string;
    gpa: string;
    descriptions: string[];
  }>;
  projects: Array<{
    project: string;
    date: string;
    descriptions: string[];
  }>;
  skills: {
    featuredSkills: Array<{
      skill: string;
      rating: number;
    }>;
    descriptions: string[];
  };
  custom: {
    descriptions: string[];
  };
}

export async function callDeepSeek(
  messages: DeepSeekMessage[],
  model: string = "deepseek-chat"
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data: DeepSeekResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("DeepSeek API returned no choices");
  }

  return data.choices[0].message.content;
}

export function parseJsonWithRetry<T>(content: string, maxRetries: number = 2): T | null {
  let jsonStr = content.trim();

  jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  jsonStr = jsonStr.replace(/^```\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    if (maxRetries > 0) {
      const braceStart = jsonStr.indexOf("{");
      const braceEnd = jsonStr.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
        jsonStr = jsonStr.substring(braceStart, braceEnd + 1);
        return parseJsonWithRetry(jsonStr, maxRetries - 1);
      }
    }
    return null;
  }
}
