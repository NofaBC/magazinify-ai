import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { dbService } from '../lib/database/firebase.js';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  BookOpen, 
  Plus, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Users, 
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const DashboardPage = () => {
  const { userProfile, tenant } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [magazines, setMagazines] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalPageTurns: 0,
    totalIssues: 0,
    activeReaders: 0
  });

  useEffect(() => {
    if (tenant) {
      loadDashboardData();
    }
  }, [tenant]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load magazines
      const magazinesData = await dbService.magazines.getByTenant(tenant.id);
      setMagazines(magazinesData);
      
      // Load recent issues from all magazines
      const allIssues = [];
      for (const magazine of magazinesData) {
        try {
          const issues = await dbService.issues.getByMagazine(tenant.id, magazine.id);
          allIssues.push(...issues.map(issue => ({ ...issue, magazineName: magazine.title })));
        } catch (error) {
          console.error(`Error loading issues for magazine ${magazine.id}:`, error);
        }
      }
      
      // Sort by creation date and take the most recent
      const sortedIssues = allIssues.sort((a, b) => 
        new Date(b.createdAt?.seconds * 1000 || b.createdAt) - new Date(a.createdAt?.seconds * 1000 || a.createdAt)
      );
      setRecentIssues(sortedIssues.slice(0, 5));
      
      // Load analytics summary (placeholder for now)
      setAnalytics({
        totalViews: Math.floor(Math.random() * 10000) + 1000,
        totalPageTurns: Math.floor(Math.random() * 5000) + 500,
        totalIssues: allIssues.length,
        activeReaders: Math.floor(Math.random() * 500) + 50
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMagazine = () => {
    navigate('/magazine/new');
  };

  const handleCreateIssue = (magazineId) => {
    navigate(`/magazine/${magazineId}/issue/new`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'ready':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPlanProgress = () => {
    const maxMagazines = tenant?.featureFlags?.maxMagazines || 1;
    const currentMagazines = magazines.length;
    
    if (maxMagazines === -1) return 100; // Unlimited
    
    return Math.min((currentMagazines / maxMagazines) * 100, 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userProfile?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your magazines today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreateMagazine} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Magazine
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Turns</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPageTurns.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Issues</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalIssues}</div>
              <p className="text-xs text-muted-foreground">
                {recentIssues.filter(i => i.status === 'published').length} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Readers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeReaders}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Magazines */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Magazines</CardTitle>
                    <CardDescription>
                      Manage your magazine publications
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateMagazine} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Magazine
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {magazines.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No magazines yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first magazine to get started with AI-powered publishing.
                    </p>
                    <Button onClick={handleCreateMagazine}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Your First Magazine
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {magazines.map((magazine) => (
                      <div
                        key={magazine.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{magazine.title}</h3>
                            <p className="text-sm text-gray-600">{magazine.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/magazine/${magazine.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCreateIssue(magazine.id)}
                          >
                            New Issue
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Usage</CardTitle>
                <CardDescription>
                  {tenant?.plan?.charAt(0).toUpperCase() + tenant?.plan?.slice(1)} Plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Magazines</span>
                    <span>
                      {magazines.length} / {tenant?.featureFlags?.maxMagazines === -1 ? '∞' : tenant?.featureFlags?.maxMagazines || 1}
                    </span>
                  </div>
                  <Progress value={getPlanProgress()} className="h-2" />
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Issues</CardTitle>
                <CardDescription>
                  Latest magazine issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentIssues.length === 0 ? (
                  <div className="text-center py-4">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No issues yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentIssues.map((issue) => (
                      <div key={`${issue.magazineName}-${issue.id}`} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {issue.magazineName}
                          </p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                          <div className="flex items-center">
                            {getStatusIcon(issue.status)}
                            <span className="ml-1">{issue.status}</span>
                          </div>
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performance Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
