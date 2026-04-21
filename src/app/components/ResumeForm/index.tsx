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
import { parseResumeFromPdf } from "lib/parse-resume-from-pdf";
import { initialResumeState, resumeRehydrationDefaults, setResume, selectResume } from "lib/redux/resumeSlice";
import { WorkExperiencesForm } from "components/ResumeForm/WorkExperiencesForm";
import { EducationsForm } from "components/ResumeForm/EducationsForm";
import { ProjectsForm } from "components/ResumeForm/ProjectsForm";
import { SkillsForm } from "components/ResumeForm/SkillsForm";
import { ThemeForm } from "components/ResumeForm/ThemeForm";
import { CustomForm } from "components/ResumeForm/CustomForm";
import { PersonalSummaryForm } from "components/ResumeForm/PersonalSummaryForm";
import { cx } from "lib/cx";
import { Resume } from "lib/redux/types";

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

export const ResumeForm = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const dispatch = useAppDispatch();
  const resume = useAppSelector(selectResume);
  const formsOrder = useAppSelector(selectFormsOrder);
  const [isHover, setIsHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const checkAndConfirm = useCallback((action: () => void, message: string) => {
    if (isResumeChanged(resume, resumeRehydrationDefaults)) {
      if (window.confirm(message)) {
        action();
      }
    } else {
      action();
    }
  }, [resume]);
  
  const handleClearContent = () => {
    checkAndConfirm(
      () => dispatch(setResume(resumeRehydrationDefaults)),
      "直接清空已编辑内容，是否确认？"
    );
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
    if (!file.name.endsWith('.pdf')) {
      alert('请选择PDF文件');
      return;
    }
    
    const fileUrl = URL.createObjectURL(file);
    
    try {
      const parsedResume = await parseResumeFromPdf(fileUrl);
      dispatch(setResume(parsedResume));
    } catch (error) {
      console.error('解析PDF失败:', error);
      alert('解析PDF失败，请确保文件格式正确');
    } finally {
      URL.revokeObjectURL(fileUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleFillTemplate = () => {
    checkAndConfirm(
      () => dispatch(setResume(initialResumeState)),
      "填充模板简历将覆盖已编辑内容，是否确认？"
    );
  };
  
  useEffect(() => {
    // Add global scrollbar styling for webkit browsers
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
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
    <div
      className={cx(
        "flex justify-center scrollbar-thin scrollbar-track-gray-100 md:h-[calc(100vh-var(--top-nav-bar-height))] md:overflow-y-auto scrollbar-hidden",
        isHover ? "scrollbar-thumb-gray-200" : "scrollbar-thumb-gray-100"
      )}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <section className="flex w-full max-w-3xl flex-col gap-8 p-4 sm:p-6">
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
            <button 
              type="button" 
              onClick={handleFillTemplate}
              className="flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400"
            >
              填充模板
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
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return <Component key={form} />;
        })}
        <ThemeForm />
        <br />
      </section>
    </div>
  );
};
