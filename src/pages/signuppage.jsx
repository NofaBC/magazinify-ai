import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Get website from URL params (if available)
  const urlParams = new URLSearchParams(window.location.search);
  const websiteParam = urlParams.get('website') || '';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    website: websiteParam,
    industry: '',
    targetAudience: '',
    voiceTone: '',
    contentFocus: '',
    goals: '',
    plan: 'pro'
  });

  const [errors, setErrors] = useState({});

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Education',
    'Retail', 'Manufacturing', 'Consulting', 'Marketing', 'Legal',
    'Restaurant/Food', 'Fitness/Wellness', 'Travel', 'Other'
  ];

  const voiceTones = [
    'Professional & Authoritative',
    'Friendly & Conversational', 
    'Educational & Informative',
    'Inspiring & Motivational',
    'Technical & Expert',
    'Casual & Approachable'
  ];

  const contentFocuses = [
    'Industry News & Trends',
    'How-to Guides & Tips',
    'Case Studies & Success Stories', 
    'Product Features & Benefits',
    'Thought Leadership',
    'Company Culture & Values'
  ];

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (stepNumber === 2) {
      if (!formData.businessName) newErrors.businessName = 'Business name is required';
      if (!formData.website) newErrors.website = 'Website is required';
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.targetAudience) newErrors.targetAudience = 'Target audience is required';
    } else if (stepNumber === 3) {
      if (!formData.voiceTone) newErrors.voiceTone = 'Voice tone is required';
      if (!formData.contentFocus) newErrors.contentFocus = 'Content focus is required';
      if (!formData.goals) newErrors.goals = 'Goals are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      // Here you would call your signup API
      console.log('Signup data:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = '/dashboard';
    } catch (error) {
      setErrors({ submit: 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Start generating AI-powered magazines for your business</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-20 h-1 mx-2 ${
                    stepNumber < step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Account</span>
            <span>Business</span>
            <span>Preferences</span>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Account Information"}
              {step === 2 && "Business Details"}
              {step === 3 && "Magazine Preferences"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Create your secure account"}
              {step === 2 && "Tell us about your business"}
              {step === 3 && "Customize your magazine style"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Choose a strong password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Business Name"
                    value={formData.businessName}
                    onChange={(e) => updateFormData('businessName', e.target.value)}
                    className={errors.businessName ? 'border-red-500' : ''}
                  />
                  {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                </div>

                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://your-website.com"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <select
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.industry ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select your industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <textarea
                    id="targetAudience"
                    placeholder="Describe your target audience..."
                    value={formData.targetAudience}
                    onChange={(e) => updateFormData('targetAudience', e.target.value)}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.targetAudience ? 'border-red-500' : ''}`}
                    rows={3}
                  />
                  {errors.targetAudience && <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voiceTone">Voice & Tone</Label>
                  <select
                    id="voiceTone"
                    value={formData.voiceTone}
                    onChange={(e) => updateFormData('voiceTone', e.target.value)}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.voiceTone ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select voice tone</option>
                    {voiceTones.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                  {errors.voiceTone && <p className="text-red-500 text-sm mt-1">{errors.voiceTone}</p>}
                </div>

                <div>
                  <Label htmlFor="contentFocus">Content Focus</Label>
                  <select
                    id="contentFocus"
                    value={formData.contentFocus}
                    onChange={(e) => updateFormData('contentFocus', e.target.value)}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.contentFocus ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select content focus</option>
                    {contentFocuses.map((focus) => (
                      <option key={focus} value={focus}>
                        {focus}
                      </option>
                    ))}
                  </select>
                  {errors.contentFocus && <p className="text-red-500 text-sm mt-1">{errors.contentFocus}</p>}
                </div>

                <div>
                  <Label htmlFor="goals">Business Goals</Label>
                  <textarea
                    id="goals"
                    placeholder="What do you want to achieve with your magazine?"
                    value={formData.goals}
                    onChange={(e) => updateFormData('goals', e.target.value)}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.goals ? 'border-red-500' : ''}`}
                    rows={3}
                  />
                  {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals}</p>}
                </div>

                <div>
                  <Label>Subscription Plan</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {[
                      { id: 'basic', name: 'Basic', price: '$19', features: '8-12 pages, standard templates' },
                      { id: 'pro', name: 'Pro', price: '$59', features: 'Richer layouts, ad slots, analytics' },
                      { id: 'enterprise', name: 'Enterprise', price: '$99', features: 'Custom domain, 24 pages, concierge' }
                    ].map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.plan === plan.id 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => updateFormData('plan', plan.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-sm text-gray-600">{plan.features}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{plan.price}</p>
                            <p className="text-xs text-gray-500">per month</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <Button type="button" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
