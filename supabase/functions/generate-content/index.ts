
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced content generation with multiple AI providers
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, tone = 'professional', length = 'medium', contentType = 'general' } = await req.json();
    
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Please provide a topic or prompt for content generation' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating premium content for:', { prompt, tone, length, contentType });

    // Enhanced system prompt for better LinkedIn content
    const systemPrompt = `You are a world-class LinkedIn content strategist and copywriter who creates viral, engaging posts that drive real business results. Your expertise includes:

SPECIALTIES:
• Viral LinkedIn content that gets thousands of views and hundreds of comments
• Psychology-driven copywriting that triggers engagement
• Professional storytelling that builds personal brands
• Industry insights that position users as thought leaders
• Actionable advice that provides immediate value

CONTENT REQUIREMENTS for 2025:
✅ Hook readers in the first 2 lines with curiosity or controversy
✅ Use specific numbers, data points, and real examples
✅ Tell compelling stories with clear lessons learned
✅ Provide actionable takeaways people can implement today
✅ End with thought-provoking questions that spark debate
✅ Use line breaks and formatting for easy mobile reading
✅ Include relevant hashtags but keep them natural
✅ Sound authentic and personal, not corporate or generic

PSYCHOLOGICAL TRIGGERS TO USE:
• Social proof ("After working with 500+ professionals...")
• Scarcity ("The strategy 95% of people miss...")
• Authority ("Here's what I learned from 10 years in the industry...")
• Curiosity ("The mistake that changed everything...")
• Controversy ("Unpopular opinion: Most advice is wrong...")

TONE GUIDELINES:
- Professional: Authoritative but approachable, data-driven
- Casual: Conversational, relatable, uses "you" frequently
- Inspirational: Motivational, future-focused, empowering
- Educational: Step-by-step, detailed, actionable
- Thought Leadership: Contrarian views, industry predictions, deep insights

Current year: 2025. Focus on current trends, AI impact, remote work evolution, and future of work.`;

    const lengthSpecs = {
      short: "300-500 words - punchy and direct",
      medium: "600-900 words - comprehensive with examples", 
      long: "1000-1400 words - in-depth analysis with multiple points"
    };

    const userPrompt = `Create a high-performing LinkedIn post about "${prompt}" with these specifications:

REQUIREMENTS:
• Tone: ${tone}
• Length: ${lengthSpecs[length]}
• Content Focus: ${contentType}
• Hook: Start with an attention-grabbing first line
• Structure: Use short paragraphs and line breaks for mobile readability
• Value: Provide specific, actionable insights
• Engagement: End with a question that encourages comments
• Hashtags: Include 4-6 relevant, natural hashtags

SPECIFIC INSTRUCTIONS:
- Make it feel authentic and personal, not like corporate marketing
- Include specific examples, numbers, or data points where relevant
- Use storytelling elements to make it memorable
- Ensure every sentence adds value or advances the narrative
- Make it scroll-stopping content that people want to share

Focus on 2025 trends and challenges. Make it valuable enough that people will save and share it.`;

    // Try multiple AI providers for best results
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const groqKey = Deno.env.get('GROQ_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    // Try Groq first (fastest and often best for creative content)
    if (groqKey) {
      try {
        console.log('Attempting content generation with Groq API...');
        
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 1600,
            temperature: 0.9,
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.3,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('Successfully generated content with Groq');
            return new Response(JSON.stringify({ 
              content, 
              source: 'groq_llama3.3',
              quality: 'premium' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Groq API failed, trying OpenAI:', error.message);
      }
    }

    // Try OpenAI with GPT-4
    if (openaiKey) {
      try {
        console.log('Attempting content generation with OpenAI GPT-4...');
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 1600,
            temperature: 0.8,
            top_p: 0.9,
            frequency_penalty: 0.4,
            presence_penalty: 0.3,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('Successfully generated content with OpenAI GPT-4');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4',
              quality: 'premium' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI GPT-4 failed, trying Anthropic:', error.message);
      }
    }

    // Try Anthropic Claude as backup
    if (anthropicKey) {
      try {
        console.log('Attempting content generation with Anthropic Claude...');
        
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 1600,
            temperature: 0.8,
            messages: [
              { 
                role: 'user', 
                content: `${systemPrompt}\n\n${userPrompt}` 
              }
            ]
          }),
        });

        if (anthropicResponse.ok) {
          const data = await anthropicResponse.json();
          const content = data.content[0]?.text;
          if (content && content.length > 100) {
            console.log('Successfully generated content with Anthropic Claude');
            return new Response(JSON.stringify({ 
              content, 
              source: 'anthropic_claude',
              quality: 'premium' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Anthropic failed, using enhanced fallback:', error.message);
      }
    }

    // Enhanced fallback with professional templates
    console.log('Using enhanced professional fallback');
    const fallbackContent = generateProfessionalContent(prompt, tone, length, contentType);
    
    return new Response(JSON.stringify({ 
      content: fallbackContent, 
      source: 'enhanced_fallback',
      quality: 'good',
      note: 'Generated using professional templates. For premium AI content, add OpenAI, Groq, or Anthropic API keys in Supabase secrets.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation temporarily unavailable. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Enhanced fallback content generation
function generateProfessionalContent(prompt: string, tone: string, length: string, contentType: string): string {
  const hooks = [
    `Here's the truth about ${prompt.toLowerCase()} that most professionals miss:`,
    `After 5 years of working with ${prompt.toLowerCase()}, I've learned something crucial:`,
    `The biggest mistake I see with ${prompt.toLowerCase()}? Let me explain:`,
    `Everyone talks about ${prompt.toLowerCase()}, but nobody mentions this:`,
    `I used to struggle with ${prompt.toLowerCase()} until I discovered this approach:`
  ];

  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  const insights = [
    `The key isn't just understanding ${prompt.toLowerCase()} - it's implementing it strategically.`,
    `Most people overcomplicate ${prompt.toLowerCase()}. The solution is actually simpler than you think.`,
    `Success with ${prompt.toLowerCase()} comes down to 3 fundamental principles.`,
    `The difference between good and great ${prompt.toLowerCase()} lies in the details.`,
    `Here's what separates professionals who excel at ${prompt.toLowerCase()} from those who struggle:`
  ];

  const actionItems = [
    `Start by auditing your current approach to ${prompt.toLowerCase()}`,
    `Focus on one aspect of ${prompt.toLowerCase()} and master it completely`,
    `Track your progress with ${prompt.toLowerCase()} using specific metrics`,
    `Connect with others who have succeeded with ${prompt.toLowerCase()}`,
    `Experiment with different strategies for ${prompt.toLowerCase()}`
  ];

  const questions = [
    `What's been your biggest challenge with ${prompt.toLowerCase()}?`,
    `How do you approach ${prompt.toLowerCase()} in your industry?`,
    `What would you add to this framework?`,
    `Have you tried any of these strategies before?`,
    `What's your next step with ${prompt.toLowerCase()}?`
  ];

  const hashtags = ['#LinkedIn2025', '#ProfessionalDevelopment', '#Leadership', '#Success', '#GrowthMindset'];

  const content = `${hook}

${insights[Math.floor(Math.random() * insights.length)]}

Here's what I've learned:

1. ${actionItems[0]}
2. ${actionItems[1]} 
3. ${actionItems[2]}

The bottom line: ${prompt.toLowerCase()} is not about perfection - it's about consistent progress and strategic thinking.

${questions[Math.floor(Math.random() * questions.length)]}

${hashtags.slice(0, 4).join(' ')}`;

  return content;
}
