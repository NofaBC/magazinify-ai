'use client';

import { useRef, useCallback, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MagazinePage } from '@/types/magazine';
import MagazinePageComponent from './MagazinePage';

interface FlipbookViewerProps {
  pages: MagazinePage[];
  businessName: string;
}

export default function FlipbookViewer({ pages, businessName }: FlipbookViewerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBook = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const goNext = () => flipBook.current?.pageFlip()?.flipNext();
  const goPrev = () => flipBook.current?.pageFlip()?.flipPrev();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <HTMLFlipBook
          ref={flipBook}
          width={700}
          height={900}
          size="stretch"
          minWidth={350}
          maxWidth={800}
          minHeight={500}
          maxHeight={1000}
          showCover={true}
          onFlip={onFlip}
          className="shadow-2xl rounded-lg"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {pages.map((page) => (
            <div key={page.pageNumber} className="bg-white">
              <MagazinePageComponent page={page} />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-zinc-500 min-w-[80px] text-center">
          Page {currentPage + 1} of {pages.length}
        </span>
        <button
          onClick={goNext}
          disabled={currentPage >= pages.length - 1}
          className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
