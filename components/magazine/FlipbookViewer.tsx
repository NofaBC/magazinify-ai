'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import type { MagazinePage } from '@/types/magazine';
import MagazinePageComponent from './MagazinePage';

interface FlipbookViewerProps {
  pages: MagazinePage[];
  businessName: string;
}

export default function FlipbookViewer({ pages, businessName }: FlipbookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const scrollToPage = useCallback((index: number) => {
    if (index < 0 || index >= pages.length) return;
    const container = containerRef.current;
    if (!container) return;
    const pageEl = container.children[index] as HTMLElement;
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(index);
    }
  }, [pages.length]);

  // Track current page on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-page-index'));
            if (!isNaN(idx)) setCurrentPage(idx);
          }
        });
      },
      { root: null, threshold: 0.5 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [pages]);

  return (
    <div className="relative">
      {/* Magazine pages */}
      <div ref={containerRef} className="space-y-4 max-w-3xl mx-auto">
        {pages.map((page, idx) => (
          <div
            key={page.pageNumber}
            data-page-index={idx}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            style={{ minHeight: '85vh' }}
          >
            <MagazinePageComponent page={page} />
          </div>
        ))}
      </div>

      {/* Fixed navigation bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-full shadow-lg px-4 py-2 flex items-center gap-3 z-50">
        <button
          onClick={() => scrollToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <span className="text-xs text-zinc-500 min-w-[70px] text-center font-medium">
          {currentPage + 1} / {pages.length}
        </span>

        <button
          onClick={() => scrollToPage(currentPage + 1)}
          disabled={currentPage >= pages.length - 1}
          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
