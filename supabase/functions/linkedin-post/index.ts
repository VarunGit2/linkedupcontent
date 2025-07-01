
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, accessToken, userId, scheduleFor } = await req.json();
    
    console.log('LinkedIn post request:', { 
      contentLength: content?.length, 
      hasAccessToken: !!accessToken,
      userId,
      scheduleFor 
    });

    if (!accessToken) {
      throw new Error('LinkedIn access token is required');
    }

    // Create the LinkedIn post
    const linkedInResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    if (!linkedInResponse.ok) {
      const errorData = await linkedInResponse.text();
      console.error('LinkedIn API Error:', errorData);
      throw new Error(`LinkedIn API error: ${linkedInResponse.status}`);
    }

    const postData = await linkedInResponse.json();
    console.log('LinkedIn post created successfully:', postData.id);

    return new Response(JSON.stringify({ 
      success: true,
      postId: postData.id,
      message: 'Post published successfully to LinkedIn!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in linkedin-post function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
