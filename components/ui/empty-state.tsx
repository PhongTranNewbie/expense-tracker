import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30",
        className
      )}
    >
      <p className={cn("text-sm text-gray-500 dark:text-gray-400", titleClassName)}>
        {title}
      </p>
      {description ? (
        <p
          className={cn(
            "mt-1 text-sm text-gray-500 dark:text-gray-400",
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
