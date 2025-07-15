
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
        error: 'Please provide a topic for content generation' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating content for:', prompt);

    // Enhanced system prompt for viral LinkedIn content
    const systemPrompt = `You are a top LinkedIn content creator who writes posts that consistently get 1000+ views and 100+ comments. Your posts go viral because you understand psychology and storytelling.

RULES FOR VIRAL LINKEDIN POSTS:
1. Hook: Start with something that stops scrolling - a bold statement, surprising fact, or personal story
2. Story Structure: Problem → Journey → Solution → Lesson
3. Write like a human: Use "I", "you", contractions, and conversational tone
4. Short paragraphs: 1-2 sentences max per paragraph
5. Numbers and specifics: "increased by 340%" not "increased significantly"
6. End with engagement: Ask a specific question that invites comments
7. Include 3-5 relevant hashtags

PSYCHOLOGY TRIGGERS THAT WORK:
- Curiosity gaps: "The mistake that changed everything..."
- Social proof: "After analyzing 500+ professionals..."
- Controversy: "Unpopular opinion: networking events are overrated"
- Vulnerability: "I failed 3 times before..."
- Authority: "15 years taught me..."

FORMAT:
- Hook (1-2 lines that grab attention)
- Story/Context (2-3 short paragraphs)
- Key insight/lesson (1-2 paragraphs)
- Call to action question
- Hashtags (3-5 maximum)

Write posts that feel authentic, not corporate. Be specific, not generic.`;

    const toneAdjustments = {
      professional: "Maintain authority while being approachable. Use data and insights.",
      casual: "Be conversational and relatable. Use everyday language and personal anecdotes.",
      inspirational: "Focus on motivation and transformation. Use emotional storytelling.",
      educational: "Teach something valuable. Break down complex topics simply.",
      'thought-leadership': "Share unique perspectives and industry insights. Be provocative but respectful."
    };

    const lengthSpecs = {
      short: "200-300 words - punchy and direct",
      medium: "400-600 words - detailed with examples", 
      long: "700-900 words - comprehensive analysis"
    };

    const userPrompt = `Write a LinkedIn post about: "${prompt}"

Requirements:
- Tone: ${tone} (${toneAdjustments[tone] || toneAdjustments.professional})
- Length: ${lengthSpecs[length]}
- Content type: ${contentType}

Make it:
- Engaging from the first line
- Personal and specific (not generic corporate speak)
- Include real examples or scenarios
- End with a question that sparks discussion
- Use short paragraphs for mobile reading
- Add 3-4 relevant hashtags at the end

Focus on providing genuine value that people will want to save and share.`;

    // Try Groq first
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq for high-quality generation...');
        
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
            max_tokens: length === 'short' ? 500 : length === 'medium' ? 800 : 1200,
            temperature: 0.8,
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.3,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 50) {
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

    // Try OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Using OpenAI...');
        
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
            max_tokens: length === 'short' ? 500 : length === 'medium' ? 800 : 1200,
            temperature: 0.7,
            top_p: 0.9,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 50) {
            console.log('Content generated with OpenAI');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4o',
              quality: 'good' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, using template:', error.message);
      }
    }

    // Enhanced fallback template
    console.log('Using enhanced template');
    const content = generateEnhancedContent(prompt, tone, length);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'enhanced_template',
      quality: 'good',
      note: 'Add GROQ_API_KEY for premium AI content generation'
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

function generateEnhancedContent(prompt: string, tone: string, length: string): string {
  const hooks = [
    `The biggest mistake people make with ${prompt.toLowerCase()}? They think it's about perfection.`,
    `After 3 years of struggling with ${prompt.toLowerCase()}, I finally cracked the code.`,
    `Everyone talks about ${prompt.toLowerCase()}, but nobody mentions this crucial detail.`,
    `I used to hate everything about ${prompt.toLowerCase()}. Then I discovered this approach.`,
    `The uncomfortable truth about ${prompt.toLowerCase()} that no one wants to admit:`
  ];

  const stories = [
    `Last month, I watched a colleague completely transform their approach to ${prompt.toLowerCase()}.

    The results were incredible:
    • 40% better outcomes in just 2 weeks  
    • Less stress and more confidence
    • Finally sustainable progress

    Here's exactly what they did differently...`,
    
    `Three months ago, I was completely overwhelmed by ${prompt.toLowerCase()}.

    Nothing seemed to work. Every strategy I tried failed.

    Then I met someone who changed my entire perspective.`,
    
    `I'll never forget the conversation that changed how I think about ${prompt.toLowerCase()}.

    My mentor said something that hit me like a brick:

    "You're solving the wrong problem."

    That one sentence shifted everything.`
  ];

  const insights = [
    `The secret isn't working harder on ${prompt.toLowerCase()}.

    It's about working smarter with these 3 principles:

    1. Focus on systems, not goals
    2. Progress beats perfection every time  
    3. Consistency compounds exponentially

    Most people skip step 1 and wonder why they struggle.`,
    
    `${prompt} becomes 10x easier when you understand this framework:

    → Identify the core problem (not the symptoms)
    → Design the minimum viable solution  
    → Test, measure, and iterate quickly
    → Scale what works, eliminate what doesn't

    It's simple, but not easy.`,
    
    `The breakthrough came when I stopped trying to do ${prompt.toLowerCase()} perfectly.

    Instead, I focused on:
    • Small, consistent actions daily
    • Learning from every mistake
    • Celebrating small wins
    • Building momentum over time

    Progress over perfection always wins.`
  ];

  const questions = [
    `What's been your biggest challenge with ${prompt.toLowerCase()}?`,
    `Which of these strategies resonates most with your experience?`,
    `What would you add to this approach?`,
    `How do you stay consistent when progress feels slow?`,
    `What's one lesson you've learned about ${prompt.toLowerCase()} that surprised you?`
  ];

  const hashtags = ['#ProfessionalGrowth', '#CareerAdvice', '#Leadership', '#Productivity', '#Success'];

  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const story = stories[Math.floor(Math.random() * stories.length)];
  const insight = insights[Math.floor(Math.random() * insights.length)];
  const question = questions[Math.floor(Math.random() * questions.length)];

  return `${hook}

${story}

${insight}

The bottom line: ${prompt} isn't about having all the answers.

It's about asking better questions and taking consistent action.

${question}

${hashtags.slice(0, 4).join(' ')}`;
}
