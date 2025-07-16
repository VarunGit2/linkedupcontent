
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
      interests = '',
      ideaCount = 6  // Allow customizable idea count
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
      audience,
      type,
      ideaCount
    });

    // Try Groq first with enhanced prompting
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq Llama 3.3 70B for premium content generation...');
        
        const systemPrompt = getSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests, ideaCount);

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
            max_tokens: getMaxTokens(contentLength, type),
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
              parameters: { writingTone, contentLength, contentFocus, ideaCount }
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
        const userPrompt = buildUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests, ideaCount);

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
            max_tokens: getMaxTokens(contentLength, type),
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
              parameters: { writingTone, contentLength, contentFocus, ideaCount }
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
    const content = generateParameterAwareContent(prompt, type, writingTone, contentLength, contentFocus, industry, audience, ideaCount);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'enhanced_template',
      quality: 'good',
      parameters: { writingTone, contentLength, contentFocus, ideaCount }
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
  const basePrompt = `You are an elite LinkedIn content strategist and viral copywriter specializing in creating scroll-stopping, engagement-driving content.`;
  
  const toneInstructions = {
    professional: "Write with authority and credibility. Use industry terminology appropriately while remaining accessible.",
    casual: "Use conversational, friendly language. Include personal touches and relatable examples.",
    inspirational: "Create motivational content that inspires action. Use emotional storytelling and powerful metaphors.",
    educational: "Focus on teaching valuable skills. Use clear explanations with actionable takeaways.",
    humorous: "Add wit and clever observations while maintaining professionalism. Use light humor strategically."
  };

  const lengthInstructions = {
    short: "Keep content concise and punchy - 1-2 paragraphs maximum. Every word must count.",
    medium: "Create well-structured content - 3-4 paragraphs with clear flow and compelling narrative.",
    long: "Develop comprehensive, in-depth content - 5+ paragraphs with detailed insights and examples."
  };

  const focusInstructions = {
    'thought-leadership': "Position as an industry visionary. Share unique perspectives and forward-thinking insights.",
    'personal-story': "Focus on authentic personal experiences. Make it relatable and emotionally resonant.",
    'industry-insights': "Share deep professional knowledge and industry-specific expertise with authority.",
    'tips-advice': "Provide immediately actionable advice that readers can implement today.",
    'general': "Create broadly appealing professional content that resonates across industries."
  };

  return `${basePrompt}

TONE: ${toneInstructions[tone] || toneInstructions.professional}

LENGTH: ${lengthInstructions[length] || lengthInstructions.medium}

FOCUS: ${focusInstructions[focus] || focusInstructions.general}

VIRAL CONTENT PRINCIPLES:
• Hook readers in the first 2 lines with curiosity, controversy, or compelling stats
• Use psychological triggers: scarcity, social proof, fear of missing out
• Include specific numbers, percentages, and concrete examples
• Tell stories that create emotional connection
• Use strategic line breaks for mobile readability
• End with clear call-to-action that drives engagement
• Include relevant emojis (2-3 maximum) for visual appeal

LINKEDIN ALGORITHM OPTIMIZATION:
• Front-load the most engaging content in first 125 characters
• Use industry-relevant keywords naturally
• Structure for easy scanning with bullet points or numbered lists
• Ask engaging questions to drive comments and shares
• Create content that encourages saves and reshares`;
}

function buildUserPrompt(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, interests: string, ideaCount: number): string {
  let userPrompt = '';
  
  if (type === 'ideas') {
    userPrompt = `Generate exactly ${ideaCount} highly viral LinkedIn post ideas about: ${prompt}

CONTEXT:
• Industry: ${industry || 'general business'}
• Target audience: ${audience || 'professionals'}  
• Key interests: ${interests || 'professional development'}
• Tone: ${tone}
• Focus: ${focus}

REQUIREMENTS:
• Each idea should be 1-2 compelling sentences
• Make them scroll-stopping and engagement-driving
• Include specific angles and unique perspectives
• Ensure each idea is distinctly different
• Target the specified audience and industry
• Make them actionable and thought-provoking

Format as a clean numbered list (1-${ideaCount}).`;
  } else {
    userPrompt = `Create a viral LinkedIn post about: ${prompt}

SPECIFICATIONS:
• Target audience: ${audience || 'professionals'}
• Industry context: ${industry || 'general business'}  
• User interests: ${interests || 'professional development'}
• Writing tone: ${tone}
• Content length: ${length}
• Content focus: ${focus}

REQUIREMENTS:
• Optimize for LinkedIn's algorithm and maximum engagement
• Make it scroll-stopping and shareable
• Include specific, actionable insights
• Use the exact tone and length specified
• Tailor content to the target audience and industry
• End with an engaging question or call-to-action`;
  }

  return userPrompt;
}

function getMaxTokens(length: string, type: string = 'content'): number {
  if (type === 'ideas') {
    return 800; // More tokens for multiple ideas
  }
  
  switch (length) {
    case 'short': return 400;
    case 'medium': return 700;
    case 'long': return 1200;
    default: return 700;
  }
}

function getTempByTone(tone: string): number {
  switch (tone) {
    case 'professional': return 0.7;
    case 'casual': return 0.8;
    case 'inspirational': return 0.9;
    case 'educational': return 0.6;
    case 'humorous': return 0.85;
    default: return 0.7;
  }
}

function generateParameterAwareContent(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, ideaCount: number): string {
  const hooks = {
    professional: [
      "Industry analysis reveals",
      "Data shows that",
      "Research indicates", 
      "Studies confirm"
    ],
    casual: [
      "Here's what I've learned",
      "Let me share something interesting",
      "I just discovered",
      "Here's a reality check"
    ],
    inspirational: [
      "Your breakthrough is closer than you think",
      "What if I told you",
      "The most successful people know this secret",
      "Transform your approach with this insight"
    ]
  };

  const selectedHooks = hooks[tone] || hooks.professional;
  const hook = selectedHooks[Math.floor(Math.random() * selectedHooks.length)];

  if (type === 'ideas') {
    const ideas = [];
    for (let i = 1; i <= ideaCount; i++) {
      ideas.push(`${i}. ${hook}: ${prompt} - and why ${audience || 'professionals'} in ${industry || 'your industry'} need to pay attention`);
    }
    return ideas.join('\n');
  }

  // Generate full content based on parameters
  const paragraphs = [];
  paragraphs.push(`${hook} ${prompt}...`);
  
  if (length === 'medium' || length === 'long') {
    paragraphs.push(`Here's what ${audience || 'professionals'} in ${industry || 'the industry'} need to know:`);
    paragraphs.push(`→ The critical insight that changes everything\n→ Why this matters for your career\n→ How to apply this immediately`);
  }
  
  if (length === 'long') {
    paragraphs.push(`The data speaks for itself - and the results are remarkable.`);
    paragraphs.push(`What's your experience with ${prompt}? Share your thoughts below. 👇`);
  }

  return paragraphs.join('\n\n');
}
