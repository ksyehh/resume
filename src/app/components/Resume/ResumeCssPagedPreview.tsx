"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
} from "lib/constants";
import { ResumeCssMirror } from "components/Resume/ResumeCssMirror/ResumeCssMirror";
import { spacingPx } from "components/Resume/ResumeCssMirror/spacingPx";
import type { Resume } from "lib/redux/types";
import type { Settings } from "lib/redux/settingsSlice";
import { DEFAULT_FONT_COLOR } from "lib/redux/settingsSlice";

type Props = {
  resume: Resume;
  settings: Settings;
  /** 与左侧表单栏 `max-w-2xl` 内容区等宽，用于计算缩放使 A4 宽度贴合容器 */
  containerWidth: number;
};

const MEASURE_DEBOUNCE_MS = 110;

function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) {
  const ref = useRef(fn);
  ref.current = fn;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        ref.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * 单栏简历内容（主题条 + 镜像），宽度由父级提供（每页内容区 = 页宽 − 左右 padding）。
 * 垂直方向不加 padding：分页时每页外壳单独画齐四周页边距。
 */
function MirrorColumn({
  resume,
  settings,
}: {
  resume: Resume;
  settings: Settings;
}) {
  const showStrip = Boolean(settings.themeColor);
  const accent = settings.themeColor || DEFAULT_FONT_COLOR;

  return (
    <div className="w-full">
      {showStrip && (
        <div
          style={{
            height: spacingPx(3.5),
            backgroundColor: accent,
            marginBottom: spacingPx(10),
          }}
        />
      )}
      <ResumeCssMirror resume={resume} settings={settings} />
    </div>
  );
}

export function ResumeCssPagedPreview({
  resume,
  settings,
  containerWidth,
}: Props) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const [pagesToShow, setPagesToShow] = useState(1);

  const docWidth =
    settings.documentSize === "A4" ? A4_WIDTH_PX : LETTER_WIDTH_PX;
  const docHeight =
    settings.documentSize === "A4" ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;
  const pad = spacingPx(20);
  /** 使逻辑页宽缩放到与左侧编辑区可用宽度一致 */
  const scale =
    containerWidth > 0 ? Math.max(0.05, containerWidth / docWidth) : 1;
  /** 与 PDF 一致：每页正文区域高度 = 页高 − 上下页边距 */
  const innerViewportHeight = Math.max(1, docHeight - 2 * pad);

  const measureHeight = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    setTotalHeight(el.scrollHeight);
  }, []);

  const debouncedMeasure = useDebouncedCallback(measureHeight, MEASURE_DEBOUNCE_MS);

  useLayoutEffect(() => {
    debouncedMeasure();
  }, [resume, settings, debouncedMeasure]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) measureHeight();
    };
    void document.fonts.ready.then(run);
    return () => {
      cancelled = true;
    };
  }, [measureHeight]);

  useEffect(() => {
    const el = measureRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => debouncedMeasure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [debouncedMeasure]);

  useEffect(() => {
    if (totalHeight <= 0) return;
    setPagesToShow(
      Math.max(1, Math.ceil(totalHeight / innerViewportHeight))
    );
  }, [totalHeight, innerViewportHeight]);

  const pages = useMemo(
    () => Array.from({ length: pagesToShow }, (_, i) => i),
    [pagesToShow]
  );

  const paperStyle = useMemo(
    () => ({
      width: docWidth * scale,
      marginBottom: 24,
    }),
    [docWidth, scale]
  );

  return (
    <>
      <div
        ref={measureRef}
        className="pointer-events-none absolute left-[-9999px] top-0 z-0 max-w-none overflow-visible opacity-0"
        style={{
          width: docWidth,
          boxSizing: "border-box",
          paddingLeft: pad,
          paddingRight: pad,
        }}
        aria-hidden
      >
        <MirrorColumn resume={resume} settings={settings} />
      </div>

      <div className="flex flex-col items-center pb-4">
        {pages.map((pageIndex) => (
          <div
            key={pageIndex}
            className="origin-top-left overflow-hidden rounded-sm bg-white shadow-lg"
            style={{
              ...paperStyle,
              height: docHeight * scale,
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: docWidth,
                height: docHeight,
              }}
            >
              <div
                className="box-border overflow-hidden bg-white"
                style={{
                  height: docHeight,
                  padding: pad,
                }}
              >
                <div
                  className="overflow-hidden"
                  style={{ height: innerViewportHeight }}
                >
                  <div
                    style={{
                      transform: `translateY(-${pageIndex * innerViewportHeight}px)`,
                    }}
                  >
                    <MirrorColumn resume={resume} settings={settings} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
