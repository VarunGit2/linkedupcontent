
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, Globe, Building, Calendar, Edit3 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileViewProps {
  user: SupabaseUser | null;
  onEditProfile: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onEditProfile }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    industry: '',
    bio: '',
    location: '',
    website: '',
    joinedDate: ''
  });

  const [stats, setStats] = useState({
    postsCreated: 0,
    postsScheduled: 0,
    ideasGenerated: 0
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.user_metadata?.name || 'Professional User',
        email: user.email || '',
        company: user.user_metadata?.company || 'Your Company',
        position: user.user_metadata?.position || 'Your Position',
        industry: user.user_metadata?.industry || 'Technology',
        bio: user.user_metadata?.bio || 'Passionate professional focused on growth and innovation.',
        location: user.user_metadata?.location || 'Your Location',
        website: user.user_metadata?.website || '',
        joinedDate: new Date(user.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      });
    }

    // Load user stats from localStorage
    const savedPosts = JSON.parse(localStorage.getItem('scheduled-posts') || '[]');
    const userPosts = savedPosts.filter((post: any) => post.userId === user?.id);
    
    setStats({
      postsCreated: userPosts.filter((post: any) => post.status === 'published').length,
      postsScheduled: userPosts.filter((post: any) => post.status === 'scheduled').length,
      ideasGenerated: parseInt(localStorage.getItem('ideas-generated') || '0')
    });
  }, [user]);

  const getUserInitials = () => {
    if (profileData.name && profileData.name !== 'Professional User') {
      const nameParts = profileData.name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return profileData.name[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Your professional presence on LinkedUp
        </p>
      </div>

      {/* Profile Header */}
      <Card className="border-l-4 border-l-blue-500 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getUserInitials()}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {profileData.name}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                {profileData.position} at {profileData.company}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 mb-4">
                {profileData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {profileData.industry}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {profileData.joinedDate}
                </div>
              </div>
              {profileData.website && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-blue-600 hover:underline cursor-pointer mb-4">
                  <Globe className="w-4 h-4" />
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                    {profileData.website}
                  </a>
                </div>
              )}
              <Button onClick={onEditProfile} variant="outline" className="border-2 hover:bg-blue-50">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
          
          {profileData.bio && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {profileData.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.postsCreated}</div>
            <div className="text-sm font-medium text-gray-600">Posts Published</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.postsScheduled}</div>
            <div className="text-sm font-medium text-gray-600">Posts Scheduled</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.ideasGenerated}</div>
            <div className="text-sm font-medium text-gray-600">Ideas Generated</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-l-4 border-l-green-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest actions on LinkedUp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.postsCreated > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm">Published {stats.postsCreated} LinkedIn posts</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Recent
                </Badge>
              </div>
            )}
            {stats.postsScheduled > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm">Scheduled {stats.postsScheduled} posts</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Pending
                </Badge>
              </div>
            )}
            {stats.ideasGenerated > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-sm">Generated {stats.ideasGenerated} content ideas</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Creative
                </Badge>
              </div>
            )}
            {stats.postsCreated === 0 && stats.postsScheduled === 0 && stats.ideasGenerated === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No recent activity yet</p>
                <p className="text-sm">Start creating content to see your activity here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
