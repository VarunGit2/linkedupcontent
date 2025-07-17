
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
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `scope=${encodeURIComponent(scope)}`

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
        throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('Token exchange successful')

      // Get user profile
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text()
        console.error('Profile fetch failed:', errorText)
        throw new Error(`Profile fetch failed: ${profileResponse.status}`)
      }

      const profileData = await profileResponse.json()
      console.log('Profile fetch successful:', profileData.name)

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
