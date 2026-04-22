"use client";

import { useState, useEffect, useCallback } from "react";
import { cx } from "lib/cx";

type ToastType = "info" | "warning" | "success" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, duration = 1000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [handleClose, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={cx(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center rounded-lg px-8 py-4 bg-gray-900 text-white shadow-2xl transition-all duration-300",
        isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}
    >
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// Toast 管理器，用于从任何地方显示 toast
let showToastFn: ((props: Omit<ToastProps, "onClose">) => void) | null = null;

export function showToast(props: Omit<ToastProps, "onClose">) {
  showToastFn?.(props);
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Array<{ id: number; props: Omit<ToastProps, "onClose"> }>>([]);

  useEffect(() => {
    showToastFn = (props) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, props }]);
    };

    return () => {
      showToastFn = null;
    };
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50">
        {toasts.map(({ id, props }) => (
          <div key={id} className="pointer-events-auto">
            <Toast {...props} onClose={() => removeToast(id)} />
          </div>
        ))}
      </div>
    </>
  );
}
