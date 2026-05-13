import { NextRequest, NextResponse } from "next/server";
import {
  callDeepSeek,
  parseJsonWithRetry,
  type ParseResumeResponse,
} from "lib/deepseek/client";
import { buildResumeParseMessages } from "lib/deepseek/prompts";
import { sanitizeResumeText } from "lib/sanitize/sanitize-resume";
import {
  checkPdfRateLimit,
  incrementPdfUsage,
  createRateLimitResponse,
} from "lib/rate-limit";
import { apiValidationMiddleware, truncateForAi } from "lib/middleware/validation";

export interface ParseResumeRequest {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkPdfRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    // 使用验证中间件
    const validationResponse = await apiValidationMiddleware(request);
    if (validationResponse) {
      return validationResponse;
    }

    const body: ParseResumeRequest = await request.json();
    const sanitizedText = sanitizeResumeText(body.text);
    
    // 截断文本到10000字符（传给AI的限制）
    const truncatedText = truncateForAi(sanitizedText);

    await incrementPdfUsage(request);

    const messages = buildResumeParseMessages(truncatedText);
    const rawResponse = await callDeepSeek(messages);

    const parsedData = parseJsonWithRetry<ParseResumeResponse>(rawResponse);

    if (!parsedData) {
      console.error("Failed to parse DeepSeek response as JSON:", rawResponse);
      
      const errorResponse: { success: false; error: string; rawResponse?: string } = {
        success: false,
        error: "Failed to parse AI response as valid JSON",
      };
      
      if (process.env.NODE_ENV !== "production") {
        errorResponse.rawResponse = rawResponse;
      }
      
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const result = normalizeResumeData(parsedData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/parse-resume:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (errorMessage.includes("DEEPSEEK_API_KEY is not configured")) {
      return NextResponse.json(
        { success: false, error: "AI service not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function normalizeResumeData(data: ParseResumeResponse): ParseResumeResponse {
  return {
    profile: {
      name: data.profile?.name || "",
      email: data.profile?.email || "",
      phone: data.profile?.phone || "",
      url: data.profile?.url || "",
      summary: data.profile?.summary || "",
      location: data.profile?.location || "",
    },
    personalSummary: {
      descriptions: Array.isArray(data.personalSummary?.descriptions)
        ? data.personalSummary.descriptions
        : [],
    },
    workExperiences: Array.isArray(data.workExperiences)
      ? data.workExperiences.map((exp) => ({
          company: exp.company || "",
          jobTitle: exp.jobTitle || "",
          date: exp.date || "",
          descriptions: Array.isArray(exp.descriptions)
            ? exp.descriptions
            : [],
        }))
      : [],
    educations: Array.isArray(data.educations)
      ? data.educations.map((edu) => ({
          school: edu.school || "",
          degree: edu.degree || "",
          date: edu.date || "",
          gpa: edu.gpa || "",
          descriptions: Array.isArray(edu.descriptions)
            ? edu.descriptions
            : [],
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map((proj) => ({
          project: proj.project || "",
          date: proj.date || "",
          descriptions: Array.isArray(proj.descriptions)
            ? proj.descriptions
            : [],
        }))
      : [],
    skills: {
      featuredSkills: Array.isArray(data.skills?.featuredSkills)
        ? data.skills.featuredSkills.slice(0, 6).map((skill) => ({
            skill: skill.skill || "",
            rating: typeof skill.rating === "number" ? skill.rating : 3,
          }))
        : [],
      descriptions: Array.isArray(data.skills?.descriptions)
        ? data.skills.descriptions
        : [],
    },
    custom: {
      descriptions: Array.isArray(data.custom?.descriptions)
        ? data.custom.descriptions
        : [],
    },
  };
}
