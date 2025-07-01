
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, tone = 'professional', length = 'medium', type = 'content' } = await req.json();
    
    console.log('Generating content with:', { prompt, tone, length, type });
    console.log('Available APIs:', { 
      anthropic: !!ANTHROPIC_API_KEY, 
      openai: !!OPENAI_API_KEY 
    });

    let generatedContent = '';

    // Try Anthropic Claude first
    if (ANTHROPIC_API_KEY) {
      try {
        console.log('Trying Anthropic Claude...');
        
        let systemPrompt = '';
        if (type === 'ideas') {
          systemPrompt = 'You are a creative LinkedIn content strategist. Generate 8 engaging LinkedIn post ideas. Return only the ideas, one per line, without numbering.';
        } else {
          systemPrompt = `You are a professional LinkedIn content creator. Create an engaging LinkedIn post that is ${tone} in tone and ${length} in length. Include relevant hashtags.`;
        }

        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: type === 'ideas' ? 500 : (length === 'short' ? 150 : length === 'medium' ? 300 : 500),
            system: systemPrompt,
            messages: [
              { role: 'user', content: prompt }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          generatedContent = claudeData.content[0]?.text || '';
          console.log('Successfully generated with Claude');
        } else {
          console.log('Claude failed, status:', claudeResponse.status);
        }
      } catch (error) {
        console.log('Claude error:', error.message);
      }
    }

    // Try OpenAI if Claude failed or not available
    if (!generatedContent && OPENAI_API_KEY) {
      try {
        console.log('Trying OpenAI...');
        
        let systemPrompt = '';
        let maxTokens = 300;

        if (type === 'ideas') {
          systemPrompt = 'You are a creative content strategist specializing in LinkedIn content. Generate 8 engaging, relevant, and professional LinkedIn post ideas. Return only the ideas, one per line, without numbering.';
          maxTokens = 500;
        } else {
          systemPrompt = `You are a professional LinkedIn content creator. Create engaging LinkedIn posts that are ${tone} in tone and ${length} in length. Include relevant hashtags and make the content engaging for professional audiences.`;
          maxTokens = length === 'short' ? 150 : length === 'medium' ? 300 : 500;
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          generatedContent = openaiData.choices[0]?.message?.content || '';
          console.log('Successfully generated with OpenAI');
        } else {
          console.log('OpenAI failed, status:', openaiResponse.status);
        }
      } catch (error) {
        console.log('OpenAI error:', error.message);
      }
    }

    // Fallback content if both APIs fail
    if (!generatedContent) {
      console.log('All AI services failed, using fallback');
      
      if (type === 'ideas') {
        generatedContent = `Here are some engaging LinkedIn post ideas:

🚀 Share a recent professional achievement and the lessons learned
💡 Discuss industry trends that are shaping your field
🤝 Highlight a valuable networking experience or connection
📚 Share insights from a book, course, or conference you attended
⚡ Post about a problem you solved and your approach
🌟 Celebrate a team member's success or contribution
📈 Share data-driven insights relevant to your industry
🎯 Discuss your professional goals and how you're working towards them`;
      } else {
        const toneMap = {
          professional: "I wanted to share some thoughts on professional growth and development.",
          casual: "Just had an interesting realization about work-life balance!",
          inspirational: "Every challenge is an opportunity to grow stronger. 💪",
          educational: "Here's something valuable I learned recently that might help you too.",
          humorous: "They say learning never stops... my coffee cup agrees! ☕"
        };
        
        generatedContent = `${toneMap[tone] || toneMap.professional}

${prompt.toLowerCase().includes('tip') ? 'Here are some key insights:' : 'Here\'s what I discovered:'}

✅ Focus on continuous learning and skill development
✅ Build meaningful professional relationships
✅ Stay curious and ask thoughtful questions
✅ Share knowledge and help others succeed

What's your experience with this? I'd love to hear your thoughts!

#ProfessionalGrowth #LinkedIn #CareerDevelopment #Success`;
      }
    }

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Content generation service temporarily unavailable. Please try again.',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
