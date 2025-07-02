
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced content templates for 2025
const contentTemplates = {
  professional: [
    "In 2025, the landscape of {industry} is rapidly evolving. Here's what I've learned about {topic}:",
    "After {experience} years in {field}, I've discovered that {insight}. Let me share why this matters:",
    "The biggest challenge facing professionals in 2025? {challenge}. Here's how we can address it:",
    "What nobody talks about in {industry}: {unique_perspective}. It's time we change this narrative.",
    "I used to believe {old_belief}, but recent developments in 2025 have shown me {new_understanding}:"
  ],
  storytelling: [
    "Three months ago, I faced a situation that completely changed my perspective on {topic}.",
    "The phone call that changed everything: A client asked me something I'd never considered before.",
    "Walking into that meeting, I had no idea it would teach me the most valuable lesson about {subject}.",
    "Sometimes the best insights come from unexpected places. Here's what {experience} taught me:",
    "If someone had told me last year that {situation}, I wouldn't have believed them. But here's what happened:"
  ],
  insightful: [
    "The data doesn't lie: {statistic} of professionals are struggling with {challenge} in 2025.",
    "Here's a contrarian view on {popular_topic} that most people won't tell you:",
    "While everyone is talking about {trend}, the real opportunity lies in {alternative_approach}.",
    "I've analyzed {number} {industry} trends, and here's the pattern most people are missing:",
    "The intersection of {field1} and {field2} is creating unprecedented opportunities. Here's why:"
  ],
  motivational: [
    "Your biggest limitation isn't your skills, your network, or your experience. It's {limiting_belief}.",
    "Every expert was once a beginner. Every pro was once an amateur. Here's how to accelerate your growth:",
    "The difference between those who succeed and those who don't? It's not what you think:",
    "Stop waiting for permission to {action}. In 2025, the opportunities are there for those who take them.",
    "The career advice that changed my trajectory: {advice}. Here's how you can apply it:"
  ]
};

const industryContexts = [
  "technology", "finance", "healthcare", "education", "marketing", "sales", "consulting", 
  "entrepreneurship", "leadership", "project management", "human resources", "operations",
  "artificial intelligence", "data science", "cybersecurity", "sustainability", "remote work"
];

const generateVariableContent = (template: string, contentType: string, prompt: string) => {
  const variables = {
    industry: industryContexts[Math.floor(Math.random() * industryContexts.length)],
    topic: prompt.toLowerCase(),
    experience: Math.floor(Math.random() * 15) + 5,
    field: contentType,
    insight: "authenticity and genuine connection drive real results",
    challenge: "balancing innovation with practical implementation",
    unique_perspective: "the human element is more crucial than ever in our AI-driven world",
    old_belief: "success meant working harder and longer hours",
    new_understanding: "strategic thinking and intentional action create more impact",
    subject: prompt.toLowerCase(),
    situation: "remote collaboration would become the norm across all industries",
    statistic: `${Math.floor(Math.random() * 30) + 60}%`,
    popular_topic: prompt.toLowerCase(),
    alternative_approach: "focusing on fundamental principles rather than trendy tactics",
    number: Math.floor(Math.random() * 500) + 100,
    field1: "technology",
    field2: "human psychology",
    limiting_belief: "thinking you need permission to share your expertise",
    action: "share your insights and build your thought leadership",
    advice: "focus on solving real problems, not just following trends"
  };

  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return result;
};

const generateHighQualityContent = async (prompt: string, tone: string, length: string, contentType: string) => {
  const templateCategories = Object.keys(contentTemplates);
  const randomCategory = templateCategories[Math.floor(Math.random() * templateCategories.length)];
  const templates = contentTemplates[randomCategory];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  const opening = generateVariableContent(randomTemplate, contentType, prompt);
  
  // Enhanced content structure based on length
  const lengthConfig = {
    short: { paragraphs: 2, sentences: 3, hooks: 1 },
    medium: { paragraphs: 4, sentences: 4, hooks: 2 },
    long: { paragraphs: 6, sentences: 5, hooks: 3 }
  };
  
  const config = lengthConfig[length] || lengthConfig.medium;
  
  // Core content sections
  const sections = [
    `${opening}\n\n`,
    generateMainContent(prompt, contentType, tone, config),
    generateActionableInsights(contentType, config),
    generateCallToAction(tone, contentType)
  ];
  
  return sections.join('\n');
};

const generateMainContent = (prompt: string, contentType: string, tone: string, config: any) => {
  const insights = [
    `The key insight I've gained about ${prompt.toLowerCase()} is that sustainable success comes from understanding the fundamentals, not chasing every new trend.`,
    `What most people don't realize about ${prompt.toLowerCase()} is that the real breakthrough happens when you stop trying to be perfect and start focusing on being consistent.`,
    `In my experience with ${prompt.toLowerCase()}, the biggest game-changer has been shifting from a reactive to a proactive mindset.`,
    `Here's what I've learned about ${prompt.toLowerCase()}: the most successful approaches are often the simplest ones, executed with precision.`
  ];
  
  const examples = [
    `For instance, when I was working on a recent project involving ${prompt.toLowerCase()}, I discovered that taking a step back and analyzing the core problem led to a solution that was both elegant and effective.`,
    `A practical example: Last month, a colleague approached me with a challenge related to ${prompt.toLowerCase()}. By applying these principles, we were able to reduce complexity by 40% while improving outcomes.`,
    `To illustrate this point: I recently observed how two different teams tackled similar ${prompt.toLowerCase()} challenges. The team that focused on principles over procedures achieved significantly better results.`
  ];
  
  return [
    insights[Math.floor(Math.random() * insights.length)],
    examples[Math.floor(Math.random() * examples.length)]
  ].join('\n\n');
};

const generateActionableInsights = (contentType: string, config: any) => {
  const insights = [
    "Here are three actionable strategies that can make an immediate difference:",
    "Based on my experience, these approaches consistently deliver results:",
    "If you're looking to implement this effectively, consider these key factors:"
  ];
  
  const actions = [
    "• Start with small, measurable experiments rather than sweeping changes",
    "• Focus on building systems that support long-term growth, not just quick wins",
    "• Invest time in understanding your audience's actual needs, not what you think they need",
    "• Create feedback loops that help you adjust course quickly when something isn't working",
    "• Build partnerships and networks that align with your values and goals",
    "• Prioritize learning and adaptation over perfection and rigidity"
  ];
  
  const selectedActions = actions.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  return `${insights[Math.floor(Math.random() * insights.length)]}\n\n${selectedActions.join('\n')}`;
};

const generateCallToAction = (tone: string, contentType: string) => {
  const ctas = [
    "What's your experience with this approach? I'd love to hear your perspective in the comments.",
    "Have you encountered similar challenges? Share your strategies – let's learn from each other.",
    "What's one insight from your experience that others might benefit from? Drop it below.",
    "I'm curious: How do you approach these situations in your field? Let's start a conversation.",
    "What would you add to this list? Your insights could help others in our network."
  ];
  
  return `\n${ctas[Math.floor(Math.random() * ctas.length)]}\n\n#LinkedInContent #ProfessionalDevelopment #${contentType.charAt(0).toUpperCase() + contentType.slice(1)} #Leadership2025`;
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

    console.log('Generating enhanced content for:', { prompt, tone, length, contentType });

    // Try OpenAI first, then Anthropic, then high-quality fallback
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (openaiKey) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are a LinkedIn content expert creating engaging, professional posts for 2025. Create authentic, valuable content that drives engagement. Use storytelling, data insights, and actionable advice. Keep it conversational yet professional. Current year: 2025.`
              },
              {
                role: 'user',
                content: `Create a ${length} LinkedIn post about "${prompt}" with a ${tone} tone for ${contentType} content. Include specific examples, actionable insights, and end with an engaging question. Make it feel authentic and valuable, not generic. Target length: ${length === 'short' ? '200-300' : length === 'medium' ? '400-600' : '700-1000'} words.`
              }
            ],
            max_tokens: length === 'short' ? 400 : length === 'medium' ? 800 : 1200,
            temperature: 0.8,
            presence_penalty: 0.3,
            frequency_penalty: 0.5,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content) {
            console.log('Generated content with OpenAI successfully');
            return new Response(JSON.stringify({ content, source: 'openai' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI failed, trying Anthropic:', error.message);
      }
    }

    if (anthropicKey) {
      try {
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: length === 'short' ? 400 : length === 'medium' ? 800 : 1200,
            temperature: 0.8,
            messages: [{
              role: 'user',
              content: `Create a compelling ${length} LinkedIn post about "${prompt}" with a ${tone} tone for ${contentType} content. Make it engaging, authentic, and valuable for professionals in 2025. Include specific examples and end with a thought-provoking question. Target: ${length === 'short' ? '200-300' : length === 'medium' ? '400-600' : '700-1000'} words.`
            }]
          }),
        });

        if (anthropicResponse.ok) {
          const data = await anthropicResponse.json();
          const content = data.content[0]?.text;
          if (content) {
            console.log('Generated content with Anthropic successfully');
            return new Response(JSON.stringify({ content, source: 'anthropic' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Anthropic failed, using enhanced fallback:', error.message);
      }
    }

    // Enhanced fallback content generation
    console.log('Using enhanced fallback content generation');
    const fallbackContent = await generateHighQualityContent(prompt, tone, length, contentType);
    
    return new Response(JSON.stringify({ 
      content: fallbackContent, 
      source: 'enhanced_fallback',
      note: 'Generated using advanced templates. For best results, configure OpenAI or Anthropic API keys in settings.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation temporarily unavailable. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
