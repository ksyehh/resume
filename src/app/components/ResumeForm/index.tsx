"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  useAppDispatch,
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "lib/redux/hooks";
import { ShowForm, selectFormsOrder } from "lib/redux/settingsSlice";
import { ProfileForm } from "components/ResumeForm/ProfileForm";
import { extractTextOnlyFromPdf } from "lib/parse-resume-from-pdf/extract-text-only";
import { resumeRehydrationDefaults, setResume, selectResume } from "lib/redux/resumeSlice";
import { clearScoreResult } from "lib/redux/scoreSlice";
import { WorkExperiencesForm } from "components/ResumeForm/WorkExperiencesForm";
import { EducationsForm } from "components/ResumeForm/EducationsForm";
import { ProjectsForm } from "components/ResumeForm/ProjectsForm";
import { SkillsForm } from "components/ResumeForm/SkillsForm";
import { ThemeForm } from "components/ResumeForm/ThemeForm";
import { CustomForm } from "components/ResumeForm/CustomForm";
import { PersonalSummaryForm } from "components/ResumeForm/PersonalSummaryForm";
import { ParseLoadingOverlay } from "components/Loading";
import { ResumeScoreSection } from "components/ResumeForm/ResumeScoreSection";
import { cx } from "lib/cx";
import { Resume } from "lib/redux/types";
import { sanitizeResumeText } from "lib/sanitize/sanitize-resume";

interface ParseState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

const isResumeChanged = (resume: Resume, defaultResume: Resume): boolean => {
  return JSON.stringify(resume) !== JSON.stringify(defaultResume);
};

const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
  personalSummary: PersonalSummaryForm,
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  skills: SkillsForm,
  custom: CustomForm,
};

type ActiveView = "edit" | "score";

export const ResumeForm = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const dispatch = useAppDispatch();
  const resume = useAppSelector(selectResume);
  const formsOrder = useAppSelector(selectFormsOrder);
  const [isHover, setIsHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseState, setParseState] = useState<ParseState>({
    status: "idle",
    message: "",
  });
  const [isFromAI, setIsFromAI] = useState(false);
  const resumeAfterAIRef = useRef<string>("");
  const [activeView, setActiveView] = useState<ActiveView>("edit");

  const checkAndConfirm = useCallback((action: () => void, message: string) => {
    if (isResumeChanged(resume, resumeRehydrationDefaults)) {
      if (window.confirm(message)) {
        action();
      }
    } else {
      action();
    }
  }, [resume]);

  useEffect(() => {
    if (isFromAI && resumeAfterAIRef.current) {
      const currentResumeJson = JSON.stringify(resume);
      if (currentResumeJson !== resumeAfterAIRef.current) {
        setIsFromAI(false);
        resumeAfterAIRef.current = "";
      }
    }
  }, [resume, isFromAI]);

  const handleClearContent = () => {
    checkAndConfirm(
      () => dispatch(setResume(resumeRehydrationDefaults)),
      "直接清空已编辑内容，是否确认？"
    );
    setIsFromAI(false);
    resumeAfterAIRef.current = "";
  };

  const handleImportPDF = () => {
    checkAndConfirm(
      () => fileInputRef.current?.click(),
      "导入PDF简历将覆盖已编辑内容，是否确认？"
    );
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith(".pdf")) {
      alert("请选择PDF文件");
      return;
    }

    const fileUrl = URL.createObjectURL(file);

    setParseState({ status: "loading", message: "AI 解析中..." });

    try {
      console.log("开始提取PDF文字...");
      const textContent = await extractTextOnlyFromPdf(fileUrl);
      console.log("提取到的文字:", textContent);
      console.log("文字长度:", textContent.length);

      if (!textContent || textContent.trim().length === 0) {
        throw new Error("无法提取文字");
      }

      const sanitizedText = sanitizeResumeText(textContent);
      console.log("处理后的文字:", sanitizedText);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: sanitizedText }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "AI解析失败");
      }

      const normalizedResume: Resume = {
        profile: {
          name: result.data.profile?.name || "",
          email: result.data.profile?.email || "",
          phone: result.data.profile?.phone || "",
          url: result.data.profile?.url || "",
          summary: result.data.profile?.summary || "",
          location: result.data.profile?.location || "",
        },
        personalSummary: {
          descriptions: result.data.personalSummary?.descriptions || [],
        },
        workExperiences: result.data.workExperiences?.length > 0
          ? result.data.workExperiences.map((exp: any) => ({
              company: exp.company || "",
              jobTitle: exp.jobTitle || "",
              date: exp.date || "",
              descriptions: exp.descriptions || [],
            }))
          : [{
              company: "",
              jobTitle: "",
              date: "",
              descriptions: [],
            }],
        projects: result.data.projects?.length > 0
          ? result.data.projects.map((proj: any) => ({
              project: proj.project || "",
              date: proj.date || "",
              descriptions: proj.descriptions || [],
            }))
          : [{
              project: "",
              date: "",
              descriptions: [],
            }],
        educations: result.data.educations?.length > 0
          ? result.data.educations.map((edu: any) => ({
              school: edu.school || "",
              degree: edu.degree || "",
              date: edu.date || "",
              gpa: edu.gpa || "",
              descriptions: edu.descriptions || [],
            }))
          : [{
              school: "",
              degree: "",
              date: "",
              gpa: "",
              descriptions: [],
            }],
        skills: {
          featuredSkills: result.data.skills?.featuredSkills?.length > 0
            ? result.data.skills.featuredSkills.map((skill: any) => ({
                skill: skill.skill || "",
                rating: skill.rating || 3,
              }))
            : [],
          descriptions: result.data.skills?.descriptions || [],
        },
        custom: {
          descriptions: result.data.custom?.descriptions || [],
        },
      };

      dispatch(setResume(normalizedResume));
      dispatch(clearScoreResult()); // 重置AI打分状态
      resumeAfterAIRef.current = JSON.stringify(normalizedResume);
      setIsFromAI(true);
      setParseState({ status: "success", message: "解析成功！" });

      setTimeout(() => {
        setParseState({ status: "idle", message: "" });
      }, 2000);
    } catch (error) {
      console.error("解析PDF失败:", error);
      const isNoText = error instanceof Error && error.message === "无法提取文字";
      const errorMessage = isNoText
        ? "无法从PDF中提取文字内容\n\n提示：\n• 可能是扫描件或图片PDF\n• 请使用可编辑的PDF\n• 或者手动填写简历信息"
        : error instanceof Error
          ? error.message
          : "解析PDF失败，请确保文件格式正确";
      
      setParseState({ status: "error", message: errorMessage });
      alert(errorMessage);

      setTimeout(() => {
        setParseState({ status: "idle", message: "" });
      }, 3000);
    } finally {
      URL.revokeObjectURL(fileUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = `
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <>
      <ParseLoadingOverlay
        isLoading={parseState.status === "loading"}
        message={parseState.message}
      />
      {/* 顶部切换按钮 */}
      <div className="flex justify-center py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveView("edit")}
            className={cx(
              "px-6 py-2 rounded-md text-sm font-medium transition-all",
              activeView === "edit"
                ? "bg-blue-500 text-white shadow"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            简历编辑
          </button>
          <button
            onClick={() => setActiveView("score")}
            className={cx(
              "px-6 py-2 rounded-md text-sm font-medium transition-all",
              activeView === "score"
                ? "bg-blue-500 text-white shadow"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            AI 打分
          </button>
        </div>
      </div>
      {/* 滑动切换区域 */}
      <div
        className={cx(
          "flex justify-center scrollbar-thin scrollbar-track-gray-100 md:h-[calc(100vh-var(--top-nav-bar-height)-80px)] md:overflow-y-auto scrollbar-hidden overflow-hidden",
          isHover ? "scrollbar-thumb-gray-200" : "scrollbar-thumb-gray-100"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseOver={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <div className="relative w-full max-w-3xl">
          {/* 滑动容器 */}
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: activeView === "edit" ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            {/* 简历编辑视图 */}
            <div className="w-full flex-shrink-0 p-4 sm:p-6">
              <section className="flex w-full flex-col gap-8">
                <section className="flex flex-col gap-3 rounded-sm bg-white p-5 pt-4 shadow-lg">
                  <div className="flex flex-row gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={handleImportPDF}
                      className="flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
                    >
                      导入PDF简历
                    </button>
                    <button
                      type="button"
                      onClick={handleClearContent}
                      className="flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
                    >
                      清空内容
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </section>
                {isFromAI && (
                  <div className="rounded-sm bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200">
                    以下内容由AI解析填充，请仔细核对。（个人信息部分请手动填入）
                  </div>
                )}
                <ProfileForm />
                {formsOrder.map((form) => {
                  const Component = formTypeToComponent[form];
                  return <Component key={form} />;
                })}
                <ThemeForm />
                <br />
              </section>
            </div>
            {/* AI打分视图 */}
            <div className="w-full flex-shrink-0 p-4 sm:p-6">
              <section className="flex w-full flex-col">
                <ResumeScoreSection />
                <br />
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
