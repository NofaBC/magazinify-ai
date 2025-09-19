import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { dbService } from '../lib/database/firebase.js';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { 
  Palette, 
  Type, 
  Layout, 
  Mic, 
  Target, 
  Rss, 
  Save, 
  Plus, 
  X,
  Settings,
  Eye,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const BlueprintPage = () => {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [magazines, setMagazines] = useState([]);
  const [selectedMagazine, setSelectedMagazine] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [formData, setFormData] = useState({
    structure: {
      pages: 12,
      sections: ['cover', 'toc', 'feature', 'spotlight', 'tips', 'ads', 'closing'],
      adSlots: ['p4', 'p10']
    },
    voice: {
      tone: 'professional, informative',
      readingLevel: '8-10'
    },
    niche: {
      topics: [],
      geo: [],
      keywords: []
    },
    sources: {
      rss: [],
      uploadsAllowed: true
    },
    cadence: 'monthly',
    approvalMode: 'semi_auto'
  });

  useEffect(() => {
    if (tenant) {
      loadMagazines();
    }
  }, [tenant]);

  useEffect(() => {
    if (selectedMagazine) {
      loadBlueprint();
    }
  }, [selectedMagazine]);

  const loadMagazines = async () => {
    try {
      setLoading(true);
      const magazinesData = await dbService.magazines.getByTenant(tenant.id);
      setMagazines(magazinesData);
      
      if (magazinesData.length > 0) {
        setSelectedMagazine(magazinesData[0]);
      }
    } catch (error) {
      console.error('Error loading magazines:', error);
      toast.error('Failed to load magazines');
    } finally {
      setLoading(false);
    }
  };

  const loadBlueprint = async () => {
    if (!selectedMagazine) return;
    
    try {
      const blueprintData = await dbService.blueprints.get(tenant.id, selectedMagazine.id);
      setBlueprint(blueprintData);
      setFormData(blueprintData);
    } catch (error) {
      console.error('Error loading blueprint:', error);
      // Use default blueprint if none exists
      const defaultBlueprint = dbService.blueprints.getDefault();
      setBlueprint(defaultBlueprint);
      setFormData(defaultBlueprint);
    }
  };

  const handleSave = async () => {
    if (!selectedMagazine) {
      toast.error('Please select a magazine first');
      return;
    }

    try {
      setSaving(true);
      
      // Validate page count against plan limits
      const maxPages = tenant?.featureFlags?.maxPages || 12;
      if (formData.structure.pages > maxPages) {
        toast.error(`Page count exceeds plan limit of ${maxPages} pages`);
        return;
      }

      await dbService.blueprints.update(tenant.id, selectedMagazine.id, formData);
      setBlueprint(formData);
      toast.success('Blueprint saved successfully!');
    } catch (error) {
      console.error('Error saving blueprint:', error);
      toast.error('Failed to save blueprint');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (path, item) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]] || [];
      if (!array.includes(item) && item.trim()) {
        current[keys[keys.length - 1]] = [...array, item.trim()];
      }
      
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]] || [];
      current[keys[keys.length - 1]] = array.filter((_, i) => i !== index);
      
      return newData;
    });
  };

  const sectionOptions = [
    { value: 'cover', label: 'Cover Page', description: 'Magazine cover with title and hero image' },
    { value: 'toc', label: 'Table of Contents', description: 'List of articles and page numbers' },
    { value: 'feature', label: 'Feature Article', description: 'Main story or highlight' },
    { value: 'spotlight', label: 'Spotlight', description: 'Featured content or interview' },
    { value: 'news', label: 'News & Updates', description: 'Industry news and brief updates' },
    { value: 'tips', label: 'Tips & Insights', description: 'Practical advice and insights' },
    { value: 'ads', label: 'Advertisement', description: 'Sponsored content placement' },
    { value: 'closing', label: 'Closing Page', description: 'Back cover or final thoughts' }
  ];

  const toneOptions = [
    'professional, informative',
    'casual, friendly',
    'authoritative, expert',
    'conversational, approachable',
    'technical, detailed',
    'creative, inspiring'
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (magazines.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Magazines Found</h2>
            <p className="text-gray-600 mb-6">
              You need to create a magazine before you can configure its blueprint.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Magazine
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blueprint Configuration</h1>
            <p className="text-gray-600 mt-1">
              Define your magazine's brand, voice, and content structure
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select
              value={selectedMagazine?.id || ''}
              onValueChange={(value) => {
                const magazine = magazines.find(m => m.id === value);
                setSelectedMagazine(magazine);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a magazine" />
              </SelectTrigger>
              <SelectContent>
                {magazines.map((magazine) => (
                  <SelectItem key={magazine.id} value={magazine.id}>
                    {magazine.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={saving || !selectedMagazine}>
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Blueprint
                </>
              )}
            </Button>
          </div>
        </div>

        {selectedMagazine && (
          <Tabs defaultValue="structure" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="structure" className="flex items-center">
                <Layout className="w-4 h-4 mr-2" />
                Structure
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Voice & Tone
              </TabsTrigger>
              <TabsTrigger value="niche" className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Niche & Topics
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center">
                <Rss className="w-4 h-4 mr-2" />
                Content Sources
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Structure Tab */}
            <TabsContent value="structure" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Structure</CardTitle>
                    <CardDescription>
                      Configure the basic layout and page count for your magazine
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="pages">Target Page Count</Label>
                      <Input
                        id="pages"
                        type="number"
                        min="4"
                        max={tenant?.featureFlags?.maxPages || 12}
                        value={formData.structure.pages}
                        onChange={(e) => handleInputChange('structure.pages', parseInt(e.target.value))}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: {tenant?.featureFlags?.maxPages || 12} pages (plan limit)
                      </p>
                    </div>

                    <div>
                      <Label>Ad Slot Pages</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.structure.adSlots.map((slot, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            {slot}
                            <button
                              onClick={() => removeArrayItem('structure.adSlots', index)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex mt-2">
                        <Input
                          placeholder="e.g., p4, p10"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addArrayItem('structure.adSlots', e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input');
                            addArrayItem('structure.adSlots', input.value);
                            input.value = '';
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Section Order</CardTitle>
                    <CardDescription>
                      Define the sections and their order in your magazine
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.structure.sections.map((section, index) => {
                        const sectionInfo = sectionOptions.find(s => s.value === section);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium">{sectionInfo?.label || section}</p>
                                <p className="text-xs text-gray-500">{sectionInfo?.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeArrayItem('structure.sections', index)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <Separator className="my-4" />

                    <Select
                      onValueChange={(value) => {
                        addArrayItem('structure.sections', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add a section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionOptions
                          .filter(option => !formData.structure.sections.includes(option.value))
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div>
                                <p className="font-medium">{option.label}</p>
                                <p className="text-xs text-gray-500">{option.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Voice & Tone Tab */}
            <TabsContent value="voice" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voice & Tone Configuration</CardTitle>
                  <CardDescription>
                    Define how your AI should write content for your magazine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="tone">Writing Tone</Label>
                    <Select
                      value={formData.voice.tone}
                      onValueChange={(value) => handleInputChange('voice.tone', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((tone) => (
                          <SelectItem key={tone} value={tone}>
                            {tone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="readingLevel">Reading Level</Label>
                    <Select
                      value={formData.voice.readingLevel}
                      onValueChange={(value) => handleInputChange('voice.readingLevel', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-8">Elementary (6-8th grade)</SelectItem>
                        <SelectItem value="8-10">Middle School (8-10th grade)</SelectItem>
                        <SelectItem value="10-12">High School (10-12th grade)</SelectItem>
                        <SelectItem value="12+">College Level (12+ grade)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">AI Writing Preview</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          With your current settings, the AI will write in a <strong>{formData.voice.tone}</strong> style 
                          at a <strong>{formData.voice.readingLevel} grade</strong> reading level.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Niche & Topics Tab */}
            <TabsContent value="niche" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Topics & Keywords</CardTitle>
                    <CardDescription>
                      Define the main topics and keywords for content generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Primary Topics</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.niche.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            {topic}
                            <button
                              onClick={() => removeArrayItem('niche.topics', index)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a topic (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('niche.topics', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Keywords</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.niche.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="flex items-center">
                            {keyword}
                            <button
                              onClick={() => removeArrayItem('niche.keywords', index)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a keyword (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('niche.keywords', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Focus</CardTitle>
                    <CardDescription>
                      Specify geographic regions for localized content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label>Target Regions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.niche.geo.map((region, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            {region}
                            <button
                              onClick={() => removeArrayItem('niche.geo', index)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a region (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('niche.geo', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Examples: Global, North America, Europe, Asia-Pacific, etc.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Sources Tab */}
            <TabsContent value="sources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Sources</CardTitle>
                  <CardDescription>
                    Configure RSS feeds and content sources for AI inspiration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>RSS Feeds</Label>
                    <div className="space-y-2 mt-2">
                      {formData.sources.rss.map((feed, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input value={feed} readOnly className="flex-1" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('sources.rss', index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex mt-2">
                      <Input
                        placeholder="https://example.com/feed.xml"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('sources.rss', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={(e) => {
                          const input = e.target.parentElement.querySelector('input');
                          addArrayItem('sources.rss', input.value);
                          input.value = '';
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="uploadsAllowed"
                      checked={formData.sources.uploadsAllowed}
                      onChange={(e) => handleInputChange('sources.uploadsAllowed', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="uploadsAllowed">Allow manual content uploads</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing Settings</CardTitle>
                    <CardDescription>
                      Configure how and when your magazine issues are created
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cadence">Publishing Cadence</Label>
                      <Select
                        value={formData.cadence}
                        onValueChange={(value) => handleInputChange('cadence', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="approvalMode">Approval Mode</Label>
                      <Select
                        value={formData.approvalMode}
                        onValueChange={(value) => handleInputChange('approvalMode', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_auto">Fully Automatic</SelectItem>
                          <SelectItem value="semi_auto">Semi-Automatic (Review Required)</SelectItem>
                          <SelectItem value="editor_led">Editor-Led</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.approvalMode === 'full_auto' && 'Issues are automatically published'}
                        {formData.approvalMode === 'semi_auto' && 'Issues are generated but require review before publishing'}
                        {formData.approvalMode === 'editor_led' && 'All content requires manual creation and approval'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      Preview how your blueprint configuration will work
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Page Count:</span>
                        <span className="font-medium">{formData.structure.pages} pages</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sections:</span>
                        <span className="font-medium">{formData.structure.sections.length} sections</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ad Slots:</span>
                        <span className="font-medium">{formData.structure.adSlots.length} slots</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Content Sources:</span>
                        <span className="font-medium">{formData.sources.rss.length} RSS feeds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Publishing:</span>
                        <span className="font-medium capitalize">{formData.cadence}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Generated Content
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BlueprintPage;
