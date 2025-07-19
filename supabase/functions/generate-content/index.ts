
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

    console.log('Generating content with parameters:', {
      prompt: prompt.substring(0, 100) + '...',
      type,
      writingTone,
      contentLength,
      industry,
      audience
    });

    // Try Groq first
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq API...');
        
        const systemPrompt = getAdvancedSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildAdvancedUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests, ideaCount);

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
            max_tokens: getTokenLimit(contentLength, type),
            temperature: 0.8,
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.3,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100 && !isLowQualityContent(content, prompt)) {
            console.log('High-quality content generated with Groq');
            return new Response(JSON.stringify({ 
              content, 
              source: 'groq_llama_70b',
              quality: 'premium'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Groq failed, trying OpenAI:', error.message);
      }
    }

    // Try OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Using OpenAI API...');
        
        const systemPrompt = getAdvancedSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildAdvancedUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests, ideaCount);

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
            max_tokens: getTokenLimit(contentLength, type),
            temperature: 0.8,
            frequency_penalty: 0.4,
            presence_penalty: 0.2,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100 && !isLowQualityContent(content, prompt)) {
            console.log('High-quality content generated with OpenAI');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4o_mini',
              quality: 'high'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, using enhanced template system:', error.message);
      }
    }

    // Enhanced fallback system
    console.log('Using enhanced template system');
    const content = generateEnhancedContent(prompt, type, writingTone, contentLength, contentFocus, industry, audience, ideaCount);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'enhanced_template_system',
      quality: 'good'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation failed. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getAdvancedSystemPrompt(type: string, tone: string, length: string, focus: string): string {
  if (type === 'ideas') {
    return `You are an expert LinkedIn content strategist who creates viral, engaging post ideas.

Generate EXACTLY the requested number of LinkedIn post ideas. Each idea must be:
- Specific and actionable (never generic)
- Designed to get comments and engagement 
- Include a clear hook or angle
- 15-30 words describing exactly what the post would cover

Format: Return ONLY a numbered list (1., 2., 3., etc.)

Examples of GOOD ideas:
1. Share the 3 biggest hiring mistakes you made as a first-time manager and what they taught you
2. Break down your exact morning routine that helped you close 40% more deals this quarter
3. Compare remote work productivity tips from 2020 vs 2024 - what actually works now

Examples of BAD ideas (too generic):
- Share productivity tips
- Talk about leadership lessons
- Discuss industry trends

Be specific about what someone would actually write about, not vague topics.`;
  }

  return `You are an expert LinkedIn content creator who writes viral posts.

Write a ${length === 'short' ? '150-250 word' : length === 'medium' ? '400-600 word' : '800+ word'} LinkedIn post with a ${tone} tone.

Structure:
• Strong hook (first line grabs attention)
• Main content with specific examples/data/stories  
• Clear takeaways or actionable advice
• Engaging question/CTA for comments

Requirements:
- Use "I" statements and personal experience when relevant
- Include specific numbers, percentages, or concrete examples
- Add strategic emojis (2-4 max) 
- Break up text with bullet points or numbered lists
- End with a question that invites responses
- Make it feel authentic and conversation-worthy
- Focus on the exact topic provided
- Avoid generic advice - be specific and actionable

Style: ${focus === 'thought-leadership' ? 'Thought leadership with contrarian insights' : 
      focus === 'personal-story' ? 'Personal story with vulnerability and lessons' :
      focus === 'industry-insights' ? 'Data-driven with specific examples' :
      focus === 'tips-advice' ? 'Actionable frameworks with steps' :
      'Professional and engaging with practical value'}`;
}

function buildAdvancedUserPrompt(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, interests: string, ideaCount: number): string {
  if (type === 'ideas') {
    let context = `Topic: ${prompt}`;
    if (industry) context += `\nIndustry: ${industry}`;
    if (audience) context += `\nAudience: ${audience}`;  
    if (interests) context += `\nInterests: ${interests}`;

    return `${context}

Generate ${ideaCount} specific LinkedIn post ideas.

Each idea should describe exactly what someone would write about, not just a vague topic.

Examples:
1. Share the worst career advice you received early on and why it set you back 2 years
2. Break down the exact 4-step process you use to prioritize tasks when everything feels urgent
3. Compare how client expectations have changed from 2020 to 2024 with specific examples`;
  }

  let context = `Topic: ${prompt}`;
  if (industry) context += `\nIndustry: ${industry}`;
  if (audience) context += `\nAudience: ${audience}`;
  if (interests) context += `\nInterests: ${interests}`;

  return `${context}

Write a LinkedIn post about: "${prompt}"

Make it specific, authentic, and engaging. Include real examples or insights, not generic advice.

Focus: ${focus}
Tone: ${tone}  
Length: ${length}

Write the complete post now:`;
}

function isLowQualityContent(content: string, originalPrompt: string): boolean {
  const lowQualityIndicators = [
    'Generate',
    'Here are',
    '[insert',
    '[topic]',
    '[your',
    'Lorem ipsum',
    originalPrompt.length > 50 && content.includes(originalPrompt.substring(0, 50))
  ];
  
  return lowQualityIndicators.some(indicator => 
    indicator === true || (typeof indicator === 'string' && content.includes(indicator))
  );
}

function getTokenLimit(length: string, type: string): number {
  if (type === 'ideas') return 1000;
  
  switch (length) {
    case 'short': return 500;
    case 'medium': return 900;
    case 'long': return 1400;
    default: return 900;
  }
}

function generateEnhancedContent(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, ideaCount: number): string {
  if (type === 'ideas') {
    const ideaTemplates = [
      `The uncomfortable truth about ${prompt} that ${audience || 'professionals'} need to hear`,
      `Why everything you know about ${prompt} is probably wrong`,
      `3 contrarian insights about ${prompt} from someone who's been there`,
      `The hidden costs of ${prompt} that nobody talks about`,
      `How ${prompt} is evolving and what it means for ${industry || 'your industry'}`,
      `A data-driven breakdown of ${prompt} trends in 2024`,
      `Personal story: How ${prompt} changed my perspective on ${industry || 'business'}`,
      `The biggest mistakes people make with ${prompt} (and how to avoid them)`,
      `Unpopular opinion: ${prompt} isn't what you think it is`,
      `Behind the scenes: What ${prompt} really looks like in ${industry || 'practice'}`
    ];

    const selectedIdeas = ideaTemplates.slice(0, ideaCount).map((template, index) => 
      `${index + 1}. ${template} - Share specific examples and actionable insights that challenge conventional thinking`
    );

    return selectedIdeas.join('\n');
  }

  // Enhanced content generation for posts
  const sections = [];
  
  // Hook
  sections.push(`💡 ${getRandomHook()} about ${prompt}:`);
  
  if (length === 'short') {
    sections.push(`After working with dozens of ${audience || 'professionals'} in ${industry || 'various industries'}, I've discovered something that might surprise you.`);
    sections.push(`🎯 The reality: Most people approach ${prompt} completely backwards.`);
    sections.push(`Instead of focusing on [common approach], the smartest ${audience || 'professionals'} focus on [better approach].`);
    sections.push(`This simple shift can 3x your results in just 30 days.`);
    sections.push(`What's your experience with ${prompt}? Share your thoughts below! 👇`);
  } else if (length === 'medium') {
    sections.push(`I've been analyzing ${prompt} trends across ${industry || 'multiple industries'} for months, and the data tells a surprising story.`);
    sections.push(`🚨 The Problem:\nMost ${audience || 'professionals'} are making the same critical mistake with ${prompt}.`);
    sections.push(`They focus on surface-level tactics instead of understanding the underlying principles.`);
    sections.push(`📊 What the Data Shows:`);
    sections.push(`• 73% of ${audience || 'professionals'} approach this incorrectly`);
    sections.push(`• Those who get it right see 4x better outcomes`);
    sections.push(`• The difference isn't talent—it's strategy`);
    sections.push(`✅ The Framework That Actually Works:`);
    sections.push(`1. Start with clear, measurable objectives`);
    sections.push(`2. Focus on leading indicators, not lagging ones`);
    sections.push(`3. Iterate quickly based on real feedback`);
    sections.push(`🚀 The Bottom Line:\n${prompt} isn't about following everyone else's playbook. It's about understanding what drives real results in your specific context.`);
    sections.push(`I've seen this framework transform results for hundreds of ${audience || 'professionals'}.`);
    sections.push(`What's been your biggest challenge with ${prompt}? Let's discuss in the comments! 👇`);
  } else {
    sections.push(`Over the past two years, I've had the opportunity to work with hundreds of ${audience || 'professionals'} across ${industry || 'various industries'} on ${prompt}.`);
    sections.push(`What I've discovered challenges everything most people believe about this topic.`);
    sections.push(`🚨 THE UNCOMFORTABLE TRUTH:\nThe conventional wisdom around ${prompt} is not just wrong—it's actively harmful.`);
    sections.push(`Here's what's really happening:`);
    sections.push(`• Traditional approaches ignore modern realities`);
    sections.push(`• Success metrics are often completely misaligned`);
    sections.push(`• The "best practices" everyone follows aren't actually best`);
    sections.push(`💡 THE BREAKTHROUGH INSIGHT:\nAfter analyzing hundreds of case studies and working directly with top performers, I've identified the key factors that separate the top 10% from everyone else.`);
    sections.push(`🎯 THE NEW FRAMEWORK:`);
    sections.push(`**1. Mindset Revolution**: Stop thinking about ${prompt} as a one-size-fits-all solution`);
    sections.push(`**2. Data-Driven Approach**: Use leading indicators that actually predict success`);
    sections.push(`**3. Rapid Iteration**: Build feedback loops that compress learning cycles`);
    sections.push(`**4. Context Awareness**: Adapt strategies to your specific situation`);
    sections.push(`📈 THE RESULTS SPEAK FOR THEMSELVES:`);
    sections.push(`Organizations that adopt this new approach typically see:`);
    sections.push(`• 50% improvement in key performance metrics`);
    sections.push(`• 65% reduction in common failure modes`);
    sections.push(`• 3-4x faster achievement of strategic objectives`);
    sections.push(`🎯 TAKING ACTION:\nStart with one small experiment this week. Pick the area where you're seeing the least progress with ${prompt} and apply these principles.`);
    sections.push(`The landscape is evolving rapidly. Those who adapt to these new realities will thrive; those who don't will be left behind.`);
    sections.push(`I'd love to hear your perspective: What's been your experience with ${prompt}? Have you noticed similar patterns? Share your insights below! 👇`);
  }

  return sections.join('\n\n');
}

function getRandomHook(): string {
  const hooks = [
    "Here's something that might surprise you",
    "I've been thinking a lot lately",
    "After analyzing hundreds of cases",
    "There's an uncomfortable truth",
    "Most people get this completely wrong",
    "I used to believe this too, until",
    "The data reveals something shocking",
    "Here's what nobody talks about"
  ];
  
  return hooks[Math.floor(Math.random() * hooks.length)];
}
