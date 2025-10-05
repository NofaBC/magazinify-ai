"use client";
import { useEffect, useRef } from "react";
import PageFlip from "page-flip";

export default function FlipbookViewer({ pages }: { pages: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // @ts-ignore (lib ships untyped)
    const flip = new PageFlip(ref.current, {
      width: 800,  // adjust to your layout
      height: 600, // adjust to your layout
      size: "stretch",
      maxShadowOpacity: 0.2,
      showCover: true,
    });

    // Build DOM nodes for each page
    const wrappers: HTMLDivElement[] = pages.map(html => {
      const el = document.createElement("div");
      el.className = "page p-10 bg-white text-slate-900";
      el.innerHTML = html;
      return el;
    });

    flip.loadFromHTML(wrappers);

    return () => { try { flip?.destroy?.(); } catch {} };
  }, [pages]);

  return <div ref={ref} className="mx-auto my-8 w-full max-w-[900px]" />;
}
