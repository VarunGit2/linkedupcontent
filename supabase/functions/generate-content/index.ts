
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
      ideaCount = 6
    } = await req.json();
    
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Please provide a topic for content generation' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating LinkedIn content with enhanced parameters:', {
      prompt: prompt.substring(0, 50) + '...',
      writingTone,
      contentLength,
      contentFocus,
      industry,
      audience,
      type,
      ideaCount
    });

    // Try Groq first with much better prompting
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq Llama 3.3 70B with enhanced LinkedIn prompting...');
        
        const systemPrompt = getEnhancedSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildEnhancedUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests, ideaCount);

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
            max_tokens: getOptimalTokens(contentLength, type),
            temperature: getOptimalTemperature(writingTone),
            top_p: 0.95,
            frequency_penalty: 0.6,
            presence_penalty: 0.4,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('Premium LinkedIn content generated with Groq');
            
            // Update content stats
            await updateContentStats(type);
            
            return new Response(JSON.stringify({ 
              content, 
              source: 'groq_llama_70b_enhanced',
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

    // Try OpenAI with enhanced prompting
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Using OpenAI GPT-4o-mini with enhanced prompting...');
        
        const systemPrompt = getEnhancedSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildEnhancedUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests, ideaCount);

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: getOptimalTokens(contentLength, type),
            temperature: getOptimalTemperature(writingTone),
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('High-quality LinkedIn content generated with OpenAI');
            
            // Update content stats
            await updateContentStats(type);
            
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4o_mini_enhanced',
              quality: 'high',
              parameters: { writingTone, contentLength, contentFocus, ideaCount }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, using premium template system:', error.message);
      }
    }

    // Enhanced premium fallback
    console.log('Using premium template system with advanced parameters');
    const content = generatePremiumContent(prompt, type, writingTone, contentLength, contentFocus, industry, audience, ideaCount);
    
    // Update content stats
    await updateContentStats(type);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'premium_template_system',
      quality: 'good',
      parameters: { writingTone, contentLength, contentFocus, ideaCount }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced content generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation failed. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getEnhancedSystemPrompt(type: string, tone: string, length: string, focus: string): string {
  const basePrompt = `You are an elite LinkedIn content strategist with 10+ years of experience creating viral, high-engagement content. You understand LinkedIn's algorithm deeply and know exactly what makes content go viral.`;
  
  const toneGuides = {
    professional: "Write with executive presence and thought leadership authority. Use data-driven insights and industry terminology that demonstrates deep expertise.",
    casual: "Write conversationally like you're talking to a trusted colleague. Use relatable examples, personal anecdotes, and approachable language while maintaining credibility.",
    inspirational: "Write to motivate and inspire action. Use powerful storytelling, emotional triggers, and transformation narratives that resonate deeply.",
    educational: "Write as a master teacher. Break down complex concepts into digestible insights with clear takeaways and actionable advice.",
    humorous: "Inject personality with clever observations and wit while staying professional. Use humor to make serious topics more engaging and memorable."
  };

  const lengthGuides = {
    short: "Create punchy, high-impact content (150-250 words). Every sentence must pack a punch. Use short paragraphs and strong hooks.",
    medium: "Develop comprehensive posts (500-800 words) with clear structure, compelling narratives, and detailed insights that provide real value.",
    long: "Create in-depth thought leadership pieces (1000+ words) with multiple sections, detailed analysis, examples, and comprehensive coverage."
  };

  const focusGuides = {
    'thought-leadership': "Position as an industry visionary sharing unique insights and forward-thinking perspectives that others haven't considered.",
    'personal-story': "Craft authentic, vulnerable stories that create emotional connection while delivering professional insights.",
    'industry-insights': "Share insider knowledge and deep industry analysis that demonstrates expertise and provides unique value.",
    'tips-advice': "Provide immediately actionable, tested strategies that readers can implement right away for real results.",
    'general': "Create broadly appealing professional content that resonates across industries while staying relevant and valuable."
  };

  return `${basePrompt}

TONE MASTERY: ${toneGuides[tone] || toneGuides.professional}

LENGTH OPTIMIZATION: ${lengthGuides[length] || lengthGuides.medium}

FOCUS STRATEGY: ${focusGuides[focus] || focusGuides.general}

VIRAL CONTENT FORMULA:
🎯 HOOK (First 2 lines): Start with a curiosity gap, controversial take, or surprising statistic
📖 STORY: Use the STAR method (Situation, Task, Action, Result) for narratives
💡 INSIGHT: Provide unique perspective or counterintuitive wisdom
🔥 VALUE: Give practical, actionable takeaways
❓ ENGAGEMENT: End with thought-provoking questions that drive comments

LINKEDIN ALGORITHM HACKS:
• Front-load engagement in first 125 characters (preview text)
• Use native video/carousel formats when possible
• Write for mobile-first consumption
• Include 3-5 relevant hashtags naturally
• Structure with line breaks every 1-2 sentences
• Use emojis strategically (2-4 maximum)
• Create "scroll-stopping" visual appeal
• End with strong CTA for comments/shares

PSYCHOLOGICAL TRIGGERS:
• Social proof ("thousands of professionals do this...")
• Scarcity ("only 5% of leaders know this...")
• Authority ("in my 15 years of experience...")
• Reciprocity ("here's exactly how I did it...")
• Pattern interrupts (unexpected angles)`;
}

function buildEnhancedUserPrompt(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, interests: string, ideaCount: number): string {
  let userPrompt = '';
  
  if (type === 'ideas') {
    userPrompt = `Generate exactly ${ideaCount} viral LinkedIn post ideas about: "${prompt}"

CONTEXT & TARGETING:
• Industry: ${industry || 'cross-industry professional'}
• Target audience: ${audience || 'business professionals'}
• Key interests: ${interests || 'career growth and industry insights'}
• Desired tone: ${tone}
• Content focus: ${focus}

REQUIREMENTS FOR EACH IDEA:
• Make each idea distinctly different and unique
• Include specific angles that haven't been overused
• Target the exact audience and industry specified
• Ensure viral potential with strong hooks
• Make them actionable and thought-provoking
• Include the content type (story, tips, insights, etc.)

OUTPUT FORMAT:
1. [Content Type] - [Hook/Angle] - Brief description of the unique take
2. [Content Type] - [Hook/Angle] - Brief description of the unique take
...continue for all ${ideaCount} ideas

CONTENT TYPES TO VARY:
• Personal story with lesson
• Industry trend analysis  
• Contrarian take on common advice
• Behind-the-scenes insight
• Tactical how-to guide
• Prediction or future insight
• Mistake/failure lesson
• Success framework
• Myth-busting post
• Resource compilation`;
  } else {
    userPrompt = `Create a viral LinkedIn post about: "${prompt}"

TARGETING SPECIFICATIONS:
• Primary audience: ${audience || 'business professionals'}
• Industry context: ${industry || 'cross-industry'}
• User interests: ${interests || 'professional development'}
• Writing tone: ${tone}
• Content length: ${length}
• Content focus: ${focus}

SPECIFIC REQUIREMENTS:
• Optimize for LinkedIn's algorithm and maximum engagement
• Include industry-specific insights if industry is specified
• Tailor language and examples to the target audience
• Use the exact tone and length specified
• Include relevant hashtags (3-5 maximum)
• End with engaging questions or clear CTA
• Structure for mobile readability
• Include specific, actionable insights
• Use data points or statistics if relevant
• Create emotional connection while delivering value

SUCCESS METRICS TO TARGET:
• High comment engagement (controversial or thought-provoking angles)
• Strong share-ability (valuable insights worth sharing)
• Save-worthy content (reference material people want to keep)
• Follow-worthy expertise (demonstrates thought leadership)`;
  }

  return userPrompt;
}

function getOptimalTokens(length: string, type: string = 'content'): number {
  if (type === 'ideas') {
    return 1000;
  }
  
  switch (length) {
    case 'short': return 600;
    case 'medium': return 1200;
    case 'long': return 2000;
    default: return 1200;
  }
}

function getOptimalTemperature(tone: string): number {
  switch (tone) {
    case 'professional': return 0.7;
    case 'casual': return 0.8;
    case 'inspirational': return 0.9;
    case 'educational': return 0.6;
    case 'humorous': return 0.85;
    default: return 0.75;
  }
}

function generatePremiumContent(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, ideaCount: number): string {
  const hooks = {
    professional: [
      "Industry analysis reveals a startling truth:",
      "After analyzing 10,000+ LinkedIn posts, here's what I discovered:",
      "The data doesn't lie - here's what successful professionals do differently:",
      "15 years in the industry taught me this counterintuitive lesson:"
    ],
    casual: [
      "Okay, let me be real with you for a second...",
      "Here's something I wish someone had told me earlier:",
      "I used to think this was nonsense until I tried it myself:",
      "Plot twist: everything I thought I knew about this was wrong."
    ],
    inspirational: [
      "Your biggest breakthrough is hiding in plain sight.",
      "What if I told you that your 'failure' is actually your superpower?",
      "The most successful people I know all share this one trait:",
      "Stop waiting for permission. Here's why you're already ready:"
    ]
  };

  const selectedHooks = hooks[tone] || hooks.professional;
  const hook = selectedHooks[Math.floor(Math.random() * selectedHooks.length)];

  if (type === 'ideas') {
    const ideas = [];
    const contentTypes = [
      "Personal Story", "Industry Analysis", "Contrarian Take", "How-to Guide", 
      "Behind-the-Scenes", "Prediction", "Myth-Busting", "Success Framework"
    ];
    
    for (let i = 1; i <= ideaCount; i++) {
      const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
      ideas.push(`${i}. [${contentType}] - ${hook} ${prompt} and why ${audience || 'professionals'} in ${industry || 'your industry'} need to understand this shift`);
    }
    return ideas.join('\n');
  }

  // Generate content based on length parameter with much better structure
  const sections = [];
  
  // Hook
  sections.push(`${hook} ${prompt}.`);
  
  if (length === 'short') {
    sections.push(`Here's the reality: ${audience || 'professionals'} in ${industry || 'the industry'} are missing a critical opportunity.`);
    sections.push(`The solution? [Specific actionable advice related to the prompt]`);
    sections.push(`Try this approach and watch what happens. 🚀\n\nWhat's your experience with ${prompt}? Drop your thoughts below! 👇`);
  } else if (length === 'medium') {
    sections.push(`Here's what ${audience || 'professionals'} in ${industry || 'the industry'} need to understand:`);
    sections.push(`🎯 The Problem:\nMost people approach ${prompt} completely wrong. They focus on [common mistake] instead of [better approach].`);
    sections.push(`✅ The Solution:\n• Step 1: [Specific action]\n• Step 2: [Specific action]\n• Step 3: [Specific action]`);
    sections.push(`📈 The Results:\nWhen you implement this framework correctly, you'll see [specific beneficial outcome] within [timeframe].`);
    sections.push(`I've helped hundreds of ${audience || 'professionals'} transform their approach to ${prompt}. The pattern is clear: those who follow this system see 3x better results.`);
    sections.push(`Ready to level up your approach to ${prompt}?\n\nShare your biggest challenge in the comments below! 👇`);
  } else { // long
    sections.push(`After working with thousands of ${audience || 'professionals'} in ${industry || 'the industry'}, I've identified the exact framework that separates top performers from everyone else when it comes to ${prompt}.`);
    sections.push(`🚨 THE PROBLEM:\nMost people make these critical mistakes:\n• Mistake #1: [Common error]\n• Mistake #2: [Common error]\n• Mistake #3: [Common error]`);
    sections.push(`💡 THE BREAKTHROUGH:\nTop performers do these 5 things differently:\n\n1. [Detailed strategy point]\n2. [Detailed strategy point]\n3. [Detailed strategy point]\n4. [Detailed strategy point]\n5. [Detailed strategy point]`);
    sections.push(`📊 THE DATA:\nI analyzed 500+ case studies and found that ${audience || 'professionals'} who implement this framework see:\n• 40% improvement in [relevant metric]\n• 60% reduction in [relevant problem]\n• 3x faster [relevant outcome]`);
    sections.push(`🎯 THE IMPLEMENTATION:\nStart with step 1 this week. Most people try to do everything at once and fail. Focus on mastering one element before moving to the next.`);
    sections.push(`The bottom line? ${prompt} isn't optional in today's competitive landscape. It's the difference between thriving and just surviving.`);
    sections.push(`What's your experience with ${prompt}? What's worked for you? What challenges are you facing?\n\nLet's discuss in the comments! 👇`);
  }

  return sections.join('\n\n');
}

async function updateContentStats(type: string) {
  // This would normally interact with a database, but for now we'll just log
  console.log(`Content stat updated: ${type} generated`);
}
