
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

    // LinkedIn OAuth credentials - these should be set in Supabase secrets
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

    if (action === 'getAuthUrl') {
      if (!clientId) {
        console.error('LinkedIn Client ID not configured');
        return new Response(JSON.stringify({ 
          error: 'LinkedIn integration not configured. Please contact support.',
          needsConfig: true 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Enhanced OAuth scope for better LinkedIn integration
      const scope = 'openid profile email w_member_social';
      const state = crypto.randomUUID();
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
      
      console.log('Generated LinkedIn auth URL successfully');
      
      return new Response(JSON.stringify({ 
        authUrl, 
        state,
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'exchangeCode') {
      if (!clientId || !clientSecret) {
        console.error('LinkedIn credentials not fully configured');
        return new Response(JSON.stringify({ 
          error: 'LinkedIn integration not fully configured. Please contact support.',
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

      console.log('Exchanging authorization code for access token...');

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
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', tokenResponse.status, errorText);
        return new Response(JSON.stringify({ 
          error: 'Failed to authenticate with LinkedIn. Please try again.',
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
          error: 'Failed to fetch LinkedIn profile. Please try again.',
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const profileData = await profileResponse.json();
      console.log('LinkedIn profile fetched successfully');

      // Step 3: Get additional profile details if needed
      let enhancedProfile = {
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
      error: 'LinkedIn authentication service temporarily unavailable. Please try again later.',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
