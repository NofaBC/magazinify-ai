import type { MagazinePage } from '@/types/magazine';

interface MagazinePageProps {
  page: MagazinePage;
}

export default function MagazinePageComponent({ page }: MagazinePageProps) {
  const isCover = page.type === 'cover';
  const isBackCover = page.type === 'back-cover';
  const isFullBleed = isCover || isBackCover;

  return (
    <div className={`w-full h-full overflow-hidden bg-white flex flex-col ${isFullBleed ? '' : 'p-8'}`}>
      {/* Page content */}
      <div
        className="flex-1 overflow-hidden magazine-content"
        style={{ fontSize: '0.95rem', lineHeight: '1.75' }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Page footer — not on covers */}
      {!isFullBleed && (
        <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-zinc-300 border-t border-zinc-100">
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
