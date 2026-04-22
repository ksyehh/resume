"use client";

import { cx } from "lib/cx";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ message = "正在解析...", size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <div className="relative flex items-center justify-center">
        <div
          className={cx(
            "animate-spin rounded-full border-sky-200 border-t-sky-500",
            sizeClasses[size]
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cx(
                  "animate-pulse rounded-full bg-sky-400",
                  dotSizes[size]
                )}
                style={{
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}

interface ParseLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function ParseLoadingOverlay({
  isLoading,
  message = "AI 解析中...",
}: ParseLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-xl">
        <Loading message={message} size="lg" />
        <p className="text-sm text-green-600 font-medium">
          个人隐私信息已屏蔽，不会传给AI
        </p>
      </div>
    </div>
  );
}
