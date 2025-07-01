
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Enhanced content templates with more variety and industry-specific approaches
const contentFrameworks = {
  professional: [
    "Problem-Solution Framework: I recently encountered {topic} and discovered an unexpected solution...",
    "Trend Analysis: The landscape of {topic} is shifting dramatically. Here's what industry leaders need to know...",
    "Personal Journey: My experience with {topic} taught me three critical lessons that transformed my approach...",
    "Data-Driven Insight: After analyzing patterns in {topic}, I found surprising correlations that changed everything...",
    "Contrarian View: While everyone talks about {topic} one way, I've found a completely different perspective that works better...",
    "Case Study Approach: A recent project involving {topic} revealed insights that could benefit every professional in our field...",
    "Future Prediction: Based on current trends in {topic}, here's what I predict will happen in the next 12 months...",
    "Myth-Busting: Let's debunk the biggest misconception about {topic} that's holding professionals back..."
  ],
  casual: [
    "Story-Driven: Here's something interesting that happened to me with {topic} - and what it taught me...",
    "Behind-the-Scenes: Let me pull back the curtain on {topic} and show you what really happens...",
    "Honest Confession: I used to completely misunderstand {topic} until this eye-opening experience...",
    "Quick Win: Discovered a simple hack related to {topic} that saves me hours every week...",
    "Lesson Learned: Made a costly mistake with {topic} - here's how you can avoid it...",
    "Surprising Discovery: Was researching {topic} and stumbled upon something that blew my mind...",
    "Real Talk: Let's have an honest conversation about {topic} and what nobody wants to admit...",
    "Game Changer: This one insight about {topic} completely transformed how I approach my work..."
  ],
  inspirational: [
    "Transformation Story: How embracing {topic} changed not just my career, but my entire perspective...",
    "Overcome Challenge: The biggest obstacle I faced with {topic} became my greatest strength - here's how...",
    "Vision Casting: Imagine a world where {topic} is accessible to everyone - here's how we get there...",
    "Breaking Barriers: Society tells us {topic} is only for certain people. I'm here to prove that wrong...",
    "Rise Above: When everyone said {topic} was impossible, one person proved them wrong. That person could be you...",
    "Purpose-Driven: How finding my 'why' in {topic} led to unprecedented success and fulfillment...",
    "Legacy Building: What if your approach to {topic} could inspire the next generation of leaders?...",
    "Mindset Shift: The day I stopped seeing {topic} as a challenge and started seeing it as an opportunity..."
  ]
};

const industryInsights = {
  technology: "emerging tech trends, digital transformation, innovation cycles",
  business: "market dynamics, strategic planning, operational excellence",
  marketing: "consumer behavior, brand building, digital strategies",
  leadership: "team development, organizational culture, decision-making",
  career: "professional growth, skill development, networking strategies",
  entrepreneurship: "startup challenges, business validation, scaling strategies",
  finance: "market analysis, investment strategies, economic trends",
  healthcare: "patient care, medical innovation, healthcare systems"
};

const getEnhancedPrompt = (prompt: string, tone: string, length: string) => {
  const frameworks = contentFrameworks[tone as keyof typeof contentFrameworks] || contentFrameworks.professional;
  const randomFramework = frameworks[Math.floor(Math.random() * frameworks.length)];
  const enhancedFramework = randomFramework.replace('{topic}', prompt);
  
  const lengthGuide = {
    short: "Write 150-250 words. Be concise but impactful.",
    medium: "Write 300-500 words. Provide substantial value with detailed insights.",
    long: "Write 600-900 words. Create comprehensive, in-depth content with multiple perspectives and actionable takeaways."
  };

  return `You are an expert LinkedIn content creator and thought leader. Create highly engaging, original content following this framework: "${enhancedFramework}"

CONTENT REQUIREMENTS:
- ${lengthGuide[length as keyof typeof lengthGuide]}
- Write in a ${tone} tone that feels authentic and conversational
- Include specific, actionable insights (not generic advice)
- Add relevant statistics, examples, or personal anecdotes when appropriate
- Structure with clear paragraphs and smooth flow
- End with an engaging question or call-to-action
- Include 3-5 strategic hashtags that are specific to the topic
- Make it feel personal and genuine, not corporate or sales-y
- Focus on providing real value that readers can immediately apply

AVOID:
- Generic motivational quotes
- Overly formal corporate speak
- Repetitive content patterns
- Vague statements without substance
- Self-promotional content

Topic: ${prompt}

Create content that would genuinely help and engage your professional network.`;
};

const generateFallbackContent = (prompt: string, tone: string, length: string) => {
  const insights = [
    `The evolution of ${prompt} is reshaping how we approach professional challenges. Here's what I've learned from recent industry developments:`,
    `After extensive research into ${prompt}, I've identified three key factors that separate successful professionals from the rest:`,
    `The misconceptions about ${prompt} are costing professionals valuable opportunities. Let me share a different perspective:`,
    `My recent deep-dive into ${prompt} revealed surprising patterns that could transform your approach:`,
    `The future of ${prompt} isn't what most people expect. Based on current trends, here's what's really coming:`
  ];

  const actionables = [
    "Focus on building systems rather than just setting goals",
    "Prioritize learning from adjacent industries and cross-functional insights",
    "Develop a contrarian thesis and test it with small experiments",
    "Create feedback loops that help you iterate and improve continuously",
    "Build strategic relationships before you need them",
    "Document your lessons learned to compound knowledge over time",
    "Stay curious about why conventional wisdom might be wrong",
    "Invest time in understanding the 'why' behind successful patterns"
  ];

  const hashtags = [
    "#ProfessionalGrowth #Leadership #Innovation #Strategy #CareerDevelopment",
    "#ThoughtLeadership #BusinessStrategy #ProfessionalDevelopment #Innovation #Growth",
    "#CareerAdvice #Leadership #ProfessionalInsights #SuccessStrategy #WorkSmarter",
    "#BusinessInnovation #ProfessionalSkills #LeadershipDevelopment #StrategyExecution #GrowthMindset",
    "#IndustryInsights #ProfessionalExcellence #CareerStrategy #BusinessDevelopment #Leadership"
  ];

  const randomInsight = insights[Math.floor(Math.random() * insights.length)];
  const randomActionables = actionables.sort(() => 0.5 - Math.random()).slice(0, 4);
  const randomHashtags = hashtags[Math.floor(Math.random() * hashtags.length)];

  const baseContent = `${randomInsight}

${randomActionables.map((item, index) => `${index + 1}. ${item}`).join('\n')}

The professionals who thrive in today's environment aren't just adapting to change—they're anticipating it and positioning themselves accordingly.

What's your experience with ${prompt}? I'd love to hear your insights in the comments.

${randomHashtags}`;

  // Adjust length based on requirement
  if (length === 'long') {
    return baseContent + `

🔍 Key Takeaway: The most successful professionals I know don't just consume information—they synthesize it, experiment with it, and share their learnings with others.

This creates a virtuous cycle of continuous improvement that compounds over time. Every challenge becomes a learning opportunity, every setback becomes valuable data.

The question isn't whether change will happen in your industry—it's whether you'll be ready when it does.`;
  } else if (length === 'short') {
    return `${randomInsight}

Quick insights:
• ${randomActionables[0]}
• ${randomActionables[1]}
• ${randomActionables[2]}

What's your take on ${prompt}? Share your thoughts below!

${randomHashtags}`;
  }

  return baseContent;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, tone = 'professional', length = 'medium', type = 'content' } = await req.json();
    
    console.log('Enhanced content generation request:', { prompt, tone, length, type });
    console.log('Available APIs:', { 
      anthropic: !!ANTHROPIC_API_KEY, 
      openai: !!OPENAI_API_KEY 
    });

    let generatedContent = '';

    // Try Anthropic Claude first with enhanced prompts
    if (ANTHROPIC_API_KEY) {
      try {
        console.log('Attempting enhanced generation with Claude...');
        
        const enhancedPrompt = getEnhancedPrompt(prompt, tone, length);
        const maxTokens = length === 'short' ? 400 : length === 'medium' ? 800 : 1200;
        
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: maxTokens,
            messages: [
              { role: 'user', content: enhancedPrompt }
            ],
            temperature: 0.9 // Higher creativity
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          generatedContent = claudeData.content[0]?.text || '';
          console.log('Successfully generated enhanced content with Claude');
        } else {
          const errorData = await claudeResponse.text();
          console.log('Claude failed:', claudeResponse.status, errorData);
        }
      } catch (error) {
        console.log('Claude error:', error.message);
      }
    }

    // Try OpenAI with enhanced prompts if Claude failed
    if (!generatedContent && OPENAI_API_KEY) {
      try {
        console.log('Attempting enhanced generation with OpenAI...');
        
        const enhancedPrompt = getEnhancedPrompt(prompt, tone, length);
        const maxTokens = length === 'short' ? 500 : length === 'medium' ? 900 : 1300;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'user', content: enhancedPrompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.8,
            presence_penalty: 0.7,
            frequency_penalty: 0.6,
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          generatedContent = openaiData.choices[0]?.message?.content || '';
          console.log('Successfully generated enhanced content with OpenAI');
        } else {
          const errorData = await openaiResponse.text();
          console.log('OpenAI failed:', openaiResponse.status, errorData);
        }
      } catch (error) {
        console.log('OpenAI error:', error.message);
      }
    }

    // Enhanced fallback content if all AI services fail
    if (!generatedContent) {
      console.log('All AI services failed, using enhanced fallback content');
      generatedContent = generateFallbackContent(prompt, tone, length);
    }

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced generate-content function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Content generation service temporarily unavailable. Please try again.',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
