import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/core/icon";
import { IconButton } from "@/components/core/icon-button";
import { cn } from "@/lib/cn";

export type ToastTone = "neutral" | "success" | "warning" | "danger" | "accent";

const TOAST_TONES: Record<ToastTone, { icon: IconName; className: string }> = {
  neutral: { icon: "info", className: "text-secondary" },
  success: { icon: "circle-check", className: "text-success" },
  warning: { icon: "triangle-alert", className: "text-warning" },
  danger: { icon: "circle-alert", className: "text-danger" },
  accent: { icon: "sparkles", className: "text-lime" },
};

export interface ToastProps {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

/** Status colours exist for toasts and validation only, never decoration. */
export function Toast({
  title,
  description,
  tone = "neutral",
  action,
  onClose,
  className,
}: ToastProps) {
  const t = TOAST_TONES[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-90 items-start gap-3 rounded-xl border border-hairline bg-glass px-3.5 py-3",
        "shadow-e3 backdrop-blur-[20px] backdrop-saturate-[1.4]",
        "animate-rise-in motion-reduce:animate-none",
        className,
      )}
    >
      <Icon name={t.icon} size={18} className={cn("mt-px", t.className)} />
      <div className="min-w-0 flex-1">
        <div className="text-body-sm/[1.3] font-medium text-primary">
          {title}
        </div>
        {description && (
          <div className="mt-0.5 text-caption/[1.4] text-muted">
            {description}
          </div>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} />
      )}
    </div>
  );
}
