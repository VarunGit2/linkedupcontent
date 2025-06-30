
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Eye, Share, CheckCircle, AlertCircle } from 'lucide-react';

const SchedulePosts: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const isConnected = localStorage.getItem('linkedin-connected') === 'true';
    setIsLinkedInConnected(isConnected);
    
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
        title: "Error",
        description: "Please connect your LinkedIn account first in Profile Settings.",
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
      createdAt: new Date().toISOString()
    };

    const updatedPosts = [...scheduledPosts, newPost];
    saveScheduledPosts(updatedPosts);

    toast({
      title: "Post Scheduled! 📅",
      description: `Your post has been scheduled for ${scheduledDate} at ${scheduledTime}.`,
    });

    // Reset form
    setPostContent('');
    setScheduledDate('');
    setScheduledTime('');
  };

  const postNow = () => {
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
        title: "Error",
        description: "Please connect your LinkedIn account first in Profile Settings.",
        variant: "destructive",
      });
      return;
    }

    const newPost = {
      id: Date.now(),
      content: postContent,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      status: 'published',
      createdAt: new Date().toISOString()
    };

    const updatedPosts = [...scheduledPosts, newPost];
    saveScheduledPosts(updatedPosts);

    toast({
      title: "Post Published! 🚀",
      description: "Your post has been published to LinkedIn successfully.",
    });
    
    setPostContent('');
  };

  const deleteScheduledPost = (postId: number) => {
    const updatedPosts = scheduledPosts.filter(post => post.id !== postId);
    saveScheduledPosts(updatedPosts);
    toast({
      title: "Post Deleted",
      description: "Scheduled post has been removed.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Schedule Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Schedule and publish your LinkedIn posts ✨
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Composer */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle>Compose Your Post</CardTitle>
            <CardDescription>
              Write and schedule your LinkedIn post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* LinkedIn Connection Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLinkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  LinkedIn {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {isLinkedInConnected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div>
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind? Share your thoughts with your professional network..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[150px] border-2 focus:border-blue-500"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {postContent.length}/3000 characters
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Schedule Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-2 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="time">Schedule Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="border-2 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                onClick={postNow}
                disabled={!isLinkedInConnected}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Share className="mr-2 h-4 w-4" />
                Post Now
              </Button>
            </div>

            <Button
              onClick={schedulePost}
              disabled={!isLinkedInConnected}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle>Post Preview</CardTitle>
            <CardDescription>
              See how your post will look on LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isPreviewMode && postContent ? (
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    U
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Your Name</div>
                    <div className="text-xs text-gray-500">Your Position • 1st</div>
                    <div className="text-xs text-gray-500">Now</div>
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap mb-4 leading-relaxed">
                  {postContent}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                  <div className="flex space-x-4">
                    <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                      👍 Like
                    </span>
                    <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                      💬 Comment
                    </span>
                    <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                      🔄 Repost
                    </span>
                    <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                      📤 Send
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                  <Eye className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="font-medium">Click "Preview" to see how your post will look</p>
                  <p className="text-sm text-gray-400 mt-1">Write some content first</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts */}
      <Card className="border-l-4 border-l-green-500 shadow-lg">
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
                <div key={post.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant={post.status === 'published' ? 'default' : 'secondary'}
                      className={post.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {post.status === 'published' ? '✅ Published' : '⏰ Scheduled'}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {post.scheduledDate} at {post.scheduledTime}
                    </div>
                  </div>
                  <p className="text-sm mb-3 line-clamp-3">{post.content}</p>
                  {post.status === 'scheduled' && (
                    <Button
                      onClick={() => deleteScheduledPost(post.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="font-medium">No posts yet</p>
              <p className="text-sm">Posts you create and schedule will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePosts;
