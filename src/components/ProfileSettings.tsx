
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, Linkedin, Unlink, AlertTriangle, Bot, Sparkles, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileSettingsProps {
  user: SupabaseUser | null;
  onBack: () => void;
}

interface LinkedInProfile {
  name: string;
  sub: string;
  picture?: string;
}

const ProfileSettings = ({ user, onBack }: ProfileSettingsProps) => {
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setProfileName(user?.user_metadata?.name || '');
      setProfileEmail(user.email || '');
    }

    const checkLinkedInConnection = () => {
      const connected = localStorage.getItem('linkedin-connected') === 'true';
      const profileData = localStorage.getItem('linkedin-profile');
      setIsLinkedInConnected(connected);
      if (profileData) {
        try {
          setLinkedInProfile(JSON.parse(profileData));
        } catch (error) {
          console.error('Error parsing LinkedIn profile data:', error);
          setLinkedInProfile(null);
        }
      }
      setIsLoading(false);
    };

    checkLinkedInConnection();
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      const { error: userError } = await supabase.auth.updateUser({
        data: { name: profileName },
      });

      if (userError) {
        throw userError;
      }

      toast({
        title: "Profile Updated! 🎉",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLinkedInConnect = async () => {
    setIsConnecting(true);
    localStorage.removeItem('linkedin-oauth-state');
    
    try {
      // Use the current URL without any query parameters as redirect URI
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const redirectUri = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      console.log('Using redirect URI:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'getAuthUrl',
          redirectUri: redirectUri
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.needsConfig) {
        toast({
          title: "LinkedIn Setup Required",
          description: "Please configure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in Supabase secrets first.",
          variant: "destructive",
        });
        return;
      }

      if (data?.authUrl && data?.state) {
        localStorage.setItem('linkedin-oauth-state', data.state);
        localStorage.setItem('linkedin-redirect-uri', redirectUri);
        console.log('Redirecting to:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to retrieve LinkedIn authentication URL.');
      }
    } catch (error: any) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to LinkedIn. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLinkedInDisconnect = () => {
    localStorage.removeItem('linkedin-connected');
    localStorage.removeItem('linkedin-profile');
    localStorage.removeItem('linkedin-access-token');
    localStorage.removeItem('linkedin-user-id');
    localStorage.removeItem('linkedin-oauth-state');
    localStorage.removeItem('linkedin-redirect-uri');
    setIsLinkedInConnected(false);
    setLinkedInProfile(null);
    toast({
      title: "LinkedIn Disconnected",
      description: "Your LinkedIn account has been disconnected.",
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-base sm:text-lg px-4">
          Manage your profile information and connected accounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Profile Settings */}
        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your basic profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profileName">Full Name</Label>
              <Input
                type="text"
                id="profileName"
                placeholder="Your Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profileEmail">Email Address</Label>
              <Input
                type="email"
                id="profileEmail"
                placeholder="Your Email Address"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                disabled={true}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={onBack}>
                Back to Dashboard
              </Button>
              <Button onClick={handleProfileUpdate}>Update Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Integration */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-blue-600" />
              LinkedIn Integration
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn account to schedule and publish posts directly
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLinkedInConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      LinkedIn Connected Successfully!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {linkedInProfile?.name && `Connected as: ${linkedInProfile.name}`}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleLinkedInDisconnect}
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Disconnect LinkedIn
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                        LinkedIn Setup Required
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                        To connect LinkedIn, configure these in Supabase Edge Function Secrets:
                      </p>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 ml-4">
                        <li>• LINKEDIN_CLIENT_ID</li>
                        <li>• LINKEDIN_CLIENT_SECRET</li>
                      </ul>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        Make sure your LinkedIn app redirect URI is set to: {window.location.origin}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleLinkedInConnect}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Linkedin className="mr-2 h-4 w-4" />
                      Connect LinkedIn Account
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              AI Content Generation
            </CardTitle>
            <CardDescription>
              Configure AI providers for premium content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Premium AI Integration
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Add these API keys in Supabase Edge Function Secrets for high-quality content:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">GROQ_API_KEY</span>
                      <span className="text-gray-500">- Fast & Creative (Recommended)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">OPENAI_API_KEY</span>
                      <span className="text-gray-500">- GPT-4 Premium Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium">ANTHROPIC_API_KEY</span>
                      <span className="text-gray-500">- Claude Advanced Reasoning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">💡 <strong>Pro Tip:</strong> Groq API provides the best balance of speed and quality for LinkedIn content.</p>
              <p>Without API keys, the system uses basic fallback templates.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="secondary" onClick={onBack}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
