
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

export const LinkedInLogin: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const loginWithLinkedIn = () => {
    setIsConnecting(true);
    
    try {
      const client_id = "861wh2zryqucm1";
      const redirect_uri = "https://preview--linkedupcontent.lovable.app/";
      const state = crypto.randomUUID();
      const scope = "openid profile email w_member_social";

      // Store state for verification
      localStorage.setItem('linkedin-oauth-state', state);
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${client_id}&` +
        `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
        `state=${state}&` +
        `scope=${encodeURIComponent(scope)}`;

      // Redirect to LinkedIn OAuth
      window.location.href = authUrl;
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
