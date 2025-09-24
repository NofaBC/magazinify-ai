// src/app/page.tsx
import Link from "next/link";

function SectionHeader({
  id,
  title,
  subtitle,
}: { id?: string; title: string; subtitle?: string }) {
  return (
    <header id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle ? <p className="mt-2 text-white/70">{subtitle}</p> : null}
    </header>
  );
}

/** Client form to capture business website and forward to signup */
function GetStartedForm() {
  "use client";
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const website = (form.elements.namedItem("websiteUrl") as HTMLInputElement)
      ?.value.trim();
    if (!website || !/^https?:\/\//i.test(website)) {
      alert("Please enter a full website URL, including https://");
      return;
    }
    const business =
      (form.elements.namedItem("businessName") as HTMLInputElement)?.value ||
      "";
    const niche =
      (form.elements.namedItem("niche") as HTMLInputElement)?.value || "";
    const params = new URLSearchParams({ website, business, niche });
    // Adjust target path later (e.g., /signup or /studio/onboarding)
    window.location.href = "/signup?" + params.toString();
  };

  return (
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <div className="sm:col-span-1">
        <label className="block text-sm text-white/70">Business Name</label>
        <input
          name="businessName"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none placeholder:text-white/40"
          placeholder="VisionWing Studio"
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label className="block text-sm text-white/70">Website URL</label>
        <input
          name="websiteUrl"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none placeholder:text-white/40"
          placeholder="https://yourbusiness.com"
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-white/70">Industry / Niche</label>
        <input
          name="niche"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none placeholder:text-white/40"
          placeholder="Real estate, coaching, wellness…"
        />
      </div>
      <div className="sm:col-span-2">
        <button className="w-full rounded-xl bg-sky-400 px-4 py-3 font-semibold text-slate-900 hover:bg-sky-300">
          Continue
        </button>
      </div>
      <p className="sm:col-span-2 text-center text-xs text-white/50">
        By continuing you agree to our Terms & Privacy.
      </p>
    </form>
  );
}

export default function Page() {
  return (
    <main className="bg-slate-950 text-white">
      {/* Top bar / nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Magazinify AI" className="h-8 w-8" />
            <span className="text-lg font-semibold">Magazinify AI™</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#how" className="text-white/80 hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="text-white/80 hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="text-white/80 hover:text-white">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/viewer"
              className="hidden rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/5 sm:inline-block"
            >
              View Demo
            </Link>
            <a
              href="#get-started"
              className="inline-block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white/90"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <img
            src="/hero-texture.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Your business.
              <br className="hidden sm:block" />
              Your magazine.{" "}
              <span className="text-sky-400">Powered by AI.</span>
            </h1>
            <p className="mt-6 text-lg text-white/80">
              Magazinify AI™ generates a fully-branded, interactive flipbook
              magazine for your business—every month. Articles, images, layout,
              and built-in calls-to-action that send readers straight to your
              website.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#get-started"
                className="rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 hover:bg-sky-300"
              >
                Start for $499 Setup
              </a>
              <Link
                href="/viewer"
                className="rounded-xl border border-white/20 px-5 py-3 hover:bg-white/5"
              >
                See a Flipbook Demo
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/60">
              Includes $499 one-time setup. Monthly plans from $19–$99.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader id="how" title="How it works" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "Step 1",
              title: "Set your Blueprint",
              text: "Tell us your business name, website, niche, voice, and goals. This becomes your brand DNA.",
            },
            {
              step: "Step 2",
              title: "AI creates your issue",
              text: "We draft 8–12 pages—articles, images, and layouts—optimized to link back to your website.",
            },
            {
              step: "Step 3",
              title: "Review & publish",
              text: "Approve, tweak, or regenerate any article. Then publish to a shareable link.",
            },
            {
              step: "Step 4",
              title: "Drive traffic",
              text: "Clear CTAs in header, footer, and articles send readers to your site with trackable links.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="text-sm uppercase tracking-wide text-white/60">
                {card.step}
              </div>
              <h3 className="mt-2 font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-white/75">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business-first CTA */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-sky-400/10 to-sky-400/5 p-6 sm:p-10">
          <h3 className="text-xl font-semibold">
            This is not a generic publication.
          </h3>
          <p className="mt-2 text-white/80">
            Every magazine is built for <strong>one business</strong> with deep
            linking to <strong>that business’s website</strong>.
          </p>
          <div className="mt-6">
            <a
              href="#get-started"
              className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-white/90"
            >
              Create My Business Magazine
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader id="pricing" title="Pricing" />
        <p className="mt-2 text-white/70">
          One-time setup fee of <strong>$499</strong> for all paid plans.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Basic */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Basic</h3>
            <p className="mt-2 text-white/70">
              8–12 pages, standard templates, AI text + stock images.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold">$19</span>
              <span className="text-white/60">/mo</span>
            </div>
            <p className="mt-2 text-sm text-white/60">+ $499 setup (one-time)</p>
            <a
              href="#get-started"
              className="mt-6 inline-block w-full rounded-lg bg-sky-400 px-4 py-2 text-center font-semibold text-slate-900 hover:bg-sky-300"
            >
              Start Basic
            </a>
          </div>
          {/* Pro */}
          <div className="rounded-2xl border border-sky-400/40 bg-sky-400/10 p-6 ring-1 ring-sky-400/30">
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="mt-2 text-white/70">
              Richer layouts, mixed AI/brand images, ad slots, analytics.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold">$49</span>
              <span className="text-white/60">/mo</span>
            </div>
            <p className="mt-2 text-sm text-white/60">+ $499 setup (one-time)</p>
            <a
              href="#get-started"
              className="mt-6 inline-block w-full rounded-lg bg-white px-4 py-2 text-center font-semibold text-slate-900 hover:bg-white/90"
            >
              Start Pro
            </a>
          </div>
          {/* Customize */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Customize</h3>
            <p className="mt-2 text-white/70">
              Custom domain, up to 24 pages, premium templates, concierge.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold">Contact</span>
            </div>
            <p className="mt-2 text-sm text-white/60">+ $499 setup (one-time)</p>
            <a
              href="#contact"
              className="mt-6 inline-block w-full rounded-lg border border-white/30 px-4 py-2 text-center font-semibold hover:bg-white/5"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section id="get-started" className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10">
          <h2 className="text-xl font-semibold">Tell us about your business</h2>
          <p className="mt-2 text-white/70">
            We’ll tailor every issue to your brand and link readers directly to
            your website.
          </p>
          <GetStartedForm />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-20 scroll-mt-24">
        <SectionHeader
          title="FAQ"
          subtitle="Answers to common questions about Magazinify AI™ and business-branded magazines."
        />
        <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
          {[
            {
              q: "Is this a generic magazine?",
              a: "No. Each magazine is tailored to one business using your Blueprint (brand, niche, voice) and links readers back to your website on every issue.",
            },
            {
              q: "Will each article include images?",
              a: "Yes. You can use AI-generated images, licensed stock, or your brand library. You can also manually replace any image before publishing.",
            },
            {
              q: "How do readers get to my website?",
              a: "Your URL appears in the header/footer, within article CTAs, and on the final page. Links use UTM tags so you can track traffic.",
            },
            {
              q: "What’s included in the $499 setup fee?",
              a: "Blueprint onboarding, brand theming, first issue scaffolding, and technical setup (Stripe, Firebase, custom domain wiring if on Pro/Customize).",
            },
            {
              q: "What are the monthly plans?",
              a: "Basic ($19/mo), Pro ($49/mo), Customize (contact). All paid plans include the one-time $499 setup fee at first checkout.",
            },
            {
              q: "Can I use my own domain?",
              a: "Yes on Pro/Customize. We guide you to add a CNAME or TXT record, then the magazine is served at magazine.yourdomain.com.",
            },
            {
              q: "How are issues generated?",
              a: "AI drafts 8–12 pages from your Blueprint, then you review, edit, or regenerate articles and images before publishing.",
            },
            {
              q: "Can I sell ads?",
              a: "Yes. Add ad slots per issue (client-owned or revenue-share). We track basic analytics; you can export impressions/clicks.",
            },
            {
              q: "Do I need a credit card to preview?",
              a: "No. You can generate a sample issue. Payment is required only when you publish under a paid plan.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Your published issues stay live for the current billing period; you can export content anytime.",
            },
          ].map((item, i) => (
            <details key={i} className="group open:bg-white/[0.03]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-left hover:bg-white/5">
                <span className="font-medium">{item.q}</span>
                <span className="ml-4 rounded-md border border-white/10 px-2 py-0.5 text-xs text-white/60 group-open:hidden">
                  +
                </span>
                <span className="ml-4 hidden rounded-md border border-white/10 px-2 py-0.5 text-xs text-white/60 group-open:inline">
                  −
                </span>
              </summary>
              <div className="px-5 pb-5 text-white/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Magazinify AI™
          </p>
          <p className="text-sm text-white/60">
            Every issue includes clear CTAs to your site.{" "}
            <a href="#get-started" className="underline decoration-sky-400/60 hover:text-white">
              Add your website
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
