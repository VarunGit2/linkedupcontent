
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Shield, Linkedin, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileSettingsProps {
  user: SupabaseUser | null;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    industry: '',
    bio: '',
    location: '',
    website: ''
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showCompany: true,
    allowMessages: true,
    showActivity: false
  });

  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState({
    name: '',
    email: '',
    profileUrl: '',
    connections: 0
  });

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load user data
    if (user) {
      setProfileData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        company: user.user_metadata?.company || '',
        position: user.user_metadata?.position || '',
        industry: user.user_metadata?.industry || '',
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.location || '',
        website: user.user_metadata?.website || ''
      });
    }

    // Check LinkedIn connection status
    const linkedInConnected = localStorage.getItem('linkedin-connected') === 'true';
    setIsLinkedInConnected(linkedInConnected);
    
    if (linkedInConnected) {
      const savedProfile = localStorage.getItem('linkedin-profile');
      if (savedProfile) {
        setLinkedInProfile(JSON.parse(savedProfile));
      }
    }

    // Load privacy settings
    const savedPrivacy = localStorage.getItem('privacy-settings');
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy));
    }
  }, [user]);

  const handleProfileUpdate = () => {
    // Save profile data to localStorage (in real app, this would be saved to database)
    localStorage.setItem('user-profile', JSON.stringify(profileData));
    toast({
      title: "Profile Updated! ✅",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handlePrivacyUpdate = () => {
    localStorage.setItem('privacy-settings', JSON.stringify(privacySettings));
    toast({
      title: "Privacy Settings Updated! 🔒",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleLinkedInConnect = () => {
    // Simulate LinkedIn OAuth (in real app, this would use LinkedIn API)
    const mockProfile = {
      name: profileData.name || 'Professional User',
      email: profileData.email,
      profileUrl: `https://linkedin.com/in/${profileData.name.toLowerCase().replace(' ', '-')}`,
      connections: Math.floor(Math.random() * 1000) + 500
    };
    
    setLinkedInProfile(mockProfile);
    setIsLinkedInConnected(true);
    localStorage.setItem('linkedin-connected', 'true');
    localStorage.setItem('linkedin-profile', JSON.stringify(mockProfile));
    
    toast({
      title: "LinkedIn Connected! 🎉",
      description: "Your LinkedIn account has been successfully connected.",
    });
  };

  const handleLinkedInDisconnect = () => {
    setIsLinkedInConnected(false);
    setLinkedInProfile({ name: '', email: '', profileUrl: '', connections: 0 });
    localStorage.removeItem('linkedin-connected');
    localStorage.removeItem('linkedin-profile');
    
    toast({
      title: "LinkedIn Disconnected",
      description: "Your LinkedIn account has been disconnected.",
    });
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    // In real app, this would call Supabase auth.updateUser
    setNewPassword('');
    toast({
      title: "Password Updated! 🔐",
      description: "Your password has been changed successfully.",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Settings & Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Manage your account, privacy, and LinkedIn integration
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <Settings className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="border-2 focus:border-blue-500"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={profileData.industry}
                    onChange={(e) => setProfileData(prev => ({ ...prev, industry: e.target.value }))}
                    className="border-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="border-2 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  className="border-2 focus:border-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[100px] border-2 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <Button onClick={handleProfileUpdate} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control what information is visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Profile Visibility</Label>
                    <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={privacySettings.profileVisibility}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, profileVisibility: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show Email</Label>
                    <p className="text-sm text-gray-500">Display your email address on your profile</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show Company</Label>
                    <p className="text-sm text-gray-500">Display your company information</p>
                  </div>
                  <Switch
                    checked={privacySettings.showCompany}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showCompany: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Allow Messages</Label>
                    <p className="text-sm text-gray-500">Allow other users to send you messages</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowMessages}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Show Activity</Label>
                    <p className="text-sm text-gray-500">Display your recent activity and posts</p>
                  </div>
                  <Switch
                    checked={privacySettings.showActivity}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showActivity: checked }))}
                  />
                </div>
              </div>
              
              <Button onClick={handlePrivacyUpdate} className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Update Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-blue-600" />
                LinkedIn Integration
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn account to schedule and manage posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isLinkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium">
                      LinkedIn {isLinkedInConnected ? 'Connected' : 'Not Connected'}
                    </p>
                    {isLinkedInConnected && (
                      <p className="text-sm text-gray-500">{linkedInProfile.name}</p>
                    )}
                  </div>
                </div>
                {isLinkedInConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {isLinkedInConnected ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <Label className="text-sm font-medium text-gray-500">Profile Name</Label>
                        <p className="text-lg font-semibold">{linkedInProfile.name}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Label className="text-sm font-medium text-gray-500">Connections</Label>
                        <p className="text-lg font-semibold">{linkedInProfile.connections}+</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Profile URL</Label>
                    <p className="text-blue-600 hover:underline cursor-pointer">{linkedInProfile.profileUrl}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1" disabled>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Connected
                    </Button>
                    <Button 
                      onClick={handleLinkedInDisconnect}
                      variant="outline" 
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Linkedin className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                  <p className="text-lg font-medium mb-2">Connect Your LinkedIn Account</p>
                  <p className="text-gray-500 mb-6">Authorize LinkedUp to post content to your LinkedIn profile</p>
                  <Button onClick={handleLinkedInConnect} className="bg-[#0077B5] hover:bg-[#005582] text-white">
                    <Linkedin className="mr-2 h-4 w-4" />
                    Connect LinkedIn
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-l-4 border-l-purple-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-2 focus:border-purple-500 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePasswordChange} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!newPassword}
                >
                  Update Password
                </Button>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Email Verified</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Two-Factor Authentication</span>
                    <Badge variant="secondary">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
