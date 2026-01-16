"use client";

import clsx from "clsx";

/**
 * Toggle - Switch moderne style Byredo
 *
 * Design Byredo :
 * - Switch élégant avec animation fluide
 * - États visuels clairs (on/off)
 * - Accessible (keyboard navigation)
 */

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: ToggleProps) {
  return (
    <label
      className={clsx(
        "flex items-center gap-3 cursor-pointer group",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={clsx(
            "relative w-11 h-6 rounded-full transition-colors duration-200",
            checked ? "bg-black" : "bg-black/20"
          )}
        >
          <div
            className={clsx(
              "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm",
              checked && "translate-x-5"
            )}
          />
        </div>
      </div>
      {label && (
        <span className="text-xs uppercase tracking-widest text-gray-700 group-hover:text-black transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}
