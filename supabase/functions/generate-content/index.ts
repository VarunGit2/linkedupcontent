
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

    // Try different models if the main one fails
    const models = ['gpt-4o-mini', 'gpt-3.5-turbo'];
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.7,
          }),
        });

        console.log(`${model} API Response Status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content || '';

          console.log('Generated content successfully with', model);

          return new Response(JSON.stringify({ content }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await response.text();
          console.error(`${model} API Error:`, errorText);
          lastError = errorText;
        }
      } catch (modelError) {
        console.error(`Error with ${model}:`, modelError);
        lastError = modelError.message;
      }
    }

    // If all models fail, throw the last error
    throw new Error(`All AI models failed. Last error: ${lastError}`);

  } catch (error) {
    console.error('Error in generate-content function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
