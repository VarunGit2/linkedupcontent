import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';

const SchedulePosts: React.FC = () => {
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkLinkedInConnection();
  }, []);

  const checkLinkedInConnection = () => {
    const connected = localStorage.getItem('linkedin-connected') === 'true';
    setLinkedInConnected(connected);
  };

  const connectLinkedIn = async () => {
    setIsConnecting(true);
    
    try {
      const currentDomain = window.location.origin;
      
      const { data, error } = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'getAuthUrl',
          redirectUri: currentDomain
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.authUrl && data?.state) {
        localStorage.setItem('linkedin-oauth-state', data.state);
        localStorage.setItem('linkedin-redirect-uri', data.redirectUri);
        
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

  const handlePublish = async () => {
    const accessToken = localStorage.getItem('linkedin-access-token');
    const userId = localStorage.getItem('linkedin-user-id');

    if (!postContent.trim() || !accessToken || !userId) {
      toast({
        title: "Error",
        description: "Post content is empty or LinkedIn is not properly connected.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      const { data, error } = await supabase.functions.invoke('linkedin-post', {
        body: { content: postContent, accessToken, userId },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: "Your post has been published to LinkedIn.",
        });
        setPostContent(""); 
      } else {
        throw new Error(data.error || "Failed to publish post.");
      }
    } catch (error: any) {
      toast({
        title: "Publishing Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

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

      {!linkedInConnected && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">LinkedIn Connection Required</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  To publish posts directly to LinkedIn, you need to connect your LinkedIn account first.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={connectLinkedIn}
                    disabled={isConnecting}
                    size="sm"
                    className="bg-[#0077B5] hover:bg-[#005885] text-white"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Now'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {linkedInConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Compose Your Post
              </CardTitle>
              <CardDescription>
                Write and publish your professional LinkedIn content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  className="w-full h-48 p-3 border rounded-lg resize-none text-sm"
                  placeholder="Share your professional insights..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>
              
              <Button onClick={handlePublish} disabled={isPublishing || !postContent.trim()} className="w-full">
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish to LinkedIn'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                LinkedIn Preview
              </CardTitle>
              <CardDescription>
                This is a mock preview of your post.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[200px]">
                <p className="whitespace-pre-wrap text-sm">{postContent || "Your post preview will appear here."}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SchedulePosts;
