"use client";

import { useEffect } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  // Handle Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, isLoading]);

  if (!open) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
      : "inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 dark:disabled:hover:bg-zinc-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={isLoading ? undefined : onClose}
        disabled={isLoading}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative z-10 flex w-full max-w-md flex-col rounded-t-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-2xl"
      >
        <div className="flex flex-col gap-2 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
          <h3
            id="confirm-dialog-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {title}
          </h3>
          <p
            id="confirm-dialog-description"
            className="text-sm text-zinc-600 dark:text-zinc-400"
          >
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end sm:px-5 sm:pb-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-zinc-900"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmButtonClass}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
