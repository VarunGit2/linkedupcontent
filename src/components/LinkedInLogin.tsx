
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

export const LinkedInLogin: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const loginWithLinkedIn = async () => {
    setIsConnecting(true);
    
    try {
      const currentDomain = window.location.origin;
      
      const { data, error } = await supabase.functions.invoke('linkedin-auth', {
        body: {
          action: 'getAuthUrl',
          redirectUri: currentDomain
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.authUrl && data?.state) {
        // Store state for verification
        localStorage.setItem('linkedin-oauth-state', data.state);
        localStorage.setItem('linkedin-redirect-uri', data.redirectUri);
        
        // Redirect to LinkedIn OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get LinkedIn authorization URL');
      }
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to LinkedIn. Please try again.",
        variant: "destructive",
      });
    } finally {
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
