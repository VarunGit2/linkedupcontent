
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

    console.log('Generating premium content for:', prompt);

    // Professional viral content system prompt
    const systemPrompt = `You are an elite LinkedIn content strategist who creates viral posts that get 50K+ views and 1000+ comments. Your content stops people mid-scroll and makes them engage immediately.

VIRAL CONTENT PSYCHOLOGY:
• Hook Formula: Curiosity gap + Pattern interrupt + Controversy/surprise
• Story Structure: Problem → Struggle → Discovery → Transformation → Lesson
• Engagement Triggers: Vulnerability, Authority, Social proof, Specific numbers
• Format: Short paragraphs (1-2 sentences), bullet points, strategic spacing

CONTENT TEMPLATES:
Professional Authority: "After analyzing 10,000+ [topic] strategies, here's what actually works..."
Vulnerability Hook: "I lost $50K making this [topic] mistake so you don't have to..."
Pattern Interrupt: "Everyone says [common advice]. Here's why they're wrong..."
Transformation Story: "6 months ago I was struggling with [topic]. Today I [achievement]..."

ENGAGEMENT PSYCHOLOGY:
• Use specific numbers (340% increase, not "significant growth")
• Include personal failure/struggle stories
• Challenge conventional wisdom
• Ask controversial questions
• Create knowledge gaps people want filled
• Use power words: discovered, revealed, secret, mistake, truth

VIRAL STRUCTURE:
1. Hook (curiosity/controversy)
2. Context (brief background)
3. Story/Example (specific details)
4. Key insight/Framework
5. Call to action/Question
6. Strategic hashtags (3-4 max)

Write like a human, not a corporation. Use contractions, show personality, be authentic.`;

    const toneModifiers = {
      professional: "Authoritative but approachable. Use data and proven strategies.",
      casual: "Conversational and relatable. Include humor and personal anecdotes.",
      inspirational: "Motivational and uplifting. Focus on transformation and possibility.",
      educational: "Clear and instructive. Break down complex concepts simply.",
      'thought-leadership': "Bold and contrarian. Challenge status quo thinking."
    };

    const lengthSpecs = {
      short: "250-400 words - punchy and direct with maximum impact",
      medium: "400-700 words - detailed storytelling with examples", 
      long: "700-1000 words - comprehensive with framework/methodology"
    };

    const contentPrompt = `Create a viral LinkedIn post about: "${prompt}"

Requirements:
- Tone: ${tone} (${toneModifiers[tone]})
- Length: ${lengthSpecs[length]}
- Content focus: ${contentType}

Structure:
- Compelling hook that creates curiosity/surprise
- Personal story or case study with specific details
- Actionable insight or framework
- Engagement question
- 3-4 strategic hashtags

Psychology:
- Use specific numbers and results
- Include personal vulnerability/struggle
- Challenge common assumptions
- Create knowledge gaps
- End with discussion-sparking question

Format for mobile:
- Short paragraphs (1-2 sentences)
- Strategic line breaks
- Bullet points for key insights
- Emojis sparingly for emphasis

Make it impossible to scroll past without engaging.`;

    // Try Mistral first (best for creative, viral content)
    const mistralKey = Deno.env.get('MISTRAL_API_KEY');
    if (mistralKey) {
      try {
        console.log('Using Mistral Large for viral content creation...');
        
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
              { role: 'user', content: contentPrompt }
            ],
            max_tokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 1600,
            temperature: 0.9,
            top_p: 0.95,
          }),
        });

        if (mistralResponse.ok) {
          const data = await mistralResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 150) {
            console.log('High-quality viral content generated with Mistral Large');
            return new Response(JSON.stringify({ 
              content, 
              source: 'mistral_large',
              quality: 'premium',
              note: 'Generated with Mistral Large - optimized for viral content'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Mistral failed, trying Groq:', error.message);
      }
    }

    // Try Groq with Llama (excellent for professional content)
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq Llama for professional viral content...');
        
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
              { role: 'user', content: contentPrompt }
            ],
            max_tokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 1600,
            temperature: 0.85,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.2,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 150) {
            console.log('High-quality viral content generated with Groq Llama');
            return new Response(JSON.stringify({ 
              content, 
              source: 'groq_llama_70b',
              quality: 'premium',
              note: 'Generated with Llama 3.3 70B - professional viral content'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Groq failed, trying OpenAI GPT-4:', error.message);
      }
    }

    // Try OpenAI GPT-4.1 (latest model)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Using OpenAI GPT-4.1...');
        
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
              { role: 'user', content: contentPrompt }
            ],
            max_tokens: length === 'short' ? 800 : length === 'medium' ? 1200 : 1600,
            temperature: 0.8,
            top_p: 0.9,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 150) {
            console.log('High-quality content generated with OpenAI GPT-4.1');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4.1',
              quality: 'premium',
              note: 'Generated with GPT-4.1 - latest OpenAI model'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, using enhanced template:', error.message);
      }
    }

    // Enhanced fallback with premium templates
    console.log('Using premium viral content template');
    const content = generatePremiumViralContent(prompt, tone, length, contentType);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'premium_template',
      quality: 'good',
      note: 'Add MISTRAL_API_KEY or GROQ_API_KEY in Supabase secrets for AI-powered content'
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

function generatePremiumViralContent(prompt: string, tone: string, length: string, contentType: string): string {
  const viralHooks = [
    `I made a $100K mistake with ${prompt.toLowerCase()} so you don't have to.`,
    `After 1,000+ experiments with ${prompt.toLowerCase()}, here's what nobody tells you:`,
    `Everyone's doing ${prompt.toLowerCase()} wrong. Here's the uncomfortable truth:`,
    `I was skeptical about ${prompt.toLowerCase()} until this happened...`,
    `The ${prompt.toLowerCase()} advice everyone gives? Complete BS.`,
    `3 years ago, I knew nothing about ${prompt.toLowerCase()}. Today I...`
  ];

  const viralStories = [
    `Last month, I watched a CEO completely transform their approach to ${prompt.toLowerCase()}.

The results were mind-blowing:
→ 450% increase in engagement
→ 3x faster growth rate  
→ 60% less time wasted on wrong tactics

But what they did differently shocked everyone in the room...`,
    
    `Six months ago, I thought I had ${prompt.toLowerCase()} figured out.

I had all the "expert" strategies.
I followed every "best practice."
I did everything the gurus recommended.

Then I met someone who shattered everything I believed.

What they showed me changed my entire approach.`,
    
    `The conversation that changed everything happened at 1 AM on a Tuesday.

My mentor looked at my ${prompt.toLowerCase()} strategy and said:

"You're optimizing for vanity metrics, not real results."

That one sentence cost me sleep but made me $200K.`
  ];

  const frameworks = [
    `The secret isn't perfecting ${prompt.toLowerCase()}.

It's mastering these 3 psychological principles:

1. Focus on outcomes, not activities
2. Test assumptions, don't assume best practices work
3. Optimize for compound growth, not quick wins

Most people get stuck on #2 and completely ignore #3.

That's why 95% plateau.`,
    
    `${prompt} becomes 10x easier with the IMPACT framework:

→ I: Identify the real problem (not symptoms)
→ M: Map the customer journey thoroughly  
→ P: Prioritize high-leverage actions only
→ A: Automate what works consistently
→ C: Continuously optimize based on data
→ T: Track meaningful metrics, not vanity ones

I've used this with 100+ companies. It works.`,
    
    `The breakthrough came when I stopped trying to be perfect at ${prompt.toLowerCase()}.

Instead, I focused on:
• Speed over perfection (ship fast, learn faster)
• Progress over planning (execution beats strategy)  
• Results over vanity metrics (revenue over followers)
• Systems over goals (process creates outcomes)
• Testing over assumptions (data beats opinions)

This mindset shift changed everything.`
  ];

  const engagementQuestions = [
    `What's the biggest lie you believed about ${prompt.toLowerCase()}?`,
    `Which principle challenges your current approach the most?`,
    `What's your biggest ${prompt.toLowerCase()} mistake that actually taught you something valuable?`,
    `How do you measure success with ${prompt.toLowerCase()}? (Be honest 😏)`,
    `What would you add to this framework from your experience?`,
    `Who else needs to hear this? Tag someone who's struggling with ${prompt.toLowerCase()}.`
  ];

  const trendingHashtags = ['#Entrepreneurship', '#Leadership', '#GrowthHacking', '#BusinessStrategy', '#Success', '#Innovation', '#Marketing', '#Productivity'];

  const hook = viralHooks[Math.floor(Math.random() * viralHooks.length)];
  const story = viralStories[Math.floor(Math.random() * viralStories.length)];
  const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
  const question = engagementQuestions[Math.floor(Math.random() * engagementQuestions.length)];
  const hashtags = trendingHashtags.sort(() => 0.5 - Math.random()).slice(0, 4);

  return `${hook}

${story}

${framework}

The bottom line:

${prompt} isn't about having all the perfect strategies.

It's about testing faster, learning quicker, and optimizing relentlessly.

${question}

---

${hashtags.join(' ')}`;
}
