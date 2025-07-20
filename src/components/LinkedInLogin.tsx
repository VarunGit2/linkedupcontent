
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const LinkedInLogin: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const loginWithLinkedIn = async () => {
    setIsConnecting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      // OAuth flow will redirect to LinkedIn
      toast({
        title: "Redirecting to LinkedIn",
        description: "Please complete the authentication process.",
      });
    } catch (error: any) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Unable to connect to LinkedIn. Please try again.",
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
