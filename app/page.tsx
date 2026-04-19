import Link from 'next/link';
import { BookOpen, Sparkles, BarChart3, Mail, Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 49,
    pages: 12,
    features: [
      '12-page digital magazine',
      'AI-generated business articles',
      'SEO-optimized content',
      'Shareable flipbook link',
      'Monthly publication',
      'Email delivery',
    ],
  },
  {
    name: 'Pro',
    price: 99,
    pages: 24,
    popular: true,
    features: [
      '24-page digital magazine',
      'AI-generated business articles',
      'SEO-optimized content',
      'Shareable flipbook link',
      'Monthly publication',
      'Email delivery',
      'Ad slot support',
      'Brand customization',
      'PDF export',
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">Magazinify AI™</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600 tracking-wide uppercase">
          AI-Powered Monthly Publication
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Turn Your Business Into a{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900">
            Professional Magazine
          </span>
        </h1>
        <p className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          Enter your website URL and receive a polished, AI-generated digital magazine
          every month. Build authority, increase visibility, and drive traffic back to
          your business.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="#plans"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-zinc-800 transition-colors"
          >
            View Plans
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 border border-zinc-200 px-8 py-3.5 rounded-lg text-base font-medium hover:bg-zinc-50 transition-colors"
          >
            Start Free Preview
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Sparkles className="w-6 h-6" />, title: 'Choose a Plan', desc: 'Select Basic or Pro based on your needs.' },
            { icon: <BookOpen className="w-6 h-6" />, title: 'Enter Your URL', desc: 'We analyze your business and generate content.' },
            { icon: <BarChart3 className="w-6 h-6" />, title: 'AI Creates Your Issue', desc: 'Articles, images, and SEO-optimized pages.' },
            { icon: <Mail className="w-6 h-6" />, title: 'Share & Grow', desc: 'Get a flipbook link delivered to your inbox.' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                {step.icon}
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-zinc-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-3">Monthly Plans</h2>
        <p className="text-center text-zinc-500 mb-12">
          One subscription. One issue per month. Fresh content every time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? 'border-zinc-900 shadow-lg'
                  : 'border-zinc-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{plan.pages}-page magazine</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-zinc-700 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/register?plan=${plan.name.toLowerCase()}`}
                className={`mt-8 block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'border border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-400">
            © {new Date().getFullYear()} Magazinify AI™ — A NOFA AI Factory™ Product
          </span>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-zinc-600">Privacy</a>
            <a href="#" className="hover:text-zinc-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
