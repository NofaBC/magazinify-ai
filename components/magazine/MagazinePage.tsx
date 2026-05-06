import type { MagazinePage } from '@/types/magazine';

interface MagazinePageProps {
  page: MagazinePage;
}

export default function MagazinePageComponent({ page }: MagazinePageProps) {
  const isCover = page.type === 'cover';
  const isBackCover = page.type === 'back-cover';
  const isFullBleed = isCover || isBackCover;

  return (
    <div className={`w-full bg-white ${isFullBleed ? '' : 'px-8 sm:px-12 md:px-16 py-10'}`}
      style={{ minHeight: '85vh' }}
    >
      {/* Page content — full size, no overflow clipping */}
      <div
        className="magazine-content"
        style={{ fontSize: '1.05rem', lineHeight: '1.8' }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Page footer — not on covers */}
      {!isFullBleed && (
        <div className="mt-8 pt-3 flex items-center justify-between text-xs text-zinc-300 border-t border-zinc-100">
          <span></span>
          <span>Page {page.pageNumber}</span>
        </div>
      )}

      {/* Hidden SEO keywords */}
      {page.seoKeywords && page.seoKeywords.length > 0 && (
        <span className="hidden">{page.seoKeywords.join(', ')}</span>
      )}
    </div>
  );
}
