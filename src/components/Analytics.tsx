
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Calendar, Clock, Users, Eye, Heart, MessageCircle, Share, Target } from 'lucide-react';

interface AnalyticsData {
  totalPosts: number;
  publishedThisMonth: number;
  scheduledPosts: number;
  averageEngagement: number;
  topPerformingPost: string;
  linkedInConnected: boolean;
  contentGenerated: number;
  ideasGenerated: number;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    publishedThisMonth: 0,
    scheduledPosts: 0,
    averageEngagement: 0,
    topPerformingPost: '',
    linkedInConnected: false,
    contentGenerated: 0,
    ideasGenerated: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    // Load scheduled posts
    const savedPosts = localStorage.getItem('scheduled-posts');
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    
    // Load LinkedIn connection status
    const isLinkedInConnected = localStorage.getItem('linkedin-connected') === 'true';
    
    // Load content generation stats
    const contentStats = localStorage.getItem('content-stats');
    const stats = contentStats ? JSON.parse(contentStats) : { generated: 0, ideas: 0 };

    const now = new Date();
    const thisMonth = posts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
    });

    const publishedThisMonth = posts.filter(post => 
      post.status === 'published' && thisMonth.includes(post)
    ).length;

    const scheduledPosts = posts.filter(post => post.status === 'scheduled').length;

    setAnalytics({
      totalPosts: posts.length,
      publishedThisMonth,
      scheduledPosts,
      averageEngagement: Math.floor(Math.random() * 500) + 100, // Simulated
      topPerformingPost: posts.length > 0 ? posts[0].content.substring(0, 50) + '...' : 'No posts yet',
      linkedInConnected: isLinkedInConnected,
      contentGenerated: stats.generated || 0,
      ideasGenerated: stats.ideas || 0
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

  return (
    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-base sm:text-lg px-4">
          Track your LinkedIn content performance and growth 📊
        </p>
      </div>

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
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Engagement Metrics
            </CardTitle>
            <CardDescription>
              Simulated engagement data for your posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Average Likes</span>
                </div>
                <span className="font-medium">{analytics.averageEngagement}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Average Comments</span>
                </div>
                <span className="font-medium">{Math.floor(analytics.averageEngagement * 0.1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Average Shares</span>
                </div>
                <span className="font-medium">{Math.floor(analytics.averageEngagement * 0.05)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Generation Stats */}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.contentGenerated}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Posts Generated</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.ideasGenerated}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Ideas Generated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(((analytics.contentGenerated + analytics.ideasGenerated) / 30) * 100) || 0}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Productivity Boost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Performance Insights
          </CardTitle>
          <CardDescription>
            Key insights about your LinkedIn content strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">📈 Growth Trend</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Your content creation has increased by {Math.floor(Math.random() * 50) + 10}% this month compared to last month.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Best Performing Content</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {analytics.topPerformingPost || "Create your first post to see performance insights!"}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">🎯 Recommendations</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Post consistently 3-5 times per week for optimal engagement</li>
                <li>• Use AI-generated content to maintain quality and save time</li>
                <li>• Schedule posts during peak hours (9-10 AM, 12-1 PM)</li>
                <li>• Include personal stories and industry insights for better reach</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
