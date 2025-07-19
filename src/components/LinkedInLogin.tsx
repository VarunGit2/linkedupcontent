
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

export const LinkedInLogin: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const loginWithLinkedIn = async () => {
    setIsConnecting(true);
    
    try {
      // Use the edge function to get the proper OAuth URL
      const redirectUri = window.location.origin;
      
      const response = await fetch('https://spxuaduwrfnbdjfwdfys.supabase.co/functions/v1/linkedin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAuthUrl',
          redirectUri: redirectUri
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store state for verification
        localStorage.setItem('linkedin-oauth-state', data.state);
        localStorage.setItem('linkedin-redirect-uri', data.redirectUri);
        
        // Redirect to LinkedIn OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Failed to get auth URL');
      }
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to LinkedIn. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={loginWithLinkedIn}
      disabled={isConnecting}
      className="bg-[#0077B5] hover:bg-[#005885] text-white"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          Connecting...
        </>
      ) : (
        <>
          <Users className="mr-2 h-4 w-4" />
          Login with LinkedIn
        </>
      )}
    </Button>
  );
};
