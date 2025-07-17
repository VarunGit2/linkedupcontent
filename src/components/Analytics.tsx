
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Calendar, Users, Eye, Heart, MessageCircle, Share, Target, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  totalPosts: number;
  publishedThisMonth: number;
  scheduledPosts: number;
  contentGenerated: number;
  ideasGenerated: number;
  linkedInConnected: boolean;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    publishedThisMonth: 0,
    scheduledPosts: 0,
    contentGenerated: 0,
    ideasGenerated: 0,
    linkedInConnected: false
  });

  useEffect(() => {
    loadRealAnalytics();
  }, []);

  const loadRealAnalytics = () => {
    // Load actual data from localStorage
    const savedPosts = localStorage.getItem('scheduled-posts');
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    
    const contentStats = localStorage.getItem('content-stats') || '{"generated":0,"ideas":0}';
    const stats = JSON.parse(contentStats);
    
    const isLinkedInConnected = localStorage.getItem('linkedin-connected') === 'true';

    // Calculate real metrics
    const now = new Date();
    const thisMonth = posts.filter((post: any) => {
      const postDate = new Date(post.createdAt || post.scheduledDate);
      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
    });

    const publishedPosts = posts.filter((post: any) => post.status === 'published');
    const scheduledPosts = posts.filter((post: any) => post.status === 'scheduled');

    setAnalytics({
      totalPosts: posts.length,
      publishedThisMonth: publishedPosts.filter((post: any) => thisMonth.includes(post)).length,
      scheduledPosts: scheduledPosts.length,
      contentGenerated: stats.generated || 0,
      ideasGenerated: stats.ideas || 0,
      linkedInConnected: isLinkedInConnected
    });
  };

  const analyticsCards = [
    {
      title: "Total Posts",
      value: analytics.totalPosts,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-l-blue-500"
    },
    {
      title: "Published This Month",
      value: analytics.publishedThisMonth,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-l-green-500"
    },
    {
      title: "Scheduled Posts",
      value: analytics.scheduledPosts,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-l-orange-500"
    },
    {
      title: "Content Generated",
      value: analytics.contentGenerated,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-l-purple-500"
    }
  ];

  const hasAnyData = analytics.totalPosts > 0 || analytics.contentGenerated > 0 || analytics.ideasGenerated > 0;

  return (
    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-base sm:text-lg px-4">
          Track your real LinkedIn content performance and growth 📊
        </p>
      </div>

      {!hasAnyData && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">No Data Available Yet</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Start creating content and scheduling posts to see your analytics data here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {analyticsCards.map((card, index) => (
          <Card key={index} className={`border-l-4 ${card.borderColor} hover:shadow-lg transition-shadow`}>
            <CardContent className={`p-4 sm:p-6 ${card.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {card.title}
                  </div>
                </div>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Platform Connections
            </CardTitle>
            <CardDescription>
              Your social media platform connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${analytics.linkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">LinkedIn</span>
              </div>
              <Badge variant={analytics.linkedInConnected ? "default" : "secondary"}>
                {analytics.linkedInConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            {!analytics.linkedInConnected && (
              <p className="text-sm text-muted-foreground mt-3">
                Connect your LinkedIn account to start publishing posts and track real engagement metrics.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              AI Content Generation
            </CardTitle>
            <CardDescription>
              Your AI-powered content creation activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.contentGenerated}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Posts Generated</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.ideasGenerated}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Ideas Generated</div>
              </div>
            </div>
            {analytics.contentGenerated === 0 && analytics.ideasGenerated === 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                Use the AI content generator to create posts and generate ideas to see your productivity metrics.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights - Only show if there's data */}
      {hasAnyData && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              Key insights about your LinkedIn content strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">📈 Content Activity</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  You've created {analytics.totalPosts} posts and generated {analytics.contentGenerated} pieces of content using AI.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">🎯 Recommendations</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Post consistently 3-5 times per week for optimal engagement</li>
                  <li>• Use AI-generated content to maintain quality and save time</li>
                  <li>• Schedule posts during peak hours (9-10 AM, 12-1 PM)</li>
                  <li>• Connect LinkedIn to track real engagement metrics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
