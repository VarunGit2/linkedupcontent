
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, ArrowLeft, Link, Unlink, CheckCircle, AlertCircle, Shield, Bell, Globe, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSettingsProps {
  user: any;
  onBack: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onBack }) => {
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    company: user?.user_metadata?.company || '',
    position: user?.user_metadata?.position || '',
    industry: user?.user_metadata?.industry || '',
    bio: user?.user_metadata?.bio || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || ''
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    emailNotifications: true,
    marketingEmails: false,
    dataSharing: false
  });

  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState({ name: '', profileUrl: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load LinkedIn connection status
    const isConnected = localStorage.getItem('linkedin-connected') === 'true';
    setIsLinkedInConnected(isConnected);
    
    if (isConnected) {
      const savedProfile = localStorage.getItem('linkedin-profile');
      if (savedProfile) {
        setLinkedInProfile(JSON.parse(savedProfile));
      }
    }

    // Load privacy settings
    const savedPrivacySettings = localStorage.getItem('privacy-settings');
    if (savedPrivacySettings) {
      setPrivacySettings(JSON.parse(savedPrivacySettings));
    }
  }, []);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would update the user's profile in the database
      localStorage.setItem('user-profile', JSON.stringify(profileData));
      
      toast({
        title: "Profile Updated! ✅",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const savePrivacySettings = () => {
    localStorage.setItem('privacy-settings', JSON.stringify(privacySettings));
    toast({
      title: "Privacy Settings Updated! 🔒",
      description: "Your privacy preferences have been saved.",
    });
  };

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
        localStorage.setItem('linkedin-auth-state', data.state);
        
        // Enhanced popup handling for better UX
        const popup = window.open(
          data.authUrl,
          'linkedin-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes,location=yes'
        );

        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for LinkedIn authentication.');
        }

        // Enhanced popup monitoring
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            
            // Check if authentication was successful
            setTimeout(() => {
              const isConnected = localStorage.getItem('linkedin-connected') === 'true';
              if (!isConnected) {
                toast({
                  title: "Authentication Incomplete",
                  description: "LinkedIn authentication was not completed. Please try again.",
                  variant: "destructive",
                });
              }
            }, 1000);
          }
        }, 1000);

        // Listen for successful authentication
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
        description: error.message || "Failed to connect to LinkedIn. Please try again.",
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
        // Store LinkedIn credentials securely
        localStorage.setItem('linkedin-access-token', data.accessToken);
        localStorage.setItem('linkedin-connected', 'true');
        localStorage.setItem('linkedin-user-id', data.profile.sub);
        
        const profileData = {
          name: data.profile.name,
          profileUrl: `https://linkedin.com/in/${data.profile.sub}`,
          email: data.profile.email
        };
        
        localStorage.setItem('linkedin-profile', JSON.stringify(profileData));
        
        setIsLinkedInConnected(true);
        setLinkedInProfile(profileData);
        
        toast({
          title: "LinkedIn Connected Successfully! 🎉",
          description: `Your LinkedIn account (${data.profile.name}) is now connected and ready for posting.`,
        });
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      toast({
        title: "Authentication Failed",
        description: "Failed to complete LinkedIn authentication. Please try again.",
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
      description: "Your LinkedIn account has been safely disconnected.",
    });
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: "Account Deletion",
        description: "Account deletion functionality would be implemented here in a real application.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Profile & Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your professional profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  placeholder="Your full name"
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50 border-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  placeholder="Your company"
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                  placeholder="Your job title"
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={profileData.industry}
                  onChange={(e) => setProfileData({...profileData, industry: e.target.value})}
                  placeholder="Your industry"
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="Your location"
                  className="border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                placeholder="Your website or portfolio URL"
                className="border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell us about your professional background and expertise..."
                className="min-h-[100px] border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            <Button 
              onClick={saveProfile} 
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* LinkedIn Integration */}
        <Card className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              LinkedIn Integration
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn account for seamless posting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 border-2 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${isLinkedInConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <span className="font-semibold text-lg">
                    {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  {isLinkedInConnected && linkedInProfile.name && (
                    <p className="text-sm text-gray-600">
                      {linkedInProfile.name}
                    </p>
                  )}
                </div>
              </div>
              {isLinkedInConnected ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
            </div>

            {/* Connection Actions */}
            {isLinkedInConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Ready to Post!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your LinkedIn account is connected and ready for publishing posts directly from LinkedUp.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open(linkedInProfile.profileUrl || 'https://linkedin.com', '_blank')}
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                  <Button
                    onClick={disconnectLinkedIn}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Why Connect LinkedIn?
                  </h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                    <li>• Publish posts directly to your LinkedIn feed</li>
                    <li>• Schedule content for optimal engagement times</li>
                    <li>• Track post performance and engagement</li>
                    <li>• Seamless integration with content creation tools</li>
                  </ul>
                </div>
                
                <Button
                  onClick={connectLinkedIn}
                  disabled={isConnecting}
                  className="w-full bg-[#0077B5] hover:bg-[#005885] text-white font-semibold h-12"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Connecting to LinkedIn...
                    </>
                  ) : (
                    <>
                      <Link className="mr-2 h-5 w-5" />
                      Connect LinkedIn Account
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy & Security Settings */}
        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy preferences and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="visibility">Profile Visibility</Label>
                <select
                  id="visibility"
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                  className="w-full p-3 mt-2 border-2 border-input rounded-md bg-background focus:border-green-500 transition-colors"
                >
                  <option value="public">Public - Visible to everyone</option>
                  <option value="network">Network Only - Visible to connections</option>
                  <option value="private">Private - Only visible to you</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Email Notifications</span>
                    <p className="text-sm text-gray-600">Receive updates about your account activity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.emailNotifications}
                    onChange={(e) => setPrivacySettings({...privacySettings, emailNotifications: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Marketing Emails</span>
                    <p className="text-sm text-gray-600">Receive product updates and tips</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.marketingEmails}
                    onChange={(e) => setPrivacySettings({...privacySettings, marketingEmails: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Data Sharing</span>
                    <p className="text-sm text-gray-600">Share anonymous usage data to improve the product</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.dataSharing}
                    onChange={(e) => setPrivacySettings({...privacySettings, dataSharing: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <Button 
                onClick={savePrivacySettings}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Save Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Account Management
            </CardTitle>
            <CardDescription>
              Manage your account settings and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Danger Zone
              </h4>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                These actions are permanent and cannot be undone.
              </p>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    localStorage.clear();
                    toast({
                      title: "Data Cleared",
                      description: "All local data has been cleared.",
                    });
                  }}
                >
                  Clear All Local Data
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={deleteAccount}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
