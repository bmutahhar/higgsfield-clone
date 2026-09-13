import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SectionHeadProps {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHead({
  eyebrow,
  title,
  action,
  className,
}: SectionHeadProps) {
  return (
    <div className={cn("mb-3.5 flex items-end gap-4", className)}>
      <div>
        {eyebrow && <div className="hf-eyebrow mb-2">{eyebrow}</div>}
        <h2 className="text-h2">{title}</h2>
      </div>
      <span className="flex-1" />
      {action}
    </div>
  );
}
