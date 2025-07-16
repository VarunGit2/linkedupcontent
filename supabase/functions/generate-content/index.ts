
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
    const { 
      prompt, 
      type = 'content',
      writingTone = 'professional',
      contentLength = 'medium',
      contentFocus = 'general',
      industry = '',
      audience = '',
      interests = ''
    } = await req.json();
    
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Please provide a topic for content generation' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating LinkedIn content with parameters:', {
      prompt: prompt.substring(0, 50) + '...',
      writingTone,
      contentLength,
      contentFocus,
      industry,
      audience
    });

    // Try Groq first with enhanced prompting
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq Llama 3.3 70B for premium content generation...');
        
        const systemPrompt = getSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests);

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
            max_tokens: getMaxTokens(contentLength),
            temperature: getTempByTone(writingTone),
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.3,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 50) {
            console.log('High-quality content generated with Groq Llama 70B');
            return new Response(JSON.stringify({ 
              content, 
              source: 'groq_llama_70b',
              quality: 'premium',
              parameters: { writingTone, contentLength, contentFocus }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Groq failed, trying OpenAI:', error.message);
      }
    }

    // Try OpenAI as backup
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Using OpenAI GPT-4.1 as backup...');
        
        const systemPrompt = getSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests);

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: getMaxTokens(contentLength),
            temperature: getTempByTone(writingTone),
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 50) {
            console.log('Quality content generated with OpenAI GPT-4.1');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4.1',
              quality: 'good',
              parameters: { writingTone, contentLength, contentFocus }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, using enhanced template:', error.message);
      }
    }

    // Enhanced fallback with parameter consideration
    console.log('Using parameter-aware template system');
    const content = generateParameterAwareContent(prompt, type, writingTone, contentLength, contentFocus, industry, audience);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'enhanced_template',
      quality: 'good',
      parameters: { writingTone, contentLength, contentFocus }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemPrompt(type: string, tone: string, length: string, focus: string): string {
  const basePrompt = `You are an elite LinkedIn content strategist and viral copywriter. You create content that stops the scroll and drives massive engagement.`;
  
  const toneInstructions = {
    professional: "Use professional, authoritative language while remaining approachable. Focus on expertise and credibility.",
    casual: "Write in a conversational, friendly tone. Use everyday language and personal anecdotes.",
    inspirational: "Create uplifting, motivational content that inspires action. Use emotional storytelling.",
    educational: "Focus on teaching and providing value. Use clear explanations and actionable insights.",
    humorous: "Add appropriate humor and wit while maintaining professionalism. Use clever observations."
  };

  const lengthInstructions = {
    short: "Keep content concise - 1-2 paragraphs maximum. Get straight to the point.",
    medium: "Create moderate length content - 3-4 paragraphs with good flow.",
    long: "Develop comprehensive content - 5+ paragraphs with deep insights and examples."
  };

  const focusInstructions = {
    'thought-leadership': "Position as industry thought leader. Share unique perspectives and forward-thinking insights.",
    'personal-story': "Focus on personal experiences and lessons learned. Make it relatable and authentic.",
    'industry-insights': "Share professional knowledge and industry-specific expertise.",
    'tips-advice': "Provide actionable advice and practical tips that readers can immediately apply.",
    'general': "Create engaging professional content that appeals to a broad audience."
  };

  return `${basePrompt}

TONE: ${toneInstructions[tone] || toneInstructions.professional}

LENGTH: ${lengthInstructions[length] || lengthInstructions.medium}

FOCUS: ${focusInstructions[focus] || focusInstructions.general}

VIRAL CONTENT PRINCIPLES:
- Start with a hook that stops the scroll (question, bold statement, personal story)
- Use psychological triggers (curiosity, fear of missing out, social proof)
- Include specific numbers and data points
- Create emotional connection through storytelling
- End with a clear call-to-action or discussion prompt
- Use short paragraphs and bullet points for readability
- Include relevant emojis strategically (but not too many)

LINKEDIN BEST PRACTICES:
- First 2 lines are crucial - make them count
- Use line breaks for easy mobile reading
- Include industry-specific terminology when relevant
- Ask engaging questions to drive comments
- Share genuine insights from experience`;
}

function buildUserPrompt(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, interests: string): string {
  let userPrompt = '';
  
  if (type === 'ideas') {
    userPrompt = `Generate exactly 8 highly engaging LinkedIn post ideas for: ${prompt}

REQUIREMENTS:
- Each idea should be 1-2 sentences
- Make them scroll-stopping and engagement-driving
- Include specific angles and unique perspectives
- Target ${audience || 'professionals'} in ${industry || 'the industry'}
- Consider interests: ${interests || 'general professional development'}

Return as numbered list (1-8).`;
  } else {
    userPrompt = `Create a viral LinkedIn post about: ${prompt}

SPECIFIC REQUIREMENTS:
- Target audience: ${audience || 'professionals'}
- Industry context: ${industry || 'general business'}
- User interests: ${interests || 'professional development'}
- Writing tone: ${tone}
- Content length: ${length}
- Content focus: ${focus}

The post should be optimized for LinkedIn's algorithm and designed to drive maximum engagement.`;
  }

  return userPrompt;
}

function getMaxTokens(length: string): number {
  switch (length) {
    case 'short': return 300;
    case 'medium': return 600;
    case 'long': return 1000;
    default: return 600;
  }
}

function getTempByTone(tone: string): number {
  switch (tone) {
    case 'professional': return 0.7;
    case 'casual': return 0.8;
    case 'inspirational': return 0.9;
    case 'educational': return 0.6;
    case 'humorous': return 0.8;
    default: return 0.7;
  }
}

function generateParameterAwareContent(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string): string {
  const hooks = {
    professional: [
      "Here's what I've learned about",
      "The truth about",
      "Why most professionals struggle with",
      "3 critical mistakes I see in"
    ],
    casual: [
      "Let me tell you about",
      "Here's something interesting:",
      "I just realized something about",
      "Want to know a secret about"
    ],
    inspirational: [
      "Your breakthrough moment is closer than you think.",
      "What if I told you that",
      "The most successful people I know",
      "Here's how you can transform"
    ]
  };

  const selectedHooks = hooks[tone] || hooks.professional;
  const hook = selectedHooks[Math.floor(Math.random() * selectedHooks.length)];

  if (type === 'ideas') {
    return [
      `1. ${hook} ${prompt} - and why it matters more than ever in 2025`,
      `2. The ${prompt} mistake that's costing professionals their careers`,
      `3. 5 ${prompt} trends that will dominate this year (prepare now)`,
      `4. Why traditional ${prompt} advice is outdated (and what works instead)`,
      `5. How I transformed my approach to ${prompt} and doubled my results`,
      `6. The uncomfortable truth about ${prompt} that nobody talks about`,
      `7. ${prompt}: What the top 1% do differently (and you can too)`,
      `8. The future of ${prompt} - predictions that will surprise you`
    ].join('\n');
  }

  // Generate full content based on length
  const paragraphs = [];
  paragraphs.push(`${hook} ${prompt}...`);
  
  if (length === 'medium' || length === 'long') {
    paragraphs.push(`Here's what I've discovered after years in ${industry || 'the industry'}:`);
    paragraphs.push(`→ The key insight that changed everything\n→ Why this matters for ${audience || 'professionals'}\n→ How you can apply this immediately`);
  }
  
  if (length === 'long') {
    paragraphs.push(`The data speaks for itself - and the results are remarkable.`);
    paragraphs.push(`What's your experience with ${prompt}? Share your thoughts below. 👇`);
  }

  return paragraphs.join('\n\n');
}
