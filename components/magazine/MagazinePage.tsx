import type { MagazinePage } from '@/types/magazine';

interface MagazinePageProps {
  page: MagazinePage;
}

export default function MagazinePageComponent({ page }: MagazinePageProps) {
  return (
    <div className="w-full h-full overflow-hidden bg-white p-6 flex flex-col">
      {/* Page header for article pages */}
      {page.type === 'article' && (
        <div className="mb-3 pb-2 border-b border-zinc-100">
          <h2 className="text-lg font-bold leading-snug">{page.title}</h2>
        </div>
      )}

      {/* Page content */}
      <div
        className="flex-1 overflow-hidden text-sm leading-relaxed prose prose-sm max-w-none
          prose-headings:text-zinc-900 prose-headings:font-bold
          prose-p:text-zinc-700 prose-p:mb-2
          prose-a:text-zinc-900 prose-a:font-medium
          prose-img:rounded-lg prose-img:my-2
          prose-ul:my-2 prose-li:text-zinc-700"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Page footer */}
      <div className="mt-auto pt-2 flex items-center justify-between text-xs text-zinc-400">
        <span>{page.type !== 'cover' && page.type !== 'back-cover' ? `Page ${page.pageNumber}` : ''}</span>
        {page.seoKeywords && page.seoKeywords.length > 0 && (
          <span className="hidden">{page.seoKeywords.join(', ')}</span>
        )}
      </div>
    </div>
  );
}
