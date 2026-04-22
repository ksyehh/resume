import { NextRequest, NextResponse } from "next/server";
import {
  callDeepSeek,
  parseJsonWithRetry,
  type ParseResumeResponse,
} from "lib/deepseek/client";
import { buildResumeParseMessages } from "lib/deepseek/prompts";
import { sanitizeResumeText } from "lib/sanitize/sanitize-resume";

export interface ParseResumeRequest {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ParseResumeRequest = await request.json();

    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    if (body.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Resume text is empty" },
        { status: 400 }
      );
    }

    const sanitizedText = sanitizeResumeText(body.text);

    const messages = buildResumeParseMessages(sanitizedText);
    const rawResponse = await callDeepSeek(messages);

    const parsedData = parseJsonWithRetry<ParseResumeResponse>(rawResponse);

    if (!parsedData) {
      console.error("Failed to parse DeepSeek response as JSON:", rawResponse);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse AI response as valid JSON",
          rawResponse,
        },
        { status: 500 }
      );
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
