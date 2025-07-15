
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
    console.log('LinkedIn auth request:', { action, hasCode: !!code, redirectUri });

    // LinkedIn OAuth credentials
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

    if (action === 'getAuthUrl') {
      if (!clientId) {
        console.error('LinkedIn Client ID not configured');
        return new Response(JSON.stringify({ 
          error: 'LinkedIn integration not configured. Please add LINKEDIN_CLIENT_ID in Supabase Edge Function Secrets.',
          needsConfig: true 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Clean the redirect URI - remove any trailing slashes and query parameters
      const cleanRedirectUri = redirectUri.split('?')[0].replace(/\/$/, '');
      
      const scope = 'openid profile email w_member_social';
      const state = crypto.randomUUID();
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(cleanRedirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
      
      console.log('Generated LinkedIn auth URL:', authUrl);
      console.log('Clean redirect URI:', cleanRedirectUri);
      
      return new Response(JSON.stringify({ 
        authUrl, 
        state,
        redirectUri: cleanRedirectUri,
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'exchangeCode') {
      if (!clientId || !clientSecret) {
        console.error('LinkedIn credentials not fully configured');
        return new Response(JSON.stringify({ 
          error: 'LinkedIn integration not fully configured. Please add both LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in Supabase Edge Function Secrets.',
          needsConfig: true 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!code) {
        return new Response(JSON.stringify({ 
          error: 'Authorization code is required',
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Clean the redirect URI the same way
      const cleanRedirectUri = redirectUri.split('?')[0].replace(/\/$/, '');
      
      console.log('Exchanging authorization code for access token...');
      console.log('Using clean redirect URI:', cleanRedirectUri);

      // Step 1: Exchange code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: cleanRedirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', tokenResponse.status, errorText);
        return new Response(JSON.stringify({ 
          error: `LinkedIn authentication failed: ${errorText}. Check your LinkedIn app redirect URI configuration.`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokenData = await tokenResponse.json();
      console.log('Access token obtained successfully');
      
      // Step 2: Get user profile information
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile fetch failed:', profileResponse.status, errorText);
        return new Response(JSON.stringify({ 
          error: `Failed to fetch LinkedIn profile: ${errorText}`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const profileData = await profileResponse.json();
      console.log('LinkedIn profile fetched successfully for:', profileData.name);

      // Enhanced profile data
      const enhancedProfile = {
        ...profileData,
        name: profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim(),
        profileUrl: `https://www.linkedin.com/in/${profileData.sub}`,
      };

      console.log('LinkedIn authentication completed successfully');

      return new Response(JSON.stringify({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        profile: enhancedProfile,
        success: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action specified',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return new Response(JSON.stringify({ 
      error: `LinkedIn authentication error: ${error.message}`,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
