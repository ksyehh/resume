"use client";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { ResumeCssPagedPreview } from "components/Resume/ResumeCssPagedPreview";
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
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  
  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback();

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

  useEffect(() => {
    if (typeof window !== "undefined" && window.document.fonts && window.document.fonts.ready) {
      window.document.fonts.ready.then(() => {
        setIsFontLoaded(true);
      });
    } else {
      setIsFontLoaded(true);
    }
  }, []);

  return (
    <>
      <NonEnglishFontsCSSLazyLoader />
      <div className="relative flex justify-center">
        <div className="relative flex w-full max-w-3xl min-w-0 flex-col">
          <section className="h-[calc(100vh-var(--top-nav-bar-height))] overflow-y-auto p-4 sm:p-6 scrollbar-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div ref={previewWidthRef} className="w-full">
              <ResumeCssPagedPreview
                resume={resume}
                settings={settings}
                containerWidth={previewContainerWidth}
                isFontLoaded={isFontLoaded}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
