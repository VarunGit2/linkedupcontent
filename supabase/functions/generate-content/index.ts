
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
    const systemPrompt = `You are a top-tier LinkedIn content strategist who creates viral posts that get thousands of views and hundreds of comments. Your posts consistently go viral because you understand psychology, storytelling, and what makes people engage.

KEY PRINCIPLES:
✅ Start with a hook that stops scrolling (curiosity, bold statement, or personal story)
✅ Use specific examples and real numbers
✅ Tell stories with clear lessons
✅ Provide actionable insights people can use immediately
✅ End with questions that spark discussions
✅ Write for mobile - short paragraphs, line breaks
✅ Include 4-6 relevant hashtags naturally

PSYCHOLOGICAL TRIGGERS:
• Social proof ("After analyzing 1000+ professionals...")
• Scarcity ("95% miss this strategy...")
• Authority ("15 years taught me...")
• Curiosity ("The mistake that changed my career...")
• Controversy ("Unpopular opinion: networking events are overrated...")

CONTENT STRUCTURE:
1. Hook (stop the scroll)
2. Story/Context (build connection)
3. Insight/Learning (provide value)
4. Call to action (encourage engagement)

Write posts that sound human, not corporate. Be conversational but professional.`;

    const lengthSpecs = {
      short: "300-500 words - punchy and direct with clear value",
      medium: "600-800 words - comprehensive with examples and actionable insights", 
      long: "900-1200 words - in-depth analysis with multiple examples and frameworks"
    };

    const userPrompt = `Create an engaging LinkedIn post about "${prompt}" with these specifications:

REQUIREMENTS:
• Tone: ${tone}
• Length: ${lengthSpecs[length]}
• Content Focus: ${contentType}
• Hook: Start with something that makes people stop scrolling
• Structure: Short paragraphs, line breaks for mobile
• Value: Specific, actionable insights
• Engagement: End with a thought-provoking question
• Hashtags: 4-6 relevant ones

Make it:
- Personal and authentic (not corporate)
- Packed with specific examples or data
- Story-driven with clear takeaways
- Engaging enough to save and share
- Professional but conversational

Focus on providing real value that helps people grow.`;

    // Try Groq first (best for creative content)
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Generating with Groq API...');
        
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
            top_p: 0.95,
            frequency_penalty: 0.6,
            presence_penalty: 0.4,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('High-quality content generated with Groq');
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
        console.log('Groq failed, trying OpenAI:', error.message);
      }
    }

    // Try OpenAI as backup
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Generating with OpenAI...');
        
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
            max_tokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 1600,
            temperature: 0.8,
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.3,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('Quality content generated with OpenAI');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4.1',
              quality: 'premium' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, using enhanced template:', error.message);
      }
    }

    // Enhanced professional template fallback
    console.log('Using professional template');
    const content = generateProfessionalContent(prompt, tone, length, contentType);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'professional_template',
      quality: 'good',
      note: 'Add GROQ_API_KEY or OPENAI_API_KEY in Supabase secrets for AI-generated content.'
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

function generateProfessionalContent(prompt: string, tone: string, length: string, contentType: string): string {
  const hooks = [
    `The harsh truth about ${prompt.toLowerCase()} that nobody talks about:`,
    `After 5 years of working with ${prompt.toLowerCase()}, here's what I've learned:`,
    `Most people get ${prompt.toLowerCase()} completely wrong. Here's why:`,
    `The biggest misconception about ${prompt.toLowerCase()}? Let me break it down:`,
    `I used to struggle with ${prompt.toLowerCase()}. Then everything changed when I discovered this:`
  ];

  const insights = [
    `${prompt} isn't just about theory—it's about consistent execution and real-world application.`,
    `The difference between success and failure in ${prompt.toLowerCase()} comes down to three critical factors.`,
    `Most professionals overcomplicate ${prompt.toLowerCase()}. The solution is actually much simpler.`,
    `${prompt} becomes exponentially easier when you focus on systems over outcomes.`,
    `The secret to mastering ${prompt.toLowerCase()}? Start with these fundamentals and build up.`
  ];

  const frameworks = [
    `My 3-step approach to ${prompt}:`,
    `The framework that changed my perspective on ${prompt}:`,
    `Here's the system I use for ${prompt}:`,
    `The proven method for ${prompt} that actually works:`
  ];

  const actionItems = [
    `Start by auditing your current approach to ${prompt.toLowerCase()}`,
    `Focus on one core aspect of ${prompt.toLowerCase()} and master it completely`,
    `Track your progress with specific, measurable metrics`,
    `Connect with others who have succeeded in ${prompt.toLowerCase()}`,
    `Test different strategies and iterate based on results`
  ];

  const questions = [
    `What's been your biggest challenge with ${prompt.toLowerCase()}?`,
    `How do you approach ${prompt.toLowerCase()} in your industry?`,
    `What would you add to this framework?`,
    `Which strategy has worked best for you?`,
    `What misconceptions about ${prompt.toLowerCase()} have you encountered?`
  ];

  const hashtags = ['#ProfessionalDevelopment', '#Leadership', '#CareerGrowth', '#BusinessStrategy', '#LinkedIn2025'];

  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const insight = insights[Math.floor(Math.random() * insights.length)];
  const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
  const question = questions[Math.floor(Math.random() * questions.length)];

  return `${hook}

${insight}

${framework}

1️⃣ ${actionItems[0]}
2️⃣ ${actionItems[1]} 
3️⃣ ${actionItems[2]}

The key insight: Success with ${prompt.toLowerCase()} isn't about having all the answers—it's about asking the right questions and taking consistent action.

Remember: Progress beats perfection, every single time.

${question}

${hashtags.slice(0, 4).join(' ')}`;
}
