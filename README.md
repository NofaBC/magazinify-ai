# Magazinify AI™ — MVP
Static landing + viewer demo.

## Files
- `index.html` — landing page (Tailwind CDN)
- `viewer.html` — flipbook-style preview with Print/Download
- `signup.html` — captures `?website=` and shows a stub form
- `logo.svg`, `favicon.ico`, `hero-texture.jpg`, `og-cover.jpg` — assets

## Deploy (Vercel)
- New Project → Import repo
- Framework: **Other**
- Build Command: *(empty)*
- Output Directory: **/**

## Next
1) Add `/api/generate` serverless route returning a real PDF.
2) Wire landing → generation pipeline (ingest → layout → render).
3) Replace viewer demo with generated content.
