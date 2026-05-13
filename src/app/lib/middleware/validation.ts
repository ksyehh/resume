import { NextRequest, NextResponse } from "next/server";

// AI输入字符限制（10000字符）
const AI_INPUT_MAX_LENGTH = 10000;

export interface ValidationResult {
  success: boolean;
  error?: string;
  sanitizedText?: string;
}

/**
 * 验证请求文本
 * @param text - 输入文本
 * @returns 验证结果
 */
export function validateInputText(text: string): ValidationResult {
  // 检查是否为空
  if (!text || typeof text !== "string") {
    return { success: false, error: "Missing or invalid 'text' field" };
  }

  // 检查是否为空白字符
  if (text.trim().length === 0) {
    return { success: false, error: "Text is empty" };
  }

  // 截取前10000字符（传给AI的限制）
  const sanitizedText = text.trim().slice(0, AI_INPUT_MAX_LENGTH);

  return {
    success: true,
    sanitizedText,
  };
}

/**
 * 验证文件类型
 * @param filename - 文件名
 * @param allowedTypes - 允许的文件类型
 * @returns 是否有效
 */
export function validateFileType(filename: string, allowedTypes: string[] = ["pdf"]): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return allowedTypes.includes(ext || "");
}

/**
 * 验证文件大小
 * @param size - 文件大小（字节）
 * @param maxSizeMB - 最大允许大小（MB）
 * @returns 是否有效
 */
export function validateFileSize(size: number, maxSizeMB: number = 10): boolean {
  return size <= maxSizeMB * 1024 * 1024;
}

/**
 * 清理文本内容，防止XSS攻击
 * @param text - 输入文本
 * @returns 清理后的文本
 */
export function sanitizeText(text: string): string {
  // 移除HTML标签
  let sanitized = text.replace(/<[^>]*>/g, "");
  
  // 移除JavaScript脚本
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/script/gi, "");
  
  // 移除潜在的危险字符组合
  sanitized = sanitized.replace(/&lt;/g, "<");
  sanitized = sanitized.replace(/&gt;/g, ">");
  sanitized = sanitized.replace(/&amp;/g, "&");
  
  return sanitized;
}

/**
 * API验证中间件
 * @param request - NextRequest
 * @param options - 验证选项
 * @returns NextResponse | undefined（undefined表示验证通过）
 */
export async function apiValidationMiddleware(
  request: NextRequest,
  options: {
    requireText?: boolean;
    maxAiInputLength?: number;
  } = {}
): Promise<NextResponse | undefined> {
  const { requireText = true, maxAiInputLength = AI_INPUT_MAX_LENGTH } = options;

  try {
    const contentType = request.headers.get("content-type");

    // 如果是JSON请求
    if (contentType?.includes("application/json")) {
      // 克隆request以避免body被消耗
      const clonedRequest = request.clone();
      const body = await clonedRequest.json();

      // 如果需要文本验证
      if (requireText) {
        const text = body.text;
        const validation = validateInputText(text);
        
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
      }
    }

    // 如果是文件上传请求
    if (contentType?.includes("multipart/form-data")) {
      // 克隆request以避免body被消耗
      const clonedRequest = request.clone();
      const formData = await clonedRequest.formData();
      const file = formData.get("file") as File;

      if (file) {
        // 验证文件类型
        if (!validateFileType(file.name)) {
          return NextResponse.json(
            { success: false, error: "Invalid file type. Only PDF files are allowed." },
            { status: 400 }
          );
        }

        // 验证文件大小
        if (!validateFileSize(file.size)) {
          return NextResponse.json(
            { success: false, error: "File size exceeds limit (max 10MB)" },
            { status: 400 }
          );
        }
      }
    }

    // 验证通过，返回undefined让请求继续
    return undefined;
  } catch (error) {
    console.error("Validation middleware error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * 递归清理对象中的所有字符串字段
 * @param obj - 任意对象
 * @returns 清理后的对象
 */
export function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return result;
  }
  return obj;
}

/**
 * 截断文本到指定长度（用于传给AI）
 * @param text - 原始文本
 * @param maxLength - 最大长度，默认为10000
 * @returns 截断后的文本
 */
export function truncateForAi(text: string, maxLength: number = AI_INPUT_MAX_LENGTH): string {
  if (!text) return "";
  
  const trimmed = text.trim();
  
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  // 截取前maxLength字符，尽量在单词边界处截断
  let truncated = trimmed.slice(0, maxLength);
  
  // 找到最后一个空格或标点符号
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const lastPunctuationIndex = truncated.lastIndexOf(".");
  const lastCommaIndex = truncated.lastIndexOf(",");
  
  const bestBreakIndex = Math.max(lastSpaceIndex, lastPunctuationIndex, lastCommaIndex);
  
  if (bestBreakIndex > maxLength * 0.8) {
    truncated = truncated.slice(0, bestBreakIndex + 1);
  }
  
  return truncated;
}