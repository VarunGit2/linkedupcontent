import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, Linkedin, Unlink, AlertTriangle, User, ArrowLeft } from 'lucide-react';
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
    
    try {
      // Clear any existing LinkedIn data
      localStorage.removeItem('linkedin-connected');
      localStorage.removeItem('linkedin-profile');
      localStorage.removeItem('linkedin-access-token');
      localStorage.removeItem('linkedin-user-id');
      localStorage.removeItem('linkedin-oauth-state');
      localStorage.removeItem('linkedin-redirect-uri');
      
      const redirectUri = window.location.origin;
      console.log('Initiating LinkedIn OAuth with redirect URI:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'getAuthUrl',
          redirectUri: redirectUri
        }
      });

      if (error) {
        console.error('LinkedIn auth error:', error);
        throw new Error(error.message || 'Failed to get LinkedIn auth URL');
      }

      if (data?.needsConfig) {
        toast({
          title: "LinkedIn Configuration Required",
          description: "LinkedIn integration is not configured. Please contact support to set up LinkedIn credentials.",
          variant: "destructive",
        });
        return;
      }

      if (data?.authUrl && data?.state) {
        console.log('Storing OAuth state and redirecting to LinkedIn...');
        localStorage.setItem('linkedin-oauth-state', data.state);
        localStorage.setItem('linkedin-redirect-uri', redirectUri);
        
        // Force redirect to LinkedIn
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to retrieve LinkedIn authentication URL');
      }
    } catch (error: any) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "LinkedIn Connection Failed",
        description: error.message || "Failed to connect to LinkedIn. Please try again.",
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
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-base sm:text-lg">
            Manage your profile and connected accounts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Profile Settings Card */}
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
                disabled={true}
              />
            </div>
            <Button onClick={handleProfileUpdate} className="w-full">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* LinkedIn Integration Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-blue-600" />
              LinkedIn Integration
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn account to publish posts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLinkedInConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">LinkedIn Connected!</p>
                    {linkedInProfile?.name && (
                      <p className="text-sm text-green-700">Connected as: {linkedInProfile.name}</p>
                    )}
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
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 mb-2">LinkedIn Integration</p>
                      <p className="text-sm text-amber-700">
                        Connect your LinkedIn account to start publishing professional content directly to your network.
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
                      Connect LinkedIn
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
