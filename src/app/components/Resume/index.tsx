"use client";
import { useMemo, useLayoutEffect, useRef, useState } from "react";
import { BuilderResumePDF } from "components/Resume/ResumePDF/BuilderResumePDF";
import { ResumeCssPagedPreview } from "components/Resume/ResumeCssPagedPreview";
import {
  ResumeControlBarCSR,
  ResumeControlBarBorder,
} from "components/Resume/ResumeControlBar";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "components/fonts/hooks";
import { NonEnglishFontsCSSLazyLoader } from "components/fonts/NonEnglishFontsCSSLoader";

export const Resume = () => {
  const previewWidthRef = useRef<HTMLDivElement>(null);
  const [previewContainerWidth, setPreviewContainerWidth] = useState(0);
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  const document = useMemo(
    () => <BuilderResumePDF resume={resume} settings={settings} isPDF={true} />,
    [resume, settings]
  );

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(settings.fontFamily);

  useLayoutEffect(() => {
    const el = previewWidthRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      setPreviewContainerWidth(w);
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <NonEnglishFontsCSSLazyLoader />
      <div className="relative flex justify-center md:justify-start">
        <FlexboxSpacer maxWidth={50} className="hidden md:block" />
        <div className="relative flex w-full max-w-2xl min-w-0 flex-col">
          <section className="h-[calc(100vh-var(--top-nav-bar-height)-var(--resume-control-bar-height))] overflow-y-auto md:p-[var(--resume-padding)] md:pt-6">
            <div ref={previewWidthRef} className="w-full">
              <ResumeCssPagedPreview
                resume={resume}
                settings={settings}
                containerWidth={previewContainerWidth}
              />
            </div>
          </section>
          <ResumeControlBarCSR
            document={document}
            fileName={resume.profile.name + " - Resume"}
          />
        </div>
        <ResumeControlBarBorder />
      </div>
    </>
  );
};
