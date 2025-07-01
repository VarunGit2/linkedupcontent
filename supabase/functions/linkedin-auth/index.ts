
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, redirectUri } = await req.json();
    console.log('LinkedIn auth action:', action);

    if (action === 'getAuthUrl') {
      const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
      
      if (!clientId) {
        throw new Error('LinkedIn Client ID not configured');
      }
      
      const scope = 'openid profile w_member_social';
      const state = crypto.randomUUID();
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
      
      console.log('Generated auth URL for LinkedIn');
      
      return new Response(JSON.stringify({ authUrl, state }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'exchangeCode') {
      const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
      const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('LinkedIn credentials not configured');
      }

      console.log('Exchanging code for access token...');

      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      console.log('Successfully got access token');
      
      // Get user profile using the new userinfo endpoint
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile fetch failed:', errorText);
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await profileResponse.json();
      console.log('Successfully fetched user profile');

      return new Response(JSON.stringify({
        accessToken: tokenData.access_token,
        profile: profileData,
        success: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
