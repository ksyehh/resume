import {
  initialEducation,
  initialProfile,
  initialProject,
  initialResumeState,
  initialWorkExperience,
} from "lib/redux/resumeSlice";
import type { Resume } from "lib/redux/types";
import { deepClone } from "lib/deep-clone";

/** 与 /resume-builder 默认简历一致（复用 Redux 初始文案，避免漂移） */
export const END_HOME_RESUME: Resume = deepClone(initialResumeState);

export const START_HOME_RESUME: Resume = {
  profile: deepClone(initialProfile),
  personalSummary: {
    descriptions: END_HOME_RESUME.personalSummary.descriptions.map(() => ""),
  },
  workExperiences: END_HOME_RESUME.workExperiences.map(() =>
    deepClone(initialWorkExperience)
  ),
  projects: END_HOME_RESUME.projects.map(() => deepClone(initialProject)),
  educations: END_HOME_RESUME.educations.map(() => deepClone(initialEducation)),
  skills: {
    featuredSkills: END_HOME_RESUME.skills.featuredSkills.map((item) => ({
      skill: "",
      rating: item.rating,
    })),
    descriptions: [],
  },
  custom: {
    descriptions: [],
  },
};
