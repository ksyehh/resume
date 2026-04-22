import type { DeepSeekMessage } from "./client";

export const RESUME_PARSE_SYSTEM_PROMPT = `你是"简历解析与结构化引擎"。任务：将原始简历文本转换为指定JSON结构。

【硬性规则】
- 严禁编造；仅使用原文
- 缺失/不确定 → null
- 不翻译，保持原语言
- 不新增字段
- 输出必须为合法JSON（无解释）
- 先自检JSON可解析

【隐私保护】
- 不得提取或返回任何个人联系方式（邮箱、电话、地址等）
- 如遇到联系方式，直接忽略
- 确保返回的JSON中不包含任何隐私信息
- profile中的email、phone、url、location字段必须为空字符串""`;

export function buildResumeParseUserPrompt(resumeText: string): DeepSeekMessage {
  return {
    role: "user",
    content: `【输入】
<<<
${resumeText}
>>>

请严格按照以下JSON格式返回（不要添加任何markdown标记）：
{
  "profile": {
    "name": "姓名",
    "email": "",
    "phone": "",
    "url": "",
    "location": ""
  },
  "personalSummary": {
    "descriptions": ["个人总结内容，按要点拆分"]
  },
  "workExperiences": [
    {
      "company": "公司名称",
      "jobTitle": "职位",
      "date": "时间范围",
      "descriptions": ["工作职责和成就，按要点拆分"]
    }
  ],
  "educations": [...],
  "projects": [...],
  "skills": {
    "featuredSkills": [
      {"skill": "技能名称", "rating": 4}
    ],
    "descriptions": ["其他技能描述"]
  },
  "custom": {
    "descriptions": []
  }
}

【处理要求】
- 合并断行，恢复列表（descriptions尽量用要点）
- 工作/项目/教育分开识别，实习算工作
- 多段经历按时间倒序
- date保持原格式（无法标准化则不改）
- featuredSkills：从技能中选最多6个核心技能，rating默认3-5（无依据给3）
- 无内容的数组返回 []
- 其他零散但有价值信息放入 custom.descriptions`,
  };
}

export function buildResumeParseMessages(resumeText: string): DeepSeekMessage[] {
  return [
    { role: "system", content: RESUME_PARSE_SYSTEM_PROMPT },
    buildResumeParseUserPrompt(resumeText),
  ];
}
