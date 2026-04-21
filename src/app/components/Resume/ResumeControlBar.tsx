"use client";
import { useEffect } from "react";
import { useLocale } from "lib/i18n/LocaleProvider";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { usePDF } from "@react-pdf/renderer";
import dynamic from "next/dynamic";

const ResumeControlBar = ({
  document,
  fileName,
}: {
  document: JSX.Element;
  fileName: string;
}) => {
  const { t } = useLocale();

  const [instance, update] = usePDF({ document });

  // Hook to update pdf when document changes
  useEffect(() => {
    update();
  }, [update, document]);

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 flex h-[var(--resume-control-bar-height)] items-center justify-center px-[var(--resume-padding)] text-gray-600 md:justify-end">
      <a
        className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-0.5 hover:bg-gray-100"
        href={instance.url!}
        download={fileName}
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        <span className="whitespace-nowrap">
          {t("resumeControlBar.downloadResume")}
        </span>
      </a>
    </div>
  );
};

/**
 * Load ResumeControlBar client side since it uses usePDF, which is a web specific API
 */
export const ResumeControlBarCSR = dynamic(
  () => Promise.resolve(ResumeControlBar),
  {
    ssr: false,
  }
);

export const ResumeControlBarBorder = () => (
  <div className="absolute bottom-[var(--resume-control-bar-height)] w-full border-t-2 bg-gray-50" />
);
