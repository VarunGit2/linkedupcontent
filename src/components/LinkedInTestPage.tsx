
import React, { useEffect, useState } from 'react';
import { LinkedInLogin } from './LinkedInLogin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const LinkedInTestPage: React.FC = () => {
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Check if LinkedIn is already connected
    const connected = localStorage.getItem('linkedin-connected') === 'true';
    const profile = localStorage.getItem('linkedin-profile');
    
    setLinkedInConnected(connected);
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">LinkedIn Integration Test</h1>
        <p className="text-muted-foreground">Test your LinkedIn OAuth connection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {linkedInConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            LinkedIn Connection Status
          </CardTitle>
          <CardDescription>
            {linkedInConnected 
              ? "Your LinkedIn account is connected and ready to use"
              : "Connect your LinkedIn account to get started"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${linkedInConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">Status</span>
            </div>
            <Badge variant={linkedInConnected ? "default" : "secondary"}>
              {linkedInConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>

          {userProfile && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">Connected Profile:</h3>
              <p><strong>Name:</strong> {userProfile.name}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>User ID:</strong> {userProfile.sub}</p>
            </div>
          )}

          {!linkedInConnected && (
            <div className="text-center">
              <LinkedInLogin />
            </div>
          )}

          {linkedInConnected && (
            <div className="text-center">
              <button
                onClick={() => {
                  localStorage.removeItem('linkedin-connected');
                  localStorage.removeItem('linkedin-profile');
                  localStorage.removeItem('linkedin-access-token');
                  localStorage.removeItem('linkedin-user-id');
                  setLinkedInConnected(false);
                  setUserProfile(null);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Disconnect LinkedIn
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Click "Login with LinkedIn" to start the OAuth flow</p>
          <p>2. You'll be redirected to LinkedIn to authorize the app</p>
          <p>3. LinkedIn will redirect you back to this app</p>
          <p>4. The app will exchange the code for an access token</p>
          <p>5. Your profile information will be stored locally</p>
        </CardContent>
      </Card>
    </div>
  );
};
