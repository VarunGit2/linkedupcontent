
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

    // Try Groq first with fixed prompting
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq with improved prompting...');
        
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
            max_tokens: getTokenLimit(contentLength, type),
            temperature: 0.8,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.3,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 50 && !content.includes('Generate 6 professional LinkedIn')) {
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

    // Try OpenAI with improved prompting
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Using OpenAI with improved prompting...');
        
        const systemPrompt = getSystemPrompt(type, writingTone, contentLength, contentFocus);
        const userPrompt = buildUserPrompt(prompt, type, writingTone, contentLength, contentFocus, industry, audience, interests, ideaCount);

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
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 50 && !content.includes('Generate 6 professional LinkedIn')) {
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
        console.log('OpenAI failed, using high-quality template system:', error.message);
      }
    }

    // High-quality fallback system
    console.log('Using improved template system');
    const content = generateQualityContent(prompt, type, writingTone, contentLength, contentFocus, industry, audience, ideaCount);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'improved_template_system',
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

function getSystemPrompt(type: string, tone: string, length: string, focus: string): string {
  if (type === 'ideas') {
    return `You are an expert LinkedIn content strategist. Generate unique, engaging LinkedIn post ideas that will get high engagement.

CRITICAL RULES:
- Generate ONLY the requested number of distinct post ideas
- Each idea should be completely different from the others
- Focus on the EXACT topic provided by the user
- Make each idea specific and actionable
- Format as a numbered list

DO NOT:
- Repeat the user's request in your response
- Include template language like [insert topic]
- Generate generic or vague ideas
- Include the same concept multiple times`;
  }

  return `You are an expert LinkedIn content creator who writes viral, engaging posts that get thousands of likes and comments.

CRITICAL RULES:
- Write about the EXACT topic the user provides
- Create original, engaging content that sounds natural
- Use the specified tone: ${tone}
- Target length: ${length} 
- Focus area: ${focus}

DO NOT:
- Repeat the user's request in your response
- Use placeholder text like [insert topic] or [common mistake]
- Include template language or brackets
- Write about generating content - write the actual content

Write a complete, ready-to-post LinkedIn update that's engaging and professional.`;
}

function buildUserPrompt(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, interests: string, ideaCount: number): string {
  if (type === 'ideas') {
    return `Generate exactly ${ideaCount} unique LinkedIn post ideas about: "${prompt}"

${industry ? `Industry context: ${industry}` : ''}
${audience ? `Target audience: ${audience}` : ''}
${interests ? `Key interests: ${interests}` : ''}

Each idea should be:
- Completely unique and different from the others
- Specific to the topic "${prompt}"
- Designed to spark engagement and discussion
- Actionable and thought-provoking

Format as a simple numbered list (1., 2., 3., etc.) with each idea being a brief, compelling post concept.`;
  }

  return `Write a compelling LinkedIn post about: "${prompt}"

${industry ? `Industry: ${industry}` : ''}
${audience ? `Target audience: ${audience}` : ''}
${interests ? `Related interests: ${interests}` : ''}

Requirements:
- Tone: ${tone}
- Length: ${length === 'short' ? '150-250 words' : length === 'medium' ? '400-600 words' : '800+ words'}
- Focus: ${focus}

Write a complete, engaging LinkedIn post that's ready to publish. Make it specific to the topic "${prompt}" and avoid any placeholder text.`;
}

function getTokenLimit(length: string, type: string): number {
  if (type === 'ideas') return 800;
  
  switch (length) {
    case 'short': return 400;
    case 'medium': return 800;
    case 'long': return 1200;
    default: return 800;
  }
}

function generateQualityContent(prompt: string, type: string, tone: string, length: string, focus: string, industry: string, audience: string, ideaCount: number): string {
  if (type === 'ideas') {
    const ideas = [];
    const hooks = [
      "The uncomfortable truth about",
      "Why everyone is wrong about",
      "The hidden reality behind",
      "What nobody tells you about",
      "The surprising data on",
      "Why successful people avoid"
    ];
    
    const angles = [
      "contrarian perspective",
      "behind-the-scenes insight",
      "data-driven analysis",
      "personal experience story",
      "industry trend breakdown",
      "practical framework"
    ];
    
    for (let i = 1; i <= ideaCount; i++) {
      const hook = hooks[Math.floor(Math.random() * hooks.length)];
      const angle = angles[Math.floor(Math.random() * angles.length)];
      ideas.push(`${i}. ${hook} ${prompt} - Share a ${angle} that challenges conventional thinking and provides actionable insights for ${audience || 'professionals'}.`);
    }
    
    return ideas.join('\n');
  }

  // Generate actual content instead of templates
  const sections = [];
  
  // Strong opening
  sections.push(`💡 Here's something that might surprise you about ${prompt}:`);
  
  if (length === 'short') {
    sections.push(`Most ${audience || 'professionals'} think they understand ${prompt}, but recent insights reveal a different story.`);
    sections.push(`The key insight? Focus on outcomes, not just processes.`);
    sections.push(`This simple shift can transform your approach and deliver measurable results.`);
    sections.push(`What's your experience with ${prompt}? Share your thoughts! 👇`);
  } else if (length === 'medium') {
    sections.push(`After working with hundreds of ${audience || 'professionals'} in ${industry || 'various industries'}, I've noticed a pattern that most people miss.`);
    sections.push(`🎯 The Reality:\nWhile everyone focuses on the obvious aspects of ${prompt}, the real opportunity lies in understanding the underlying dynamics.`);
    sections.push(`📊 Here's what the data shows:\n• 70% of professionals approach this incorrectly\n• Those who get it right see 3x better results\n• The difference comes down to mindset, not just tactics`);
    sections.push(`✅ The Framework That Works:\n1. Start with clear objectives\n2. Focus on measurable outcomes\n3. Iterate based on real feedback`);
    sections.push(`🚀 The Bottom Line:\n${prompt} isn't just about following best practices - it's about understanding what drives real results in your specific context.`);
    sections.push(`What's been your biggest challenge with ${prompt}? Let's discuss in the comments! 👇`);
  } else {
    sections.push(`I've spent years studying ${prompt} across different ${industry || 'industries'}, and what I've discovered challenges everything most people believe.`);
    sections.push(`🚨 THE PROBLEM:\nMost approaches to ${prompt} are built on outdated assumptions. Here's what's really happening:`);
    sections.push(`• Traditional methods ignore modern realities\n• Success metrics are often misaligned\n• The best practices everyone follows aren't actually best`);
    sections.push(`💡 THE BREAKTHROUGH:\nAfter analyzing hundreds of case studies, I've identified the key factors that separate high performers from everyone else:`);
    sections.push(`1. **Mindset Shift**: Stop thinking about ${prompt} as a one-size-fits-all solution\n2. **Data-Driven Approach**: Use real metrics, not vanity numbers\n3. **Continuous Evolution**: What worked yesterday might not work tomorrow`);
    sections.push(`📈 THE RESULTS:\nOrganizations that adopt this new approach typically see:\n• 40% improvement in key metrics\n• 60% reduction in common pitfalls\n• 3x faster achievement of objectives`);
    sections.push(`🎯 TAKING ACTION:\nStart with one small change this week. Pick the area where you're seeing the least progress and apply these principles.`);
    sections.push(`The landscape around ${prompt} is evolving rapidly. Those who adapt will thrive; those who don't will be left behind.`);
    sections.push(`What's your take on ${prompt}? Have you noticed similar patterns? Share your insights below! 👇`);
  }

  return sections.join('\n\n');
}
