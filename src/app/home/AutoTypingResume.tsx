"use client";
import { useEffect, useState, useRef } from "react";
import { ResumePDF } from "components/Resume/ResumePDF";
import { initialSettings } from "lib/redux/settingsSlice";
import { ResumeIframeCSR } from "components/Resume/ResumeIFrame";
import { START_HOME_RESUME, END_HOME_RESUME } from "home/constants";
import {
  START_HOME_RESUME_ZH,
  END_HOME_RESUME_ZH,
} from "home/constants-zh";
import { makeObjectCharIterator } from "lib/make-object-char-iterator";
import { useTailwindBreakpoints } from "lib/hooks/useTailwindBreakpoints";
import { deepClone } from "lib/deep-clone";
import { useLocale, useTranslations } from "lib/i18n/LocaleProvider";

// countObjectChar(END_HOME_RESUME) -> ~1800 chars
const INTERVAL_MS = 50; // 20 Intervals Per Second
const CHARS_PER_INTERVAL = 10;
// Auto Typing Time:
//  10 CHARS_PER_INTERVAL -> ~1800 / (20*10) = 9s (let's go with 9s so it feels fast)
//  9 CHARS_PER_INTERVAL -> ~1800 / (20*9) = 10s
//  8 CHARS_PER_INTERVAL -> ~1800 / (20*8) = 11s

const RESET_INTERVAL_MS = 60 * 1000; // 60s

export const AutoTypingResume = () => {
  const { locale } = useLocale();
  const th = useTranslations("home.autoTyping");

  const startResume = locale === "zh" ? START_HOME_RESUME_ZH : START_HOME_RESUME;
  const endResume = locale === "zh" ? END_HOME_RESUME_ZH : END_HOME_RESUME;

  const [resume, setResume] = useState(() => deepClone(START_HOME_RESUME));
  const resumeCharIterator = useRef(
    makeObjectCharIterator(startResume, endResume)
  );
  const hasSetEndResume = useRef(false);
  const { isLg } = useTailwindBreakpoints();

  useEffect(() => {
    resumeCharIterator.current = makeObjectCharIterator(startResume, endResume);
    hasSetEndResume.current = false;
    setResume(deepClone(startResume));
  }, [locale, startResume, endResume]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      let next = resumeCharIterator.current.next();
      for (let i = 0; i < CHARS_PER_INTERVAL - 1; i++) {
        next = resumeCharIterator.current.next();
      }
      if (!next.done) {
        setResume(next.value);
      } else {
        // Sometimes the iterator doesn't end on the last char,
        // so we manually set its end state here
        if (!hasSetEndResume.current) {
          setResume(endResume);
          hasSetEndResume.current = true;
        }
      }
    }, INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [endResume]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      resumeCharIterator.current = makeObjectCharIterator(
        startResume,
        endResume
      );
      hasSetEndResume.current = false;
    }, RESET_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [startResume, endResume]);

  return (
    <>
      <ResumeIframeCSR documentSize="Letter" scale={isLg ? 0.7 : 0.5}>
        <ResumePDF
          resume={resume}
          settings={{
            ...initialSettings,
            fontSize: "12",
            formToHeading: {
              ...initialSettings.formToHeading,
              personalSummary: resume.personalSummary.descriptions.some(
                (d) => d.length > 0
              )
                ? th("personalSummary")
                : "",
              workExperiences: resume.workExperiences[0].company
                ? th("workExperience")
                : "",
              projects: resume.projects[0].project ? th("project") : "",
              educations: resume.educations[0].school ? th("education") : "",
              skills: resume.skills.featuredSkills[0].skill ? th("skills") : "",
              custom: th("custom"),
            },
          }}
        />
      </ResumeIframeCSR>
    </>
  );
};
