import type { MagazinePage } from '@/types/magazine';

interface MagazinePageProps {
  page: MagazinePage;
}

export default function MagazinePageComponent({ page }: MagazinePageProps) {
  const isCover = page.type === 'cover';
  const isBackCover = page.type === 'back-cover';
  const isFullBleed = isCover || isBackCover;

  return (
    <div className={`w-full h-full overflow-hidden bg-white flex flex-col ${isFullBleed ? '' : 'p-5'}`}>
      {/* Page content */}
      <div
        className="flex-1 overflow-hidden magazine-content"
        style={{ fontSize: '0.85rem', lineHeight: '1.65' }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Page footer — not on covers */}
      {!isFullBleed && (
        <div className="mt-auto pt-1.5 flex items-center justify-between text-[10px] text-zinc-300 border-t border-zinc-50">
          <span>{page.title !== page.content ? '' : ''}</span>
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
