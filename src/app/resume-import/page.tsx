"use client";
import { getHasUsedAppBefore } from "lib/redux/local-storage";
import { ResumeDropzone } from "components/ResumeDropzone";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "lib/i18n/LocaleProvider";

export default function ImportResume() {
  const t = useTranslations("resumeImport");
  const [hasUsedAppBefore, setHasUsedAppBefore] = useState(false);
  const [hasAddedResume, setHasAddedResume] = useState(false);
  const onFileUrlChange = (fileUrl: string) => {
    setHasAddedResume(Boolean(fileUrl));
  };

  useEffect(() => {
    setHasUsedAppBefore(getHasUsedAppBefore());
  }, []);

  return (
    <main className="min-h-[calc(100vh-var(--top-nav-bar-height))] px-4 pb-16 pt-4">
      <div className="mx-auto mt-10 max-w-3xl rounded-md border border-gray-200 px-10 py-10 text-center shadow-md">
        {!hasUsedAppBefore ? (
          <>
            <h1 className="text-lg font-semibold text-gray-900">
              {t("headingNew")}
            </h1>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-5"
            />
            {!hasAddedResume && (
              <>
                <OrDivider />
                <SectionWithHeadingAndCreateButton
                  heading={t("dontHaveHeading")}
                  buttonText={t("createScratch")}
                />
              </>
            )}
          </>
        ) : (
          <>
            {!hasAddedResume && (
              <>
                <SectionWithHeadingAndCreateButton
                  heading={t("savedHeading")}
                  buttonText={t("continueLabel")}
                />
                <OrDivider />
              </>
            )}
            <h1 className="font-semibold text-gray-900">
              {t("headingOverride")}
            </h1>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-5"
            />
          </>
        )}
      </div>
    </main>
  );
}

const OrDivider = () => {
  const t = useTranslations("resumeImport");
  return (
    <div
      className="mx-[-2.5rem] flex items-center pb-6 pt-8"
      aria-hidden="true"
    >
      <div className="flex-grow border-t border-gray-200" />
      <span className="mx-2 mt-[-2px] flex-shrink text-lg text-gray-400">
        {t("orDivider")}
      </span>
      <div className="flex-grow border-t border-gray-200" />
    </div>
  );
};

const SectionWithHeadingAndCreateButton = ({
  heading,
  buttonText,
}: {
  heading: string;
  buttonText: string;
}) => {
  return (
    <>
      <p className="font-semibold text-gray-900">{heading}</p>
      <div className="mt-5">
        <Link
          href="/resume-builder"
          className="outline-theme-blue inline-block rounded-full bg-sky-500 px-6 pb-2 pt-1.5 text-base font-semibold text-white"
        >
          {buttonText}
        </Link>
      </div>
    </>
  );
};
