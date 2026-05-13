import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekRequest {
  model?: string;
  messages: DeepSeekMessage[];
  temperature?: number;
}

export async function POST(request: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const body: DeepSeekRequest = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const model = body.model || "deepseek-chat";
    const temperature = body.temperature ?? 0.1;

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "AI service temporarily unavailable" },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: "AI service returned no valid response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in deepseek-proxy:", error);
    
    const errorMessage = process.env.NODE_ENV === "production"
      ? "AI service temporarily unavailable"
      : error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
