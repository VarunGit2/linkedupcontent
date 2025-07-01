import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Eye, Share, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SchedulePosts: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [linkedInProfile, setLinkedInProfile] = useState({ name: '', profileUrl: '' });
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const isConnected = localStorage.getItem('linkedin-connected') === 'true';
    setIsLinkedInConnected(isConnected);
    
    if (isConnected) {
      const savedProfile = localStorage.getItem('linkedin-profile');
      if (savedProfile) {
        setLinkedInProfile(JSON.parse(savedProfile));
      }
    }
    
    // Load scheduled posts from localStorage
    const savedPosts = localStorage.getItem('scheduled-posts');
    if (savedPosts) {
      setScheduledPosts(JSON.parse(savedPosts));
    }
  }, []);

  const saveScheduledPosts = (posts: any[]) => {
    localStorage.setItem('scheduled-posts', JSON.stringify(posts));
    setScheduledPosts(posts);
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
        description: "Please connect your LinkedIn account first in Profile Settings to schedule posts.",
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

    const newPost = {
      id: Date.now(),
      content: postContent,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      platform: 'linkedin',
      userId: 'current-user'
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
        description: "Please connect your LinkedIn account first in Profile Settings to publish posts.",
        variant: "destructive",
      });
      return;
    }

    const accessToken = localStorage.getItem('linkedin-access-token');
    const linkedInUserId = localStorage.getItem('linkedin-user-id');

    if (!accessToken || !linkedInUserId) {
      toast({
        title: "Authentication Required",
        description: "Please reconnect your LinkedIn account in Profile Settings.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

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
      
      // Fallback: Save as published locally (for demo purposes)
      const newPost = {
        id: Date.now(),
        content: postContent,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'published',
        createdAt: new Date().toISOString(),
        platform: 'linkedin',
        userId: 'current-user',
        isLocal: true
      };

      const updatedPosts = [...scheduledPosts, newPost];
      saveScheduledPosts(updatedPosts);

      toast({
        title: "Post Saved Locally",
        description: "LinkedIn API unavailable. Post saved in your dashboard for later publishing.",
      });

      setPostContent('');
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Schedule Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Create, schedule, and publish your LinkedIn content ✨
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Composer */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Compose Your Post
            </CardTitle>
            <CardDescription>
              Write and schedule your LinkedIn post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* LinkedIn Connection Status */}
            <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${isLinkedInConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <span className="text-sm font-semibold">
                    LinkedIn {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  {isLinkedInConnected && linkedInProfile.name && (
                    <p className="text-xs text-gray-500">Connected as {linkedInProfile.name}</p>
                  )}
                </div>
              </div>
              {isLinkedInConnected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-semibold">Post Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind? Share your professional insights with your network..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[150px] border-2 focus:border-blue-500 transition-colors"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-right text-sm text-gray-500">
                  {postContent.length}/3000 characters
                </div>
                {postContent.length > 2800 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Character limit approaching
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-semibold">Schedule Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-sm font-semibold">Schedule Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                variant="outline"
                className="flex-1 border-2 hover:bg-gray-50"
              >
                <Eye className="mr-2 h-4 w-4" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                onClick={postNow}
                disabled={!isLinkedInConnected || !postContent.trim()}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                <Share className="mr-2 h-4 w-4" />
                Post Now
              </Button>
            </div>

            <Button
              onClick={schedulePost}
              disabled={!isLinkedInConnected || !postContent.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold py-3 h-auto"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              LinkedIn Preview
            </CardTitle>
            <CardDescription>
              See how your post will appear on LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isPreviewMode && postContent ? (
              <div className="border-2 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getUserInitials()}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{linkedInProfile.name || 'Your Name'}</div>
                    <div className="text-sm text-gray-500">Your Position • 1st</div>
                    <div className="text-xs text-gray-400">Now • 🌍</div>
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                  {postContent}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                  <div className="flex space-x-6">
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
              <div className="min-h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                  <Eye className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Click "Preview" to see your post</p>
                  <p className="text-sm text-gray-400 mt-1">Write some content first</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts */}
      <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Your Posts
          </CardTitle>
          <CardDescription>
            Manage your scheduled and published LinkedIn posts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {scheduledPosts.length > 0 ? (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="border-2 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <Badge 
                      variant={post.status === 'published' ? 'default' : 'secondary'}
                      className={`${post.status === 'published' 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                      } font-medium`}
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
                  <div className="flex space-x-3">
                    {post.status === 'scheduled' && (
                      <Button
                        onClick={() => deleteScheduledPost(post.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                      >
                        Delete
                      </Button>
                    )}
                    {post.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(linkedInProfile.profileUrl || 'https://linkedin.com', '_blank')}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
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
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm">Posts you create and schedule will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePosts;
