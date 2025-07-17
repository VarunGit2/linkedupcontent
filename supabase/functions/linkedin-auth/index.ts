
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, code, redirectUri } = await req.json()
    
    const CLIENT_ID = '861wh2zryqucm1'
    const CLIENT_SECRET = 'WPL_AP1.MBZi0AtUQoFE4Vzs.I4zmWA=='
    
    if (action === 'getAuthUrl') {
      const state = crypto.randomUUID()
      const scope = 'openid profile email w_member_social'
      
      // Use the exact redirect URI provided
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `scope=${encodeURIComponent(scope)}`

      console.log('Generated LinkedIn auth URL:', authUrl)
      console.log('Using redirect URI:', redirectUri)

      return new Response(JSON.stringify({
        success: true,
        authUrl,
        state,
        redirectUri
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'exchangeCode') {
      console.log('Exchanging code for token:', { code, redirectUri })
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Token exchange failed:', errorText)
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Token exchange failed: ${tokenResponse.status} - ${errorText}`,
          details: errorText
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const tokenData = await tokenResponse.json()
      console.log('Token exchange successful')

      // Get user profile using the new LinkedIn API
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text()
        console.error('Profile fetch failed:', errorText)
        
        // Try the legacy profile API as fallback
        const legacyResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,emailAddress)', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        })
        
        if (legacyResponse.ok) {
          const legacyData = await legacyResponse.json()
          const profileData = {
            sub: legacyData.id,
            name: `${legacyData.firstName?.localized?.en_US || ''} ${legacyData.lastName?.localized?.en_US || ''}`.trim(),
            email: legacyData.emailAddress,
            picture: null
          }
          
          return new Response(JSON.stringify({
            success: true,
            accessToken: tokenData.access_token,
            profile: profileData
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Profile fetch failed: ${profileResponse.status} - ${errorText}`,
          details: errorText
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const profileData = await profileResponse.json()
      console.log('Profile fetch successful:', profileData.name || profileData.sub)

      return new Response(JSON.stringify({
        success: true,
        accessToken: tokenData.access_token,
        profile: profileData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('LinkedIn auth error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
