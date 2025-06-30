
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Eye, Share } from 'lucide-react';

const SchedulePosts: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();

  const connectLinkedIn = () => {
    // Simulate LinkedIn connection
    setIsLinkedInConnected(true);
    toast({
      title: "LinkedIn Connected!",
      description: "Your LinkedIn account has been connected successfully.",
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
        title: "Error",
        description: "Please connect your LinkedIn account first.",
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

    toast({
      title: "Post Scheduled!",
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
        description: "Please connect your LinkedIn account first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Post Published!",
      description: "Your post has been published to LinkedIn.",
    });
    
    setPostContent('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule Posts</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Schedule and publish your LinkedIn posts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Composer */}
        <Card>
          <CardHeader>
            <CardTitle>Compose Your Post</CardTitle>
            <CardDescription>
              Write and schedule your LinkedIn post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* LinkedIn Connection Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLinkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  LinkedIn {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {!isLinkedInConnected && (
                <Button onClick={connectLinkedIn} size="sm" variant="outline">
                  Connect LinkedIn
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind? Share your thoughts with your professional network..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[150px]"
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
                />
              </div>
              <div>
                <Label htmlFor="time">Schedule Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
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
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Share className="mr-2 h-4 w-4" />
                Post Now
              </Button>
            </div>

            <Button
              onClick={schedulePost}
              disabled={!isLinkedInConnected}
              variant="outline"
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Post Preview</CardTitle>
            <CardDescription>
              See how your post will look on LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPreviewMode && postContent ? (
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    U
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Your Name</div>
                    <div className="text-xs text-gray-500">Your Position • 1st</div>
                    <div className="text-xs text-gray-500">Now</div>
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap mb-4">
                  {postContent}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                  <div className="flex space-x-4">
                    <span className="hover:text-primary cursor-pointer">👍 Like</span>
                    <span className="hover:text-primary cursor-pointer">💬 Comment</span>
                    <span className="hover:text-primary cursor-pointer">🔄 Repost</span>
                    <span className="hover:text-primary cursor-pointer">📤 Send</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                <div className="text-center">
                  <Eye className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Click "Preview" to see how your post will look</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
          <CardDescription>
            Manage your upcoming LinkedIn posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No scheduled posts yet</p>
            <p className="text-sm">Posts you schedule will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePosts;
