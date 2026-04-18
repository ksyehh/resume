/**
 * Shared Chinese (and bilingual) resume parsing keywords.
 * Keep section-title keywords in sync with getSectionLinesByKeywords lists where possible.
 */

/** Single-line headings on Chinese resumes (substring match after optional numbering strip). */
export const SECTION_TITLE_ZH_KEYWORDS = [
  "工作经历",
  "工作经验",
  "职业经历",
  "任职经历",
  "实习经历",
  "实习",
  "教育背景",
  "教育经历",
  "学历",
  "在校经历",
  "校园经历",
  "项目经历",
  "项目经验",
  "项目",
  "科研成果",
  "论文",
  "专业技能",
  "技能特长",
  "技能",
  "语言能力",
  "外语",
  "证书",
  "资格",
  "获奖",
  "荣誉",
  "自我评价",
  "个人简介",
  "简介",
  "求职意向",
  "求职",
  "兴趣爱好",
  "基本情况",
];

/** Strip leading numbering like "一、" "（一）" "1." for section title matching. */
export function stripChineseSectionNumberPrefix(text: string): string {
  return text
    .replace(/^[（(]\s*[一二三四五六七八九十百零\d]+\s*[）)]\s*/u, "")
    .replace(/^[一二三四五六七八九十百零]+[、．.]\s*/u, "")
    .replace(/^\d{1,2}[、．.]\s*/, "")
    .trim();
}

export const SECTION_KEYWORDS_WORK_EXPERIENCE = [
  "work",
  "experience",
  "employment",
  "history",
  "job",
  "工作经历",
  "工作经验",
  "职业经历",
  "任职经历",
  "实习经历",
];

export const SECTION_KEYWORDS_EDUCATION = ["education", "教育", "学历"];

export const SECTION_KEYWORDS_COURSES = ["course", "课程"];

export const SECTION_KEYWORDS_PROJECTS = ["project", "项目"];

export const SECTION_KEYWORDS_SKILLS = ["skill", "技能", "专长"];

export const SECTION_KEYWORDS_SUMMARY = [
  "summary",
  "简介",
  "总结",
  "自我评价",
];

export const SECTION_KEYWORDS_OBJECTIVE = ["objective", "求职", "意向"];
