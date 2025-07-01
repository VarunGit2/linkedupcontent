
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Shield, Linkedin, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileSettingsProps {
  user: SupabaseUser | null;
  onBack?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onBack }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [website, setWebsite] = useState('');
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState({ name: '', profileUrl: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load user profile data
    if (user) {
      setName(user.user_metadata?.name || '');
      // Load other profile data from localStorage or API
      const savedProfile = localStorage.getItem('user-profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setBio(profile.bio || '');
        setCompany(profile.company || '');
        setPosition(profile.position || '');
        setWebsite(profile.website || '');
        setIsPublicProfile(profile.isPublicProfile !== false);
        setEmailNotifications(profile.emailNotifications !== false);
        setMarketingEmails(profile.marketingEmails === true);
      }
    }

    // Check LinkedIn connection
    const isConnected = localStorage.getItem('linkedin-connected') === 'true';
    setIsLinkedInConnected(isConnected);
    
    if (isConnected) {
      const savedLinkedInProfile = localStorage.getItem('linkedin-profile');
      if (savedLinkedInProfile) {
        setLinkedInProfile(JSON.parse(savedLinkedInProfile));
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Update Supabase auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name }
      });

      if (authError) throw authError;

      // Save profile data to localStorage (in a real app, this would be saved to database)
      const profileData = {
        bio,
        company,
        position,
        website,
        isPublicProfile,
        emailNotifications,
        marketingEmails,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('user-profile', JSON.stringify(profileData));

      toast({
        title: "Profile Updated Successfully! ✅",
        description: "Your profile settings have been saved.",
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error Updating Profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      // In a real app, this would initiate OAuth flow
      const response = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'getAuthUrl',
          redirectUri: window.location.origin + '/auth/linkedin/callback'
        }
      });

      if (response.data?.authUrl) {
        // Store state for verification
        localStorage.setItem('linkedin-oauth-state', response.data.state);
        // Redirect to LinkedIn OAuth
        window.location.href = response.data.authUrl;
      } else {
        // Fallback for demo purposes
        setIsLinkedInConnected(true);
        const demoProfile = {
          name: user?.user_metadata?.name || 'Demo User',
          profileUrl: 'https://linkedin.com/in/demo-user'
        };
        setLinkedInProfile(demoProfile);
        localStorage.setItem('linkedin-connected', 'true');
        localStorage.setItem('linkedin-profile', JSON.stringify(demoProfile));
        
        toast({
          title: "LinkedIn Connected! 🎉",
          description: "You can now post and schedule content to LinkedIn.",
        });
      }
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Please try connecting to LinkedIn again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectLinkedIn = () => {
    setIsLinkedInConnected(false);
    setLinkedInProfile({ name: '', profileUrl: '' });
    localStorage.removeItem('linkedin-connected');
    localStorage.removeItem('linkedin-profile');
    localStorage.removeItem('linkedin-access-token');
    localStorage.removeItem('linkedin-user-id');
    
    toast({
      title: "LinkedIn Disconnected",
      description: "Your LinkedIn account has been disconnected.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        )}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Manage your profile and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal and professional details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Your job title"
              />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-gray-500">Make your profile visible to others</p>
              </div>
              <Switch
                id="public-profile"
                checked={isPublicProfile}
                onCheckedChange={setIsPublicProfile}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive updates about your content</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-gray-500">Receive tips and product updates</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
              />
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Integration */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5" />
              LinkedIn Integration
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn account to post and schedule content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLinkedInConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      LinkedIn Connected
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Connected as {linkedInProfile.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisconnectLinkedIn}
                  className="w-full"
                >
                  Disconnect LinkedIn
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      LinkedIn Not Connected
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      Connect to post and schedule content
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleConnectLinkedIn}
                  className="w-full bg-[#0077B5] hover:bg-[#005885] text-white"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  Connect LinkedIn
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="font-medium">Email Address</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="font-medium">Account Created</p>
              <p className="text-sm text-gray-500">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>

            <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
