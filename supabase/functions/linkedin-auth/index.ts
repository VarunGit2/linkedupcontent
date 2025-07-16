
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

    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

    if (action === 'getAuthUrl') {
      if (!clientId) {
        console.error('LinkedIn Client ID not configured');
        return new Response(JSON.stringify({ 
          error: 'LinkedIn integration not configured. Please add LINKEDIN_CLIENT_ID to Supabase secrets.',
          needsConfig: true 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const currentDomain = new URL(redirectUri || 'https://preview--linkedupcontent.lovable.app/').origin;
      const finalRedirectUri = `${currentDomain}/`;
      const scope = 'openid profile email w_member_social';
      const state = crypto.randomUUID();
      
      // Fixed: Properly include client_id in the auth URL
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
      
      console.log('Generated LinkedIn auth URL:', authUrl);
      console.log('Using client_id:', clientId);
      console.log('Using redirect URI:', finalRedirectUri);
      
      return new Response(JSON.stringify({ 
        authUrl, 
        state,
        redirectUri: finalRedirectUri,
        clientId: clientId,
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'exchangeCode') {
      if (!clientId || !clientSecret) {
        console.error('LinkedIn credentials not configured', { hasClientId: !!clientId, hasClientSecret: !!clientSecret });
        return new Response(JSON.stringify({ 
          error: 'LinkedIn integration not configured. Please add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to Supabase secrets.',
          needsConfig: true 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!code) {
        return new Response(JSON.stringify({ 
          error: 'Authorization code required',
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const currentDomain = new URL(redirectUri || 'https://preview--linkedupcontent.lovable.app/').origin;
      const finalRedirectUri = `${currentDomain}/`;
      
      console.log('Exchanging code with:', { 
        redirectUri: finalRedirectUri, 
        clientId: clientId,
        codeLength: code.length 
      });

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
          redirect_uri: finalRedirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('LinkedIn token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: errorText,
          redirectUri: finalRedirectUri,
          clientId: clientId
        });
        return new Response(JSON.stringify({ 
          error: `LinkedIn connection failed: ${tokenResponse.status} - ${errorText}`,
          success: false,
          details: errorText,
          debugInfo: {
            redirectUri: finalRedirectUri,
            clientId: clientId,
            hasClientSecret: !!clientSecret
          }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokenData = await tokenResponse.json();
      console.log('LinkedIn access token obtained successfully');
      
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('LinkedIn profile fetch failed:', {
          status: profileResponse.status,
          error: errorText
        });
        return new Response(JSON.stringify({ 
          error: `Failed to fetch LinkedIn profile: ${profileResponse.status}`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const profileData = await profileResponse.json();
      console.log('LinkedIn profile fetched successfully for:', profileData.name);

      return new Response(JSON.stringify({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        profile: {
          ...profileData,
          name: profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim(),
        },
        success: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return new Response(JSON.stringify({ 
      error: `LinkedIn authentication failed: ${error.message}`,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
