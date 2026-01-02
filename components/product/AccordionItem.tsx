"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * AccordionItem - Composant accordéon pour les détails produit
 *
 * Design Byredo :
 * - Bordure fine entre chaque item
 * - Animation fluide d'ouverture/fermeture
 * - Style minimaliste avec chevron
 */
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /**
   * toggle - Bascule l'état d'ouverture de l'accordéon
   */
  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="border-b border-black/10 last:border-b-0">
      {/* Header cliquable */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-4 text-left uppercase tracking-widest text-xs font-bold hover:opacity-50 transition-opacity"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Contenu (animé) */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}


