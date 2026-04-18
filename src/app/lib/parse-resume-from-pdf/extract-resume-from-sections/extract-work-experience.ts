import type { ResumeWorkExperience } from "lib/redux/types";
import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  DATE_FEATURE_SETS,
  hasNumber,
  getHasText,
  isBold,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { divideSectionIntoSubsections } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/subsections";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";
import { SECTION_KEYWORDS_WORK_EXPERIENCE } from "lib/parse-resume-from-pdf/zh-resume-keywords";
// prettier-ignore
const JOB_TITLES = ['Accountant', 'Administrator', 'Advisor', 'Agent', 'Analyst', 'Apprentice', 'Architect', 'Assistant', 'Associate', 'Auditor', 'Bartender', 'Biologist', 'Bookkeeper', 'Buyer', 'Carpenter', 'Cashier', 'CEO', 'Clerk', 'Co-op', 'Co-Founder', 'Consultant', 'Coordinator', 'CTO', 'Developer', 'Designer', 'Director', 'Driver', 'Editor', 'Electrician', 'Engineer', 'Extern', 'Founder', 'Freelancer', 'Head', 'Intern', 'Janitor', 'Journalist', 'Laborer', 'Lawyer', 'Lead', 'Manager', 'Mechanic', 'Member', 'Nurse', 'Officer', 'Operator', 'Operation', 'Photographer', 'President', 'Producer', 'Recruiter', 'Representative', 'Researcher', 'Sales', 'Server', 'Scientist', 'Specialist', 'Supervisor', 'Teacher', 'Technician', 'Trader', 'Trainee', 'Treasurer', 'Tutor', 'Vice', 'VP', 'Volunteer', 'Webmaster', 'Worker'];

const CN_JOB_HINTS = [
  "工程师",
  "经理",
  "总监",
  "主管",
  "专员",
  "助理",
  "顾问",
  "实习生",
  "架构师",
  "开发",
  "产品",
  "运营",
  "设计",
  "负责人",
  "技术员",
  "研究员",
  "讲师",
  "教授",
  "合伙人",
  "董事",
  "总裁",
  "副总裁",
  "组长",
  "主任",
];

const hasJobTitleEn = (item: TextItem) =>
  JOB_TITLES.some((jobTitle) =>
    item.text.split(/\s/).some((word) => word === jobTitle)
  );

const hasCnJobTitle = (item: TextItem) =>
  CN_JOB_HINTS.some((h) => item.text.includes(h));

/** Long line: English by word count; CJK-heavy lines by character count (no spaces). */
const isLongTitleLikeLine = (item: TextItem) => {
  const t = item.text.trim();
  if (!t) return false;
  if (/\s/.test(t)) {
    return t.split(/\s+/).filter(Boolean).length > 5;
  }
  return t.length > 22;
};

const JOB_TITLE_FEATURE_SET: FeatureSet[] = [
  [hasJobTitleEn, 4],
  [hasCnJobTitle, 3],
  [hasNumber, -4],
  [isLongTitleLikeLine, -2],
];

const hasLikelyCompanyZh = (item: TextItem) =>
  /(有限公司|股份有限公司|股份公司|科技公司|集团|控股|\(中国\)|办事处)/.test(
    item.text
  );

export const extractWorkExperience = (sections: ResumeSectionToLines) => {
  const workExperiences: ResumeWorkExperience[] = [];
  const workExperiencesScores = [];
  const lines = getSectionLinesByKeywords(sections, SECTION_KEYWORDS_WORK_EXPERIENCE);
  const subsections = divideSectionIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 2;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();
    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );
    const [jobTitle, jobTitleScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      JOB_TITLE_FEATURE_SET
    );
    const COMPANY_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [hasLikelyCompanyZh, 1],
      [getHasText(date), -4],
      [getHasText(jobTitle), -4],
    ];
    const [company, companyScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      COMPANY_FEATURE_SET,
      false
    );

    const subsectionDescriptionsLines =
      subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(subsectionDescriptionsLines);

    workExperiences.push({ company, jobTitle, date, descriptions });
    workExperiencesScores.push({
      companyScores,
      jobTitleScores,
      dateScores,
    });
  }
  return { workExperiences, workExperiencesScores };
};
