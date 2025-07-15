
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

    // Enhanced system prompt for viral LinkedIn content
    const systemPrompt = `You are a world-class LinkedIn content strategist and copywriter who creates viral, engaging posts that drive real business results. Your expertise includes:

SPECIALTIES:
• Viral LinkedIn content that gets thousands of views and hundreds of comments
• Psychology-driven copywriting that triggers engagement
• Professional storytelling that builds personal brands
• Industry insights that position users as thought leaders
• Actionable advice that provides immediate value

CONTENT REQUIREMENTS for 2025:
✅ Hook readers in the first 2 lines with curiosity, controversy, or a bold statement
✅ Use specific numbers, data points, and real examples
✅ Tell compelling stories with clear lessons learned
✅ Provide actionable takeaways people can implement immediately
✅ End with thought-provoking questions that spark debate
✅ Use line breaks and formatting for easy mobile reading
✅ Include relevant but natural hashtags (4-6 max)
✅ Sound authentic and personal, not corporate or generic

PSYCHOLOGICAL TRIGGERS TO USE:
• Social proof ("After analyzing 1000+ successful professionals...")
• Scarcity ("The strategy 95% of people miss...")
• Authority ("Here's what I learned from 15 years in the industry...")
• Curiosity ("The mistake that changed everything...")
• Controversy ("Unpopular opinion: Most career advice is wrong...")

ENGAGEMENT PATTERNS:
• Start with a hook that makes people stop scrolling
• Use "you" to make it personal and direct
• Share specific examples and case studies
• Include surprising insights or contrarian views
• End with a question that encourages comments

Current trends: AI impact, remote work evolution, career pivoting, leadership in uncertainty, digital transformation.`;

    const lengthSpecs = {
      short: "250-400 words - punchy and direct with clear value",
      medium: "500-700 words - comprehensive with examples and actionable insights", 
      long: "800-1200 words - in-depth analysis with multiple examples and frameworks"
    };

    const userPrompt = `Create a high-performing LinkedIn post about "${prompt}" with these specifications:

REQUIREMENTS:
• Tone: ${tone}
• Length: ${lengthSpecs[length]}
• Content Focus: ${contentType}
• Hook: Start with an attention-grabbing first line that makes people stop scrolling
• Structure: Use short paragraphs (1-2 sentences) and line breaks for mobile readability
• Value: Provide specific, actionable insights that people can use immediately
• Engagement: End with a question that encourages meaningful comments
• Hashtags: Include 4-6 relevant, natural hashtags

SPECIFIC INSTRUCTIONS:
- Make it feel authentic and personal, not like corporate marketing
- Include specific examples, numbers, or data points where relevant
- Use storytelling elements to make it memorable and relatable
- Ensure every sentence adds value or advances the narrative
- Make it scroll-stopping content that people want to save and share
- Address current challenges professionals face in 2025

Focus on providing real value that helps people grow professionally or personally.`;

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
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 1000 : 1500,
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

    // Try OpenAI with latest model
    if (openaiKey) {
      try {
        console.log('Attempting content generation with OpenAI...');
        
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
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 1000 : 1500,
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
            console.log('Successfully generated content with OpenAI');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4o',
              quality: 'premium' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, trying Anthropic:', error.message);
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
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 1000 : 1500,
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
    const fallbackContent = generateHighQualityContent(prompt, tone, length, contentType);
    
    return new Response(JSON.stringify({ 
      content: fallbackContent, 
      source: 'enhanced_fallback',
      quality: 'good',
      note: 'Generated using professional templates. For premium AI content, add GROQ_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in Supabase Edge Function Secrets.'
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

// Enhanced fallback content generation with better quality
function generateHighQualityContent(prompt: string, tone: string, length: string, contentType: string): string {
  const hooks = [
    `Here's the truth about ${prompt.toLowerCase()} that most professionals miss:`,
    `After working with 500+ professionals on ${prompt.toLowerCase()}, I've discovered something crucial:`,
    `The biggest mistake I see with ${prompt.toLowerCase()}? Let me break it down:`,
    `Everyone talks about ${prompt.toLowerCase()}, but nobody mentions this game-changing approach:`,
    `3 years ago, I struggled with ${prompt.toLowerCase()}. Here's what changed everything:`
  ];

  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  const frameworks = [
    `The 3-Step Framework for ${prompt}:`,
    `Here's my proven approach to ${prompt}:`,
    `The strategy that works for ${prompt}:`,
    `My battle-tested method for ${prompt}:`
  ];

  const framework = frameworks[Math.floor(Math.random() * frameworks.length)];

  const actionItems = [
    `Start by auditing your current approach to ${prompt.toLowerCase()}`,
    `Focus on one aspect of ${prompt.toLowerCase()} and master it completely`,
    `Track your progress with ${prompt.toLowerCase()} using specific metrics`,
    `Connect with others who have succeeded with ${prompt.toLowerCase()}`,
    `Experiment with different strategies for ${prompt.toLowerCase()}`
  ];

  const insights = [
    `Most people overcomplicate ${prompt.toLowerCase()}. The solution is simpler than you think.`,
    `Success with ${prompt.toLowerCase()} isn't about perfection—it's about consistency.`,
    `The difference between good and great ${prompt.toLowerCase()} lies in the details most people ignore.`,
    `${prompt} becomes easier when you focus on systems, not just outcomes.`
  ];

  const questions = [
    `What's been your biggest challenge with ${prompt.toLowerCase()}?`,
    `How do you approach ${prompt.toLowerCase()} in your industry?`,
    `What would you add to this framework?`,
    `Which of these strategies resonates most with you?`
  ];

  const hashtags = ['#LinkedIn2025', '#ProfessionalDevelopment', '#Leadership', '#CareerGrowth', '#Success'];

  const content = `${hook}

${insights[Math.floor(Math.random() * insights.length)]}

${framework}

1️⃣ ${actionItems[0]}
2️⃣ ${actionItems[1]} 
3️⃣ ${actionItems[2]}

The key insight: ${prompt.toLowerCase()} is not about having all the answers—it's about asking the right questions and taking consistent action.

Remember: Progress over perfection, always.

${questions[Math.floor(Math.random() * questions.length)]}

${hashtags.slice(0, 4).join(' ')}`;

  return content;
}
