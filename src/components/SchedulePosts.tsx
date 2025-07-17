
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SchedulePosts: React.FC = () => {
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
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

      {/* LinkedIn Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-600" />
              LinkedIn
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn account to start publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${linkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">Status</span>
                </div>
                <Badge variant={linkedInConnected ? "default" : "secondary"}>
                  {linkedInConnected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              
              {!linkedInConnected && (
                <Button
                  onClick={connectLinkedIn}
                  disabled={isConnecting}
                  className="w-full bg-[#0077B5] hover:bg-[#005885] text-white"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Connect LinkedIn
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              Posts This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">Published Posts</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Upcoming Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Required Notice */}
      {!linkedInConnected && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">LinkedIn Connection Required</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  To schedule and publish posts directly to LinkedIn, you need to connect your LinkedIn account first. 
                  This allows you to manage your content calendar and automate your posting schedule.
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

      {/* Post Composer - Show when connected */}
      {linkedInConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Compose Your Post
              </CardTitle>
              <CardDescription>
                Write and schedule your professional LinkedIn content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Post Content</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-lg resize-none text-sm"
                  placeholder="Share your professional insights, industry thoughts, or valuable tips with your LinkedIn network..."
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">0/3000 characters</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1">Schedule Post</Button>
                <Button variant="outline">Save Draft</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                LinkedIn Preview
              </CardTitle>
              <CardDescription>
                See how your post will appear on LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Click "Preview" to see your post</p>
                  <p className="text-xs mt-1">Write some content first</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SchedulePosts;
