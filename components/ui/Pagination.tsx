"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * Pagination - Composant de pagination style Byredo
 *
 * Design:
 * - Minimaliste avec bordures fines
 * - Boutons Prev/Next
 * - Numéros de page avec page active
 * - Responsive (compact sur mobile)
 *
 * Features:
 * - URL-based pagination (query param "page")
 * - SEO-friendly (liens <Link>)
 * - Ellipsis pour grandes listes (ex: 1 ... 5 6 7 ... 20)
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // URL de base (ex: "/products")
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  const searchParams = useSearchParams();

  // Si une seule page, ne rien afficher
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Génère l'URL avec le query param "page"
   */
  const getPageUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  /**
   * Génère la liste des numéros de page à afficher
   * Logique ellipsis: 1 ... 5 6 [7] 8 9 ... 20
   */
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 7; // Nombre max de pages visibles

    if (totalPages <= maxVisible) {
      // Si peu de pages, tout afficher
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher première page
      pages.push(1);

      if (currentPage <= 3) {
        // Début: 1 2 3 4 5 ... 20
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fin: 1 ... 16 17 18 19 20
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu: 1 ... 5 6 [7] 8 9 ... 20
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-2 py-8"
      aria-label="Pagination"
    >
      {/* Bouton Previous */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-2 px-4 py-2 border border-black/10 hover:border-black/30 transition-colors text-xs uppercase tracking-widest"
          aria-label="Page précédente"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          <span className="hidden md:inline">Précédent</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 border border-black/5 text-gray-300 text-xs uppercase tracking-widest cursor-not-allowed">
          <ChevronLeft size={14} strokeWidth={1.5} />
          <span className="hidden md:inline">Précédent</span>
        </div>
      )}

      {/* Numéros de page */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-xs text-gray-400"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`
                min-w-[40px] h-[40px] flex items-center justify-center
                text-xs font-medium border transition-colors
                ${
                  page === currentPage
                    ? "border-black bg-black text-white"
                    : "border-black/10 hover:border-black/30 text-black"
                }
              `}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Bouton Next */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-2 px-4 py-2 border border-black/10 hover:border-black/30 transition-colors text-xs uppercase tracking-widest"
          aria-label="Page suivante"
        >
          <span className="hidden md:inline">Suivant</span>
          <ChevronRight size={14} strokeWidth={1.5} />
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 border border-black/5 text-gray-300 text-xs uppercase tracking-widest cursor-not-allowed">
          <span className="hidden md:inline">Suivant</span>
          <ChevronRight size={14} strokeWidth={1.5} />
        </div>
      )}
    </nav>
  );
}
