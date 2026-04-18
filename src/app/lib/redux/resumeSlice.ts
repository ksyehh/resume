import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "lib/redux/store";
import type {
  FeaturedSkill,
  Resume,
  ResumeEducation,
  ResumeProfile,
  ResumeProject,
  ResumeSkills,
  ResumeWorkExperience,
} from "lib/redux/types";
import type { ShowForm } from "lib/redux/settingsSlice";

export const initialProfile: ResumeProfile = {
  name: "",
  summary: "",
  email: "",
  phone: "",
  location: "",
  url: "",
};

export const initialWorkExperience: ResumeWorkExperience = {
  company: "",
  jobTitle: "",
  date: "",
  descriptions: [],
};

export const initialEducation: ResumeEducation = {
  school: "",
  degree: "",
  gpa: "",
  date: "",
  descriptions: [],
};

export const initialProject: ResumeProject = {
  project: "",
  date: "",
  descriptions: [],
};

export const initialFeaturedSkill: FeaturedSkill = { skill: "", rating: 4 };
export const initialFeaturedSkills: FeaturedSkill[] = Array(6).fill({
  ...initialFeaturedSkill,
});
export const initialSkills: ResumeSkills = {
  featuredSkills: initialFeaturedSkills,
  descriptions: [],
};

export const initialCustom = {
  descriptions: [],
};

export const emptyPersonalSummary = {
  descriptions: [] as string[],
};

/**
 * Shape used when merging persisted resume from localStorage.
 * Must stay “empty template”, not the first-run demo resume, so old saves
 * do not inherit demo `personalSummary` text.
 */
export const resumeRehydrationDefaults: Resume = {
  profile: initialProfile,
  personalSummary: emptyPersonalSummary,
  workExperiences: [initialWorkExperience],
  projects: [initialProject],
  educations: [initialEducation],
  skills: initialSkills,
  custom: initialCustom,
};

const defaultPersonalSummaryContent = {
  descriptions: [
    "拥有3年互联网产品经理经验，专注于用户增长与产品策略制定；",
    "具备独立负责产品从0到1的规划上线和迭代能力，擅长通过数据分析驱动产品优化，实现用户增长与商业目标；",
    "曾成功主导PMCV项目用户增长20%，并提升用户活跃度15%。",
  ],
};

export const initialResumeState: Resume = {
  profile: {
    name: "王大锤",
    summary: "",
    email: "BigHammerKing@KsYehh.com",
    phone: "12345678900",
    url: "ksyehh.com",
    location: "北京市",
  },
  personalSummary: defaultPersonalSummaryContent,
  workExperiences: [
    {
      company: "字节跳动",
      jobTitle: "高级产品经理",
      date: "2024年6月 - 至今",
      descriptions: [
        "负责公司核心产品线（抖音）的整体规划、设计与迭代，涵盖用户增长、商业化及用户体验等多个维度。",
        "独立完成产品需求分析、原型设计、PRD撰写，并与研发、设计、运营团队紧密协作，确保产品按时高质量上线。",
        "通过用户访谈、数据埋点分析、A/B测试等手段，深入洞察用户行为，挖掘产品增长点，制定并执行产品策略，成功将XX产品月活跃用户提升20%。",
        "主导直播功能模块的优化，通过精细化运营和产品改版，用户留存率提升15%，付费转化率提升8%。",
      ],
    },
    {
      company: "腾讯科技",
      jobTitle: "产品经理",
      date: "2023年6月 - 2024年6月",
      descriptions: [
        "参与微信产品的需求收集、功能设计及用户体验优化工作，协助完成产品迭代。",
        "负责撰写产品需求文档（PRD）和原型图，并与开发团队沟通协调，跟进开发进度。",
        "对产品上线后的数据进行监控和分析，撰写周报和月报，发现问题并提出优化建议。",
        "协助进行用户调研和竞品分析，为产品战略提供参考。",
      ],
    },
  ],
  projects: [
    {
      project: "PMCV",
      date: "2026年4月",
      descriptions: [
        "创建并上线免费简历 Web 应用（pmcv.ksyehh.com），帮助用户快速制作、AI 优化专业简历",
      ],
    },
    {
      project: "Alt-Text-Pro",
      date: "2025年12月",
      descriptions: [
        "创建并上线 Web 应用（alttextpro.com），AI 驱动，帮助用户为图片生成 Alt Text。",
      ],
    },
  ],
  educations: [
    {
      school: "清华大学",
      degree: "计算机科学与技术学士",
      date: "2019年9月 - 2023年6月",
      gpa: "",
      descriptions: [],
    },
  ],
  skills: initialSkills,
  custom: initialCustom,
};

// Keep the field & value type in sync with CreateHandleChangeArgsWithDescriptions (components\ResumeForm\types.ts)
export type CreateChangeActionWithDescriptions<T> = {
  idx: number;
} & (
  | {
      field: Exclude<keyof T, "descriptions">;
      value: string;
    }
  | { field: "descriptions"; value: string[] }
);

export const resumeSlice = createSlice({
  name: "resume",
  initialState: initialResumeState,
  reducers: {
    changeProfile: (
      draft,
      action: PayloadAction<{ field: keyof ResumeProfile; value: string }>
    ) => {
      const { field, value } = action.payload;
      draft.profile[field] = value;
    },
    changeWorkExperiences: (
      draft,
      action: PayloadAction<
        CreateChangeActionWithDescriptions<ResumeWorkExperience>
      >
    ) => {
      const { idx, field, value } = action.payload;
      const workExperience = draft.workExperiences[idx];
      workExperience[field] = value as any;
    },
    changeEducations: (
      draft,
      action: PayloadAction<CreateChangeActionWithDescriptions<ResumeEducation>>
    ) => {
      const { idx, field, value } = action.payload;
      const education = draft.educations[idx];
      education[field] = value as any;
    },
    changeProjects: (
      draft,
      action: PayloadAction<CreateChangeActionWithDescriptions<ResumeProject>>
    ) => {
      const { idx, field, value } = action.payload;
      const project = draft.projects[idx];
      project[field] = value as any;
    },
    changeSkills: (
      draft,
      action: PayloadAction<
        | { field: "descriptions"; value: string[] }
        | {
            field: "featuredSkills";
            idx: number;
            skill: string;
            rating: number;
          }
      >
    ) => {
      const { field } = action.payload;
      if (field === "descriptions") {
        const { value } = action.payload;
        draft.skills.descriptions = value;
      } else {
        const { idx, skill, rating } = action.payload;
        const featuredSkill = draft.skills.featuredSkills[idx];
        featuredSkill.skill = skill;
        featuredSkill.rating = rating;
      }
    },
    changeCustom: (
      draft,
      action: PayloadAction<{ field: "descriptions"; value: string[] }>
    ) => {
      const { value } = action.payload;
      draft.custom.descriptions = value;
    },
    changePersonalSummary: (
      draft,
      action: PayloadAction<{ field: "descriptions"; value: string[] }>
    ) => {
      const { value } = action.payload;
      draft.personalSummary.descriptions = value;
    },
    addSectionInForm: (draft, action: PayloadAction<{ form: ShowForm }>) => {
      const { form } = action.payload;
      switch (form) {
        case "workExperiences": {
          draft.workExperiences.push(structuredClone(initialWorkExperience));
          return draft;
        }
        case "educations": {
          draft.educations.push(structuredClone(initialEducation));
          return draft;
        }
        case "projects": {
          draft.projects.push(structuredClone(initialProject));
          return draft;
        }
        default:
          return draft;
      }
    },
    moveSectionInForm: (
      draft,
      action: PayloadAction<{
        form: ShowForm;
        idx: number;
        direction: "up" | "down";
      }>
    ) => {
      const { form, idx, direction } = action.payload;
      if (
        form !== "workExperiences" &&
        form !== "educations" &&
        form !== "projects"
      ) {
        return draft;
      }
      if (
        (idx === 0 && direction === "up") ||
        (idx === draft[form].length - 1 && direction === "down")
      ) {
        return draft;
      }

      const section = draft[form][idx];
      if (direction === "up") {
        draft[form][idx] = draft[form][idx - 1];
        draft[form][idx - 1] = section;
      } else {
        draft[form][idx] = draft[form][idx + 1];
        draft[form][idx + 1] = section;
      }
    },
    deleteSectionInFormByIdx: (
      draft,
      action: PayloadAction<{ form: ShowForm; idx: number }>
    ) => {
      const { form, idx } = action.payload;
      if (
        form === "workExperiences" ||
        form === "educations" ||
        form === "projects"
      ) {
        draft[form].splice(idx, 1);
      }
    },
    setResume: (draft, action: PayloadAction<Resume>) => {
      return action.payload;
    },
  },
});

export const {
  changeProfile,
  changeWorkExperiences,
  changeEducations,
  changeProjects,
  changeSkills,
  changeCustom,
  changePersonalSummary,
  addSectionInForm,
  moveSectionInForm,
  deleteSectionInFormByIdx,
  setResume,
} = resumeSlice.actions;

export const selectResume = (state: RootState) => state.resume;
export const selectProfile = (state: RootState) => state.resume.profile;
export const selectWorkExperiences = (state: RootState) =>
  state.resume.workExperiences;
export const selectEducations = (state: RootState) => state.resume.educations;
export const selectProjects = (state: RootState) => state.resume.projects;
export const selectSkills = (state: RootState) => state.resume.skills;
export const selectCustom = (state: RootState) => state.resume.custom;
export const selectPersonalSummary = (state: RootState) =>
  state.resume.personalSummary;

export default resumeSlice.reducer;
