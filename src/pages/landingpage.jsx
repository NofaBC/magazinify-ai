import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const LandingPage = () => {
  const [website, setWebsite] = useState('');

  const handleGetStarted = () => {
    if (website.trim()) {
      window.location.href = `/signup?website=${encodeURIComponent(website)}`;
    } else {
      window.location.href = '/signup';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Magazinify AI™
            </span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-indigo-100 text-indigo-800">
            AI-Powered Magazine Generation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Business-Branded AI Magazines
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Magazinify AI™ generates a fully-branded, interactive flipbook magazine for your business—every month. 
            Articles, images, layout, and built-in calls-to-action that send readers straight to your website.
          </p>
          <p className="text-lg text-indigo-600 font-semibold mb-12">
            Includes $499 one-time setup. Monthly plans from $19–$99.
          </p>
          
          {/* CTA Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Start Your Magazine</h3>
            <div className="space-y-4">
              <Input
                type="url"
                placeholder="Enter your website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="text-center text-lg py-3"
              />
              <Button 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-3"
                size="lg"
              >
                Get Started Now
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required to start</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Brand Setup",
                description: "Tell us your business name, website, niche, voice, and goals. This becomes your brand DNA."
              },
              {
                step: "2", 
                title: "AI Generation",
                description: "We draft 8–12 pages—articles, images, and layouts—optimized to link back to your website."
              },
              {
                step: "3",
                title: "Review & Edit",
                description: "Approve, tweak, or regenerate any article. Then publish to a shareable link."
              },
              {
                step: "4",
                title: "Drive Traffic",
                description: "Every issue features clear CTAs (header, footer, and in-article) that send readers to your site."
              }
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Why Choose Magazinify AI™</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "AI Content Pipeline with topic discovery and article writing",
              "Multi-Tenant Architecture for scalable business management", 
              "Client Blueprint system for brand identity consistency",
              "Flexible Subscription Plans with feature flags",
              "Dynamic Ad Slots for additional revenue streams",
              "Interactive Flipbook & SEO-Friendly HTML versions",
              "Complete Publishing Lifecycle with editor review",
              "Integrated Analytics Dashboard for performance tracking"
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-xl font-semibold text-indigo-600 mb-4">
              Every magazine is built for one business with deep linking to that business's website.
            </p>
            <p className="text-lg text-gray-600">
              We'll tailor every issue to your brand and link readers directly to your website.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-16">One-time setup fee of $499 for all paid plans.</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$19",
                setup: "$499",
                features: [
                  "8–12 pages",
                  "Standard templates", 
                  "AI text + stock images",
                  "Monthly generation",
                  "Basic analytics"
                ]
              },
              {
                name: "Pro",
                price: "$59", 
                setup: "$499",
                popular: true,
                features: [
                  "Everything in Basic",
                  "Richer layouts",
                  "Mixed AI/brand images",
                  "Ad slots",
                  "Advanced analytics",
                  "Priority support"
                ]
              },
              {
                name: "Enterprise",
                price: "$99",
                setup: "$499", 
                features: [
                  "Everything in Pro",
                  "Custom domain",
                  "Up to 24 pages",
                  "Premium templates",
                  "Concierge service",
                  "White-label options"
                ]
              }
            ].map((plan, index) => (
              <Card key={index} className={`text-center ${plan.popular ? 'ring-2 ring-indigo-600 scale-105' : ''} hover:shadow-xl transition-all`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-indigo-600 font-medium">+ {plan.setup} setup (one-time)</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'variant-outline'}`}
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold">Magazinify AI™</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Magazinify AI™. All rights reserved. The future of digital magazine publishing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
