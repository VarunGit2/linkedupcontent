
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Content templates for variety
const contentTemplates = {
  professional: [
    "Recently, I've been reflecting on {topic} and its impact on our industry...",
    "One of the key challenges I've observed in {topic} is...",
    "After years of experience with {topic}, here's what I've learned...",
    "The landscape of {topic} is rapidly evolving. Here's my take on...",
    "I wanted to share some insights about {topic} that might benefit your professional journey..."
  ],
  casual: [
    "So, I was thinking about {topic} the other day, and it hit me...",
    "Let me tell you something interesting about {topic}...",
    "You know what's fascinating about {topic}? Well, let me share...",
    "I've been diving deep into {topic} lately, and wow...",
    "Here's something cool I discovered about {topic}..."
  ],
  inspirational: [
    "Every great achievement in {topic} started with a single step...",
    "The journey of mastering {topic} teaches us that...",
    "What if I told you that {topic} could transform your perspective on...",
    "The most successful people in {topic} all share one common trait...",
    "Your relationship with {topic} can be the key to unlocking..."
  ]
};

const getRandomTemplate = (tone: string, topic: string) => {
  const templates = contentTemplates[tone as keyof typeof contentTemplates] || contentTemplates.professional;
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  return randomTemplate.replace('{topic}', topic);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, tone = 'professional', length = 'medium', type = 'content' } = await req.json();
    
    console.log('Generating content with:', { prompt, tone, length, type });
    console.log('Available APIs:', { 
      anthropic: !!ANTHROPIC_API_KEY, 
      openai: !!OPENAI_API_KEY 
    });

    let generatedContent = '';

    // Try Anthropic Claude first (newer models available)
    if (ANTHROPIC_API_KEY) {
      try {
        console.log('Trying Anthropic Claude...');
        
        let systemPrompt = '';
        let maxTokens = 300;
        
        if (type === 'ideas') {
          systemPrompt = 'You are a creative LinkedIn content strategist. Generate 8 unique, engaging LinkedIn post ideas. Each idea should be different in approach and perspective. Return only the ideas, one per line, without numbering. Make them actionable and specific.';
          maxTokens = 600;
        } else {
          const lengthMap = { short: 200, medium: 400, long: 700 };
          maxTokens = lengthMap[length as keyof typeof lengthMap] || 400;
          
          systemPrompt = `You are a professional LinkedIn content creator. Create an engaging LinkedIn post that is ${tone} in tone and ${length} in length. 

          Requirements:
          - Start with a compelling hook or question
          - Include personal insights or experiences
          - Add 3-5 relevant hashtags at the end
          - Make it conversational and engaging
          - Include actionable advice or takeaways
          - Use emojis sparingly but effectively
          - Make the content feel authentic and personal
          - Avoid generic corporate speak
          
          The content should be substantial and valuable to readers.`;
        }

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
            system: systemPrompt,
            messages: [
              { role: 'user', content: `${getRandomTemplate(tone, prompt)}\n\nTopic: ${prompt}` }
            ],
            temperature: 0.8 // Higher temperature for more creativity
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          generatedContent = claudeData.content[0]?.text || '';
          console.log('Successfully generated with Claude');
        } else {
          console.log('Claude failed, status:', claudeResponse.status);
          const errorData = await claudeResponse.text();
          console.log('Claude error:', errorData);
        }
      } catch (error) {
        console.log('Claude error:', error.message);
      }
    }

    // Try OpenAI if Claude failed or not available
    if (!generatedContent && OPENAI_API_KEY) {
      try {
        console.log('Trying OpenAI...');
        
        let systemPrompt = '';
        let maxTokens = 400;

        if (type === 'ideas') {
          systemPrompt = 'You are a creative content strategist specializing in LinkedIn content. Generate 8 unique, engaging, and professional LinkedIn post ideas. Each should offer a different perspective or approach. Return only the ideas, one per line, without numbering. Make them specific and actionable.';
          maxTokens = 600;
        } else {
          const lengthMap = { short: 250, medium: 500, long: 800 };
          maxTokens = lengthMap[length as keyof typeof lengthMap] || 500;
          
          systemPrompt = `You are a professional LinkedIn content creator. Create engaging LinkedIn posts that are ${tone} in tone and ${length} in length. 

          Requirements:
          - Start with an attention-grabbing opening
          - Include personal anecdotes or professional insights
          - Provide valuable takeaways for readers
          - Use a conversational, authentic voice
          - Include 3-5 relevant hashtags
          - Make it feel personal and genuine
          - Avoid clichés and generic corporate language
          - Include actionable advice or questions for engagement`;
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `${getRandomTemplate(tone, prompt)}\n\nCreate content about: ${prompt}` }
            ],
            max_tokens: maxTokens,
            temperature: 0.8, // Higher creativity
            presence_penalty: 0.6, // Encourage new topics
            frequency_penalty: 0.5, // Reduce repetition
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          generatedContent = openaiData.choices[0]?.message?.content || '';
          console.log('Successfully generated with OpenAI');
        } else {
          console.log('OpenAI failed, status:', openaiResponse.status);
          const errorData = await openaiResponse.text();
          console.log('OpenAI error:', errorData);
        }
      } catch (error) {
        console.log('OpenAI error:', error.message);
      }
    }

    // Enhanced fallback content with variety
    if (!generatedContent) {
      console.log('All AI services failed, using enhanced fallback');
      
      const fallbackTemplates = {
        professional: [
          "Leadership isn't about having all the answers—it's about asking the right questions and empowering your team to find solutions together.",
          "The best career advice I ever received: 'Your network is your net worth, but more importantly, your genuine relationships are your real wealth.'",
          "After 5+ years in the industry, I've learned that the most successful professionals share one trait: they never stop learning and adapting.",
          "Innovation doesn't happen in isolation. It's born from diverse perspectives, challenging conversations, and the courage to think differently."
        ],
        casual: [
          "Just had my morning coffee and realized something: the best ideas often come when we're not actively trying to be brilliant. ☕",
          "You know that feeling when everything clicks? That's exactly what happened during yesterday's team meeting...",
          "Plot twist: The 'failure' I experienced last month actually became the foundation for our biggest breakthrough this quarter.",
          "Real talk: Sometimes the most productive thing you can do is take a step back and reassess your approach."
        ],
        inspirational: [
          "Every expert was once a beginner. Every leader was once a follower. Every success story started with someone willing to take the first step.",
          "Your biggest breakthrough is often hiding behind your biggest fear. What would you attempt if you knew you couldn't fail?",
          "The difference between ordinary and extraordinary isn't talent—it's consistency, persistence, and the willingness to grow through discomfort.",
          "Success isn't just about reaching your destination; it's about who you become on the journey there."
        ]
      };
      
      const templates = fallbackTemplates[tone as keyof typeof fallbackTemplates] || fallbackTemplates.professional;
      const baseContent = templates[Math.floor(Math.random() * templates.length)];
      
      if (type === 'ideas') {
        generatedContent = `Here are 8 unique LinkedIn post ideas tailored for your industry:

💡 Share a behind-the-scenes look at your problem-solving process
🚀 Discuss a recent industry trend and your unique perspective on it
🤝 Highlight a mentor who shaped your career and the lesson they taught you
📊 Share data or insights from a recent project (with permission)
⚡ Post about a skill you're currently learning and why it matters
🌟 Celebrate a team member's achievement and what it taught you about leadership
📚 Review a book, podcast, or course that changed your professional outlook
🎯 Share your biggest professional challenge this year and how you're tackling it`;
      } else {
        const hashtags = [
          '#ProfessionalGrowth #Leadership #CareerDevelopment',
          '#Innovation #TeamWork #Success',
          '#LearningAndDevelopment #Networking #Growth',
          '#Productivity #Mindset #Excellence',
          '#BusinessStrategy #Collaboration #Results'
        ];
        
        const randomHashtags = hashtags[Math.floor(Math.random() * hashtags.length)];
        
        generatedContent = `${baseContent}

Here's what I've learned from this experience:

✅ Embrace challenges as opportunities for growth
✅ Build genuine relationships, not just professional connections  
✅ Stay curious and never stop asking questions
✅ Share your knowledge to help others succeed
✅ Focus on progress, not perfection

What's been your biggest professional insight lately? I'd love to hear your thoughts in the comments!

${randomHashtags}`;
      }
    }

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Content generation service temporarily unavailable. Please try again.',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
