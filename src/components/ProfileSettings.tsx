
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Shield, Linkedin, Save } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileSettingsProps {
  user: { email: string; name: string };
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    bio: '',
    company: '',
    position: '',
    linkedinUrl: '',
    industry: '',
    location: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Profile Updated! ✅",
      description: "Your profile has been saved successfully.",
    });
    setIsSaving(false);
  };

  const connectLinkedIn = () => {
    toast({
      title: "LinkedIn Integration",
      description: "LinkedIn OAuth integration will be implemented here.",
    });
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <Avatar className="mx-auto h-20 w-20 mb-4">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Profile
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
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="mt-2 border-2 focus:border-blue-500"
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

        {/* Professional Info */}
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

        {/* LinkedIn Integration & Privacy */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Integrations & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="linkedinUrl" className="text-sm font-semibold">LinkedIn Profile URL</Label>
              <Input
                id="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedinUrl}
                onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})}
                className="mt-2 border-2 focus:border-purple-500"
              />
            </div>
            
            <Button 
              onClick={connectLinkedIn}
              className="w-full bg-[#0077B5] hover:bg-[#005885] text-white font-semibold py-3 h-auto"
            >
              <Linkedin className="mr-2 h-5 w-5" />
              Connect LinkedIn Account
            </Button>

            <div className="border-t pt-4 mt-6">
              <h3 className="font-semibold text-sm mb-3">Privacy Settings</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Your data is encrypted and secure</p>
                <p>• We never share your personal information</p>
                <p>• You can export your data anytime</p>
                <p>• You control your content visibility</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleSave}
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
    </div>
  );
};

export default ProfileSettings;
