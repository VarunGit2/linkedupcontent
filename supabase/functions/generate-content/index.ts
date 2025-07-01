
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('OpenAI API Key available:', openAIApiKey ? 'Yes' : 'No');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API Key not found in environment variables');
    }

    const { prompt, tone, length, type } = await req.json();

    console.log('Generating content with:', { prompt, tone, length, type });

    let systemPrompt = '';
    let maxTokens = 300;

    if (type === 'ideas') {
      systemPrompt = 'You are a creative content strategist specializing in LinkedIn content. Generate engaging, relevant, and professional LinkedIn post ideas that will drive engagement and provide value to the professional community. Return only the ideas, one per line, without numbering.';
      maxTokens = 500;
    } else {
      systemPrompt = `You are a professional LinkedIn content creator. Create engaging LinkedIn posts that are ${tone} in tone and ${length} in length. Include relevant hashtags and make the content engaging for professional audiences.`;
      maxTokens = length === 'short' ? 150 : length === 'medium' ? 300 : 500;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      
      // Handle specific error cases
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'API quota exceeded. Please check your OpenAI billing and usage limits.',
          fallback: 'Due to API limitations, here\'s a sample LinkedIn post:\n\n🚀 Excited to share my thoughts on professional growth in today\'s dynamic workplace!\n\nKey insights:\n• Continuous learning is essential\n• Building meaningful connections matters\n• Embracing change leads to opportunities\n\nWhat strategies have helped you grow professionally? Share your experiences below! 👇\n\n#ProfessionalGrowth #LinkedIn #CareerDevelopment #Networking'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    console.log('Generated content successfully');

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content function:', error);
    
    // Provide fallback content for better user experience
    const fallbackContent = type === 'ideas' ? 
      'Share a professional milestone or achievement\nDiscuss industry trends and insights\nOffer career advice or tips\nHighlight company culture or team success\nComment on relevant news or developments\nShare learning experiences or courses\nCelebrate professional connections\nDiscuss work-life balance strategies' :
      '🌟 Professional insight of the day!\n\nIn today\'s rapidly evolving workplace, staying adaptable and curious is key to success. Here are three strategies that have made a difference:\n\n✅ Embrace continuous learning\n✅ Build authentic relationships\n✅ Share knowledge generously\n\nWhat professional insights have shaped your career journey? I\'d love to hear your thoughts!\n\n#ProfessionalDevelopment #Growth #LinkedIn #CareerTips';
    
    return new Response(JSON.stringify({ 
      content: fallbackContent,
      isLocal: true,
      message: 'Using local content due to API limitations'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
