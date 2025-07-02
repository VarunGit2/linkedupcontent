
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Eye, Share, CheckCircle, AlertCircle, ExternalLink, Users, BarChart3, TrendingUp, Settings, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SchedulePosts: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [linkedInProfile, setLinkedInProfile] = useState({ name: '', profileUrl: '', email: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkLinkedInConnection();
    loadScheduledPosts();
  }, []);

  const checkLinkedInConnection = () => {
    const isConnected = localStorage.getItem('linkedin-connected') === 'true';
    setIsLinkedInConnected(isConnected);
    
    if (isConnected) {
      const savedProfile = localStorage.getItem('linkedin-profile');
      if (savedProfile) {
        setLinkedInProfile(JSON.parse(savedProfile));
      }
    }
  };

  const loadScheduledPosts = () => {
    const savedPosts = localStorage.getItem('scheduled-posts');
    if (savedPosts) {
      setScheduledPosts(JSON.parse(savedPosts));
    }
  };

  const saveScheduledPosts = (posts: any[]) => {
    localStorage.setItem('scheduled-posts', JSON.stringify(posts));
    setScheduledPosts(posts);
  };

  const connectLinkedIn = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'getAuthUrl',
          redirectUri: window.location.origin + '/'
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Store the state for verification
        localStorage.setItem('linkedin-oauth-state', data.state);
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get LinkedIn authorization URL');
      }
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to LinkedIn. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectLinkedIn = () => {
    localStorage.removeItem('linkedin-connected');
    localStorage.removeItem('linkedin-profile');
    localStorage.removeItem('linkedin-access-token');
    localStorage.removeItem('linkedin-user-id');
    setIsLinkedInConnected(false);
    setLinkedInProfile({ name: '', profileUrl: '', email: '' });
    
    toast({
      title: "LinkedIn Disconnected",
      description: "Your LinkedIn account has been disconnected successfully.",
    });
  };

  const schedulePost = () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter post content.",
        variant: "destructive",
      });
      return;
    }

    if (!isLinkedInConnected) {
      toast({
        title: "LinkedIn Not Connected",
        description: "Please connect your LinkedIn account first to schedule posts.",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Error",
        description: "Please select date and time for scheduling.",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      toast({
        title: "Invalid Schedule Time",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    const newPost = {
      id: Date.now(),
      content: postContent,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      platform: 'linkedin',
      userId: 'current-user',
      scheduledDateTime: scheduledDateTime.toISOString()
    };

    const updatedPosts = [...scheduledPosts, newPost];
    saveScheduledPosts(updatedPosts);

    toast({
      title: "Post Scheduled Successfully! 📅",
      description: `Your post will be published on ${scheduledDate} at ${scheduledTime} to LinkedIn.`,
    });

    // Reset form
    setPostContent('');
    setScheduledDate('');
    setScheduledTime('');
  };

  const postNow = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter post content.",
        variant: "destructive",
      });
      return;
    }

    if (!isLinkedInConnected) {
      toast({
        title: "LinkedIn Not Connected",
        description: "Please connect your LinkedIn account first to publish posts.",
        variant: "destructive",
      });
      return;
    }

    const accessToken = localStorage.getItem('linkedin-access-token');
    const linkedInUserId = localStorage.getItem('linkedin-user-id');

    if (!accessToken || !linkedInUserId) {
      toast({
        title: "Authentication Required",
        description: "Please reconnect your LinkedIn account.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      const { data, error } = await supabase.functions.invoke('linkedin-post', {
        body: {
          content: postContent,
          accessToken: accessToken,
          userId: linkedInUserId
        }
      });

      if (error) throw error;

      if (data?.success) {
        const newPost = {
          id: Date.now(),
          content: postContent,
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
          status: 'published',
          createdAt: new Date().toISOString(),
          platform: 'linkedin',
          linkedInPostId: data.postId,
          userId: 'current-user'
        };

        const updatedPosts = [...scheduledPosts, newPost];
        saveScheduledPosts(updatedPosts);

        toast({
          title: "Post Published Successfully! 🚀",
          description: "Your content has been posted to LinkedIn and is now live!",
        });

        setPostContent('');
      } else {
        throw new Error(data?.error || 'Failed to publish post');
      }
    } catch (error) {
      console.error('Error publishing to LinkedIn:', error);
      
      toast({
        title: "Publishing Error",
        description: "Unable to publish to LinkedIn. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteScheduledPost = (postId: number) => {
    const updatedPosts = scheduledPosts.filter(post => post.id !== postId);
    saveScheduledPosts(updatedPosts);
    toast({
      title: "Post Deleted",
      description: "Scheduled post has been removed.",
    });
  };

  const getUserInitials = () => {
    if (linkedInProfile.name) {
      const nameParts = linkedInProfile.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return linkedInProfile.name[0].toUpperCase();
    }
    return 'U';
  };

  // Get upcoming posts (next 7 days)
  const upcomingPosts = scheduledPosts.filter(post => {
    if (post.status !== 'scheduled') return false;
    const postDate = new Date(post.scheduledDateTime || `${post.scheduledDate}T${post.scheduledTime}`);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return postDate <= weekFromNow;
  }).sort((a, b) => new Date(a.scheduledDateTime || `${a.scheduledDate}T${a.scheduledTime}`).getTime() - new Date(b.scheduledDateTime || `${b.scheduledDate}T${b.scheduledTime}`).getTime());

  const publishedThisMonth = scheduledPosts.filter(post => {
    if (post.status !== 'published') return false;
    const postDate = new Date(post.createdAt);
    const now = new Date();
    return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Schedule Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-base sm:text-lg px-4">
          Create, schedule, and publish your LinkedIn content seamlessly ✨
        </p>
      </div>

      {/* LinkedIn Connection Status & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isLinkedInConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <div className="text-sm font-semibold">
                    LinkedIn {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                  </div>
                  {isLinkedInConnected && linkedInProfile.name && (
                    <div className="text-xs text-gray-500">{linkedInProfile.name}</div>
                  )}
                </div>
              </div>
              {isLinkedInConnected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Button onClick={disconnectLinkedIn} variant="outline" size="sm" className="text-xs">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={connectLinkedIn} 
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 mr-1" />
                      Connect LinkedIn
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{publishedThisMonth}</div>
                <div className="text-sm text-gray-500">Posts This Month</div>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{upcomingPosts.length}</div>
                <div className="text-sm text-gray-500">Upcoming Posts</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Post Composer */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Compose Your Post
            </CardTitle>
            <CardDescription className="text-sm">
              Write and schedule your professional LinkedIn content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 sm:pt-6 p-4 sm:p-6">
            <div>
              <Label htmlFor="content" className="text-sm font-semibold">Post Content</Label>
              <Textarea
                id="content"
                placeholder="Share your professional insights, industry thoughts, or valuable tips with your LinkedIn network..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[120px] sm:min-h-[150px] border-2 focus:border-blue-500 transition-colors text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  {postContent.length}/3000 characters
                </div>
                {postContent.length > 2800 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                    Character limit approaching
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-semibold">Schedule Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-2 focus:border-blue-500 transition-colors text-sm"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-sm font-semibold">Schedule Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="border-2 focus:border-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                variant="outline"
                className="flex-1 border-2 hover:bg-gray-50 text-sm"
              >
                <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                onClick={postNow}
                disabled={!isLinkedInConnected || !postContent.trim() || isPublishing}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-sm"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Share className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Post Now
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={schedulePost}
              disabled={!isLinkedInConnected || !postContent.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold py-2 sm:py-3 h-auto text-sm sm:text-base"
            >
              <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Schedule Post
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              LinkedIn Preview
            </CardTitle>
            <CardDescription className="text-sm">
              See how your post will appear on LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            {isPreviewMode && postContent ? (
              <div className="border-2 rounded-xl p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                    {getUserInitials()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">{linkedInProfile.name || 'Your Name'}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Your Position • 1st</div>
                    <div className="text-xs text-gray-400">Now • 🌍</div>
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                  {postContent}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                  <div className="flex space-x-4 sm:space-x-6">
                    <button className="hover:text-blue-600 cursor-pointer flex items-center gap-1 transition-colors">
                      👍 Like
                    </button>
                    <button className="hover:text-blue-600 cursor-pointer flex items-center gap-1 transition-colors">
                      💬 Comment
                    </button>
                    <button className="hover:text-blue-600 cursor-pointer flex items-center gap-1 transition-colors">
                      🔄 Repost
                    </button>
                    <button className="hover:text-blue-600 cursor-pointer flex items-center gap-1 transition-colors">
                      📤 Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[250px] sm:min-h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-center px-4">
                  <Eye className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
                  <p className="text-base sm:text-lg font-medium">Click "Preview" to see your post</p>
                  <p className="text-sm text-gray-400 mt-1">Write some content first</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Posts Quick View */}
      {upcomingPosts.length > 0 && (
        <Card className="border-l-4 border-l-orange-500 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              Upcoming Posts (Next 7 Days)
            </CardTitle>
            <CardDescription className="text-sm">
              Posts scheduled for the coming week
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                      📅 {post.scheduledDate}
                    </Badge>
                    <span className="text-xs text-orange-600 font-medium">{post.scheduledTime}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <Button
                    onClick={() => deleteScheduledPost(post.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Posts Management */}
      <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            Your Posts
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your scheduled and published LinkedIn posts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          {scheduledPosts.length > 0 ? (
            <div className="space-y-4">
              {scheduledPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="border-2 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                    <Badge 
                      variant={post.status === 'published' ? 'default' : 'secondary'}
                      className={`${post.status === 'published' 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                      } font-medium text-xs w-fit`}
                    >
                      {post.status === 'published' ? '✅ Published' : '⏰ Scheduled'}
                    </Badge>
                    <div className="text-sm text-gray-500 font-medium">
                      📅 {post.scheduledDate} at {post.scheduledTime}
                    </div>
                  </div>
                  <p className="text-sm mb-4 line-clamp-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.status === 'scheduled' && (
                      <Button
                        onClick={() => deleteScheduledPost(post.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 text-xs"
                      >
                        Delete
                      </Button>
                    )}
                    {post.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(linkedInProfile.profileUrl || 'https://linkedin.com/feed', '_blank')}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on LinkedIn
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
              <Clock className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
              <p className="text-base sm:text-lg font-medium">No posts yet</p>
              <p className="text-sm">Posts you create and schedule will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePosts;
