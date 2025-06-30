
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Shield, Linkedin, Save, Bell, Eye, Lock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileSettingsProps {
  user: SupabaseUser | null;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    company: '',
    position: '',
    linkedinUrl: '',
    industry: '',
    location: '',
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    emailVisible: false,
    showOnlineStatus: true,
    allowMessages: true,
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    contentSuggestions: true,
  });
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
        company: user.user_metadata?.company || '',
        position: user.user_metadata?.position || '',
        linkedinUrl: user.user_metadata?.linkedinUrl || '',
        industry: user.user_metadata?.industry || '',
        location: user.user_metadata?.location || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          bio: profile.bio,
          company: profile.company,
          position: profile.position,
          linkedinUrl: profile.linkedinUrl,
          industry: profile.industry,
          location: profile.location,
        }
      });

      if (error) throw error;

      toast({
        title: "Profile Updated! ✅",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const connectLinkedIn = () => {
    // Store LinkedIn connection status
    setLinkedinConnected(true);
    localStorage.setItem('linkedin-connected', 'true');
    toast({
      title: "LinkedIn Connected! 🎉",
      description: "Your LinkedIn account has been connected successfully.",
    });
  };

  const getUserInitials = () => {
    if (profile.name) {
      const nameParts = profile.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    const isConnected = localStorage.getItem('linkedin-connected') === 'true';
    setLinkedinConnected(isConnected);
  }, []);

  const renderProfileTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-l-4 border-l-blue-500 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <Avatar className="mx-auto h-20 w-20 mb-4">
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="mt-2 border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="mt-2 border-2 bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div>
            <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="mt-2 border-2 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Professional Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="company" className="text-sm font-semibold">Company</Label>
            <Input
              id="company"
              placeholder="Your company name"
              value={profile.company}
              onChange={(e) => setProfile({...profile, company: e.target.value})}
              className="mt-2 border-2 focus:border-green-500"
            />
          </div>
          <div>
            <Label htmlFor="position" className="text-sm font-semibold">Position</Label>
            <Input
              id="position"
              placeholder="Your job title"
              value={profile.position}
              onChange={(e) => setProfile({...profile, position: e.target.value})}
              className="mt-2 border-2 focus:border-green-500"
            />
          </div>
          <div>
            <Label htmlFor="industry" className="text-sm font-semibold">Industry</Label>
            <Input
              id="industry"
              placeholder="Your industry"
              value={profile.industry}
              onChange={(e) => setProfile({...profile, industry: e.target.value})}
              className="mt-2 border-2 focus:border-green-500"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
            <Input
              id="location"
              placeholder="Your location"
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              className="mt-2 border-2 focus:border-green-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacyTab = () => (
    <Card className="border-l-4 border-l-purple-500 shadow-lg max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-600" />
          Privacy & Visibility Settings
        </CardTitle>
        <CardDescription>Control who can see your information and how you appear to others</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Profile Visibility</Label>
            <p className="text-xs text-gray-500">Make your profile visible to other users</p>
          </div>
          <Switch
            checked={privacySettings.profileVisible}
            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, profileVisible: checked})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Email Visibility</Label>
            <p className="text-xs text-gray-500">Show your email to other users</p>
          </div>
          <Switch
            checked={privacySettings.emailVisible}
            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, emailVisible: checked})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Show Online Status</Label>
            <p className="text-xs text-gray-500">Let others see when you're active</p>
          </div>
          <Switch
            checked={privacySettings.showOnlineStatus}
            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, showOnlineStatus: checked})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Allow Messages</Label>
            <p className="text-xs text-gray-500">Allow other users to send you messages</p>
          </div>
          <Switch
            checked={privacySettings.allowMessages}
            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowMessages: checked})}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderLinkedInTab = () => (
    <Card className="border-l-4 border-l-blue-600 shadow-lg max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-blue-600" />
          LinkedIn Integration
        </CardTitle>
        <CardDescription>Connect your LinkedIn account to sync your professional information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${linkedinConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <span className="text-sm font-medium">
                LinkedIn {linkedinConnected ? 'Connected' : 'Not Connected'}
              </span>
              {linkedinConnected && (
                <p className="text-xs text-gray-500">Account synced successfully</p>
              )}
            </div>
          </div>
          {linkedinConnected && (
            <div className="text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="linkedinUrl" className="text-sm font-semibold">LinkedIn Profile URL</Label>
          <Input
            id="linkedinUrl"
            placeholder="https://linkedin.com/in/username"
            value={profile.linkedinUrl}
            onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})}
            className="mt-2 border-2 focus:border-blue-500"
          />
        </div>
        
        {!linkedinConnected && (
          <Button 
            onClick={connectLinkedIn}
            className="w-full bg-[#0077B5] hover:bg-[#005885] text-white font-semibold py-3 h-auto"
          >
            <Linkedin className="mr-2 h-5 w-5" />
            Connect LinkedIn Account
          </Button>
        )}

        {linkedinConnected && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Connected Features:</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Auto-sync professional information</li>
                <li>• Schedule posts directly to LinkedIn</li>
                <li>• Import LinkedIn connections</li>
                <li>• Cross-post content seamlessly</li>
              </ul>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => {
                setLinkedinConnected(false);
                localStorage.removeItem('linkedin-connected');
                toast({
                  title: "LinkedIn Disconnected",
                  description: "Your LinkedIn account has been disconnected.",
                });
              }}
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Disconnect LinkedIn
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Profile & Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Manage your account and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Privacy & Settings
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'linkedin'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            LinkedIn
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'privacy' && renderPrivacyTab()}
        {activeTab === 'linkedin' && renderLinkedInTab()}
      </div>

      {/* Save Button - Only show for profile tab */}
      {activeTab === 'profile' && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 h-auto shadow-lg"
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
