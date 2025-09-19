import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  BookOpen, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Palette, 
  Globe, 
  Users, 
  ArrowRight,
  Check,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Content Creation',
      description: 'Automatically generate engaging articles, headlines, and pull quotes tailored to your brand voice.',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Interactive Flipbook Experience',
      description: 'Create stunning digital magazines with realistic page-turning animations and mobile-responsive design.',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Brand Blueprint System',
      description: 'Define your brand colors, fonts, voice, and layout preferences once, then apply consistently across all issues.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Automated Publishing Pipeline',
      description: 'From topic discovery to final publication, our AI handles the entire content creation workflow.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Advanced Analytics',
      description: 'Track reader engagement, page views, click-through rates, and ad performance with detailed insights.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Tenant Publishing',
      description: 'Each client gets their own branded subdomain and customizable publishing environment.',
    },
  ];

  const plans = [
    {
      name: 'Basic',
      price: '$29',
      period: '/month',
      description: 'Perfect for small businesses and startups',
      features: [
        '8-12 pages per issue',
        'Shared subdomain',
        'Standard templates',
        'Basic analytics',
        '2 ad slots',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '$79',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: [
        '8-12 pages per issue',
        'Custom domain',
        'Premium templates',
        'Advanced analytics',
        'Video/audio embeds',
        '5 ad slots',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Customize',
      price: '$199',
      period: '/month',
      description: 'For enterprises and agencies',
      features: [
        'Up to 24 pages per issue',
        'Own domain',
        'Unlimited ad slots',
        'Forms & polls',
        'Multi-magazine support',
        'Team roles',
        'White-label options',
        'Dedicated support',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Debug indicator */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 text-sm">
        ✅ LandingPage mounted successfully
      </div>
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">Magazinify AI™</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-primary transition-colors">About</a>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-4 h-4 mr-1" />
            AI-Powered Magazine Publishing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Stunning
            <span className="text-primary block">Digital Magazines</span>
            with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your content strategy with our AI-powered platform that automatically generates, 
            designs, and publishes interactive flipbook magazines tailored to your brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Publish
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From AI content generation to interactive publishing, we've built the complete solution 
              for modern digital magazine creation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with our Basic plan and upgrade as your publishing needs grow. 
              All plans include our core AI features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="block">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of businesses already using Magazinify AI to create engaging, 
            professional magazines that captivate their audience.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <span className="text-xl font-bold">Magazinify AI™</span>
              </div>
              <p className="text-gray-400">
                The future of digital magazine publishing, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Magazinify AI™. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
