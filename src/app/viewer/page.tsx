import FlipbookViewer from "@/components/FlipbookViewer";

export const metadata = { title: "Viewer Demo • Magazinify AI™" };

export default function ViewerPage() {
  const pages = [
    `<div class="flex h-full flex-col items-center justify-center">
       <h1 class="text-3xl font-bold">September 2025</h1>
       <p class="mt-2">Business-Branded Magazine Demo</p>
     </div>`,
    `<div><h2 class="text-2xl font-semibold">Feature Story</h2>
       <p class="mt-3 leading-relaxed">This is a demo page. Replace with generated article content and brand images.</p>
     </div>`,
    `<div><h2 class="text-2xl font-semibold">Call to Action</h2>
       <p class="mt-3">Visit <a class="text-blue-600 underline" href="https://yourbusiness.com" target="_blank" rel="noreferrer">yourbusiness.com</a></p>
     </div>`,
  ];

  return (
    <main className="px-6 py-10">
      <h1 className="mb-4 text-2xl font-semibold">Flipbook Demo</h1>
      <FlipbookViewer pages={pages} />
    </main>
  );
}
