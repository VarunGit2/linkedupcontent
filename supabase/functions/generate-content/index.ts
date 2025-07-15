
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
    const systemPrompt = `You are a viral LinkedIn content expert who creates posts that get 10,000+ views and hundreds of comments. Your posts hook readers immediately and make them feel compelled to engage.

VIRAL CONTENT FORMULA:
1. HOOK: Start with curiosity, controversy, or surprising insight
2. STORY: Personal experience or case study with specific details
3. INSIGHT: One powerful lesson or framework
4. ENGAGEMENT: Question that sparks debate/discussion

PSYCHOLOGICAL TRIGGERS:
- Pattern interrupts: "Everyone says X, but here's what actually works..."
- Vulnerability: "I failed at X for 2 years until I discovered..."
- Authority: "After analyzing 1000+ posts, I found..."
- Curiosity gaps: "The mistake that cost me $50K..."
- Social proof: "This simple change increased engagement by 340%"

FORMAT:
• Hook (attention-grabbing opener)
• Personal story/example (2-3 short paragraphs)
• Key insight/lesson (actionable takeaway)
• Engagement question
• 3-4 relevant hashtags

Write like a human, not a corporation. Use "I", "you", contractions. Keep paragraphs 1-2 sentences max.`;

    const toneAdjustments = {
      professional: "Authoritative but approachable. Use data and insights.",
      casual: "Conversational and relatable. Personal stories and humor.",
      inspirational: "Motivational storytelling. Focus on transformation.",
      educational: "Teach valuable lessons. Break down complex concepts.",
      'thought-leadership': "Unique perspectives. Challenge conventional thinking."
    };

    const lengthSpecs = {
      short: "300-400 words - punchy and direct",
      medium: "500-700 words - detailed with examples", 
      long: "800-1000 words - comprehensive storytelling"
    };

    const userPrompt = `Write a viral LinkedIn post about: "${prompt}"

Requirements:
- Tone: ${tone} (${toneAdjustments[tone] || toneAdjustments.professional})
- Length: ${lengthSpecs[length]}
- Content type: ${contentType}

Make it:
- Hook readers from line 1 with curiosity/controversy
- Include specific numbers, examples, or personal stories
- Provide genuine value people will save and share
- End with a question that sparks discussion
- Use short paragraphs for mobile reading
- Add 3-4 strategic hashtags

Focus on viral potential - what would make someone stop scrolling and engage?`;

    // Try Mistral first (best for creative content)
    const mistralKey = Deno.env.get('MISTRAL_API_KEY');
    if (mistralKey) {
      try {
        console.log('Using Mistral for creative viral content...');
        
        const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mistralKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 900 : 1300,
            temperature: 0.9,
            top_p: 0.95,
          }),
        });

        if (mistralResponse.ok) {
          const data = await mistralResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('High-quality viral content generated with Mistral');
            return new Response(JSON.stringify({ 
              content, 
              source: 'mistral_large',
              quality: 'premium' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Mistral failed, trying Groq:', error.message);
      }
    }

    // Try Groq with Llama
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq Llama for viral content...');
        
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
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 900 : 1300,
            temperature: 0.85,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.2,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('High-quality viral content generated with Groq Llama');
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
        console.log('Using OpenAI GPT-4o...');
        
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
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 900 : 1300,
            temperature: 0.8,
            top_p: 0.9,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('Content generated with OpenAI GPT-4o');
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
        console.log('OpenAI failed, using enhanced template:', error.message);
      }
    }

    // Enhanced fallback template with viral content structure
    console.log('Using viral content template');
    const content = generateViralContent(prompt, tone, length);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'viral_template',
      quality: 'good',
      note: 'Add MISTRAL_API_KEY or GROQ_API_KEY for premium AI content'
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

function generateViralContent(prompt: string, tone: string, length: string): string {
  const viralHooks = [
    `I made a $50K mistake with ${prompt.toLowerCase()} so you don't have to.`,
    `After 500+ experiments with ${prompt.toLowerCase()}, here's what actually works:`,
    `Everyone's doing ${prompt.toLowerCase()} wrong. Here's the uncomfortable truth:`,
    `I was skeptical about ${prompt.toLowerCase()} until this happened...`,
    `The ${prompt.toLowerCase()} advice everyone gives? It's backwards.`
  ];

  const viralStories = [
    `Last week, I watched a startup founder completely transform their approach to ${prompt.toLowerCase()}.

    The results were mind-blowing:
    → 340% increase in engagement
    → 2x faster growth rate  
    → 50% less time spent on the wrong things

    But here's what they did differently that shocked everyone...`,
    
    `Three months ago, I was completely wrong about ${prompt.toLowerCase()}.

    I thought I knew everything. I had all the "best practices."

    Then I met someone who shattered everything I believed.

    What they showed me changed my entire perspective.`,
    
    `The conversation that changed everything happened at 2 AM.

    My mentor looked at my ${prompt.toLowerCase()} strategy and said:

    "You're optimizing for the wrong metric."

    That one sentence cost me sleep but made me $100K.`
  ];

  const viralInsights = [
    `The secret isn't perfecting ${prompt.toLowerCase()}.

    It's about mastering these 3 psychological principles:

    1. People buy emotions, not features
    2. Clarity beats cleverness every time  
    3. Consistency compounds exponentially

    Most people focus on #2 and ignore #1 and #3.

    That's why 90% fail.`,
    
    `${prompt} becomes 10x easier when you understand this framework:

    The IMPACT Method:
    → I: Identify the real problem (not symptoms)
    → M: Map the customer journey  
    → P: Prioritize high-impact actions
    → A: Automate what works
    → C: Continuously optimize
    → T: Track meaningful metrics

    I've used this with 50+ companies. It works.`,
    
    `The breakthrough came when I stopped trying to be perfect at ${prompt.toLowerCase()}.

    Instead, I focused on:
    • Speed over perfection (ship fast, learn faster)
    • Progress over planning (done beats perfect)
    • Results over vanity metrics (revenue over followers)
    • Systems over goals (process creates outcomes)

    This mindset shift changed everything.`
  ];

  const viralQuestions = [
    `What's the biggest lie you believed about ${prompt.toLowerCase()}?`,
    `Which of these principles challenges your current approach?`,
    `What's your biggest ${prompt.toLowerCase()} mistake that taught you the most?`,
    `How are you measuring success with ${prompt.toLowerCase()}? (Wrong answers only 😏)`,
    `What would you add to this framework based on your experience?`
  ];

  const hashtags = ['#Entrepreneurship', '#Leadership', '#GrowthHacking', '#BusinessTips', '#Success'];

  const hook = viralHooks[Math.floor(Math.random() * viralHooks.length)];
  const story = viralStories[Math.floor(Math.random() * viralStories.length)];
  const insight = viralInsights[Math.floor(Math.random() * viralInsights.length)];
  const question = viralQuestions[Math.floor(Math.random() * viralQuestions.length)];

  return `${hook}

${story}

${insight}

The bottom line:

${prompt} isn't about having all the answers.

It's about asking better questions and taking massive action.

${question}

---

${hashtags.slice(0, 4).join(' ')}`;
}
