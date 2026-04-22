import { NextRequest, NextResponse } from "next/server";
import {
  callDeepSeek,
  parseJsonWithRetry,
  type ScoreResumeResponse,
  type ParseResumeResponse,
} from "lib/deepseek/client";
import { buildResumeScoreMessages } from "lib/deepseek/prompts";
import type { Resume } from "lib/redux/types";

export interface ScoreResumeRequest {
  resume: Resume;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreResumeRequest = await request.json();

    if (!body.resume) {
      return NextResponse.json(
        { success: false, error: "Missing resume data" },
        { status: 400 }
      );
    }

    const messages = buildResumeScoreMessages(body.resume);
    const rawResponse = await callDeepSeek(messages);

    const parsedData = parseJsonWithRetry<ScoreResumeResponse>(rawResponse);

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

    const result = normalizeScoreResumeResponse(parsedData, body.resume);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/score-resume:", error);
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

function normalizeScoreResumeResponse(
  data: ScoreResumeResponse,
  originalResume: Resume
): ScoreResumeResponse {
  // 规范化响应数据，保留原始隐私信息
  const normalizedOptimizedResume = normalizeResumeData(
    data.optimized_resume || (originalResume as unknown as ParseResumeResponse)
  );
  
  // 恢复原始隐私信息
  normalizedOptimizedResume.profile.email = originalResume.profile.email;
  normalizedOptimizedResume.profile.phone = originalResume.profile.phone;
  normalizedOptimizedResume.profile.url = originalResume.profile.url;
  normalizedOptimizedResume.profile.location = originalResume.profile.location;

  return {
    ...data,
    score: {
      total: data.score?.total || 0,
      level: data.score?.level || "一般",
      breakdown: {
        completeness: data.score?.breakdown?.completeness || 0,
        clarity: data.score?.breakdown?.clarity || 0,
        impact: data.score?.breakdown?.impact || 0,
        structure: data.score?.breakdown?.structure || 0,
        professionalism: data.score?.breakdown?.professionalism || 0,
      },
    },
    score_explanation: {
      summary: data.score_explanation?.summary || "",
      key_reasons: Array.isArray(data.score_explanation?.key_reasons)
        ? data.score_explanation.key_reasons
        : [],
      risk: data.score_explanation?.risk || "",
    },
    fatal_issue: data.fatal_issue || "",
    issues: Array.isArray(data.issues)
      ? data.issues.map((issue) => ({
          type: issue.type || "",
          description: issue.description || "",
          suggestion: issue.suggestion || "",
        }))
      : [],
    optimized_resume: normalizedOptimizedResume,
  };
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
