
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, ArrowLeft, Link, Unlink, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSettingsProps {
  user: any;
  onBack: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onBack }) => {
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState({ name: '', profileUrl: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const isConnected = localStorage.getItem('linkedin-connected') === 'true';
    setIsLinkedInConnected(isConnected);
    
    if (isConnected) {
      const savedProfile = localStorage.getItem('linkedin-profile');
      if (savedProfile) {
        setLinkedInProfile(JSON.parse(savedProfile));
      }
    }
  }, []);

  const connectLinkedIn = async () => {
    setIsConnecting(true);
    
    try {
      const redirectUri = `${window.location.origin}/linkedin-callback`;
      
      const { data, error } = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'getAuthUrl',
          redirectUri: redirectUri
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Store the state for verification
        localStorage.setItem('linkedin-auth-state', data.state);
        
        // Open LinkedIn OAuth in a popup
        const popup = window.open(
          data.authUrl,
          'linkedin-auth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the popup to close or receive a message
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            
            // Check if we received the authorization code
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            if (code && state === localStorage.getItem('linkedin-auth-state')) {
              handleAuthCallback(code, redirectUri);
            }
          }
        }, 1000);

        // Listen for postMessage from popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
            popup?.close();
            clearInterval(checkClosed);
            handleAuthCallback(event.data.code, redirectUri);
            window.removeEventListener('message', messageListener);
          }
        };
        
        window.addEventListener('message', messageListener);
      }
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to LinkedIn. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleAuthCallback = async (code: string, redirectUri: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'exchangeCode',
          code: code,
          redirectUri: redirectUri
        }
      });

      if (error) throw error;

      if (data?.success && data.accessToken) {
        // Store LinkedIn credentials
        localStorage.setItem('linkedin-access-token', data.accessToken);
        localStorage.setItem('linkedin-connected', 'true');
        localStorage.setItem('linkedin-user-id', data.profile.sub);
        
        const profileData = {
          name: data.profile.name,
          profileUrl: `https://linkedin.com/in/${data.profile.sub}`
        };
        
        localStorage.setItem('linkedin-profile', JSON.stringify(profileData));
        
        setIsLinkedInConnected(true);
        setLinkedInProfile(profileData);
        
        toast({
          title: "LinkedIn Connected! 🎉",
          description: `Successfully connected as ${data.profile.name}`,
        });
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      toast({
        title: "Authentication Failed",
        description: "Failed to complete LinkedIn authentication.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectLinkedIn = () => {
    localStorage.removeItem('linkedin-access-token');
    localStorage.removeItem('linkedin-connected');
    localStorage.removeItem('linkedin-profile');
    localStorage.removeItem('linkedin-user-id');
    
    setIsLinkedInConnected(false);
    setLinkedInProfile({ name: '', profileUrl: '' });
    
    toast({
      title: "LinkedIn Disconnected",
      description: "Your LinkedIn account has been disconnected.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed from here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Integration */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              LinkedIn Integration
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn account to publish posts directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isLinkedInConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <div>
                  <span className="font-medium">
                    {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  {isLinkedInConnected && linkedInProfile.name && (
                    <p className="text-sm text-gray-600">
                      Connected as {linkedInProfile.name}
                    </p>
                  )}
                </div>
              </div>
              {isLinkedInConnected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {isLinkedInConnected ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                  ✅ LinkedIn account is connected. You can now publish posts directly to LinkedIn!
                </p>
                <Button
                  onClick={disconnectLinkedIn}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Disconnect LinkedIn
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Connect your LinkedIn account to publish posts directly from the app.
                </p>
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
                      <Link className="mr-2 h-4 w-4" />
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
