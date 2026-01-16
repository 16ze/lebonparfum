"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

/**
 * Section - Composant de section collapsible avec icône et badge
 *
 * Design Byredo :
 * - Header avec icône, titre et badge optionnel
 * - Contenu collapsible
 * - Transitions fluides
 */

interface SectionProps {
  title: string;
  icon?: ReactNode;
  badge?: string | number;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Section({
  title,
  icon,
  badge,
  defaultOpen = true,
  children,
  className,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={clsx("border-b border-black/10", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 md:px-6 py-4 md:py-5 hover:bg-black/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-black/60 group-hover:text-black transition-colors">{icon}</div>}
          <h3 className="text-xs uppercase tracking-widest font-bold text-left">
            {title}
          </h3>
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-black text-white">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" strokeWidth={1.5} />
        )}
      </button>
      {isOpen && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
