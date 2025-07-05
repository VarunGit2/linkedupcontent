
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced 2025 content frameworks with sophisticated templates
const contentFrameworks = {
  storytelling: {
    name: "Storytelling Framework",
    templates: [
      "The moment everything changed: {challenge_moment}. Here's what I learned about {topic} and why it matters for your {industry} journey in 2025.",
      "Three years ago, I made a mistake that cost me {consequence}. Today, I'm grateful because it taught me {lesson} about {topic}.",
      "I used to believe {misconception} about {topic}. Then {pivotal_event} happened, and my entire perspective shifted. Here's what I discovered:",
      "The conversation that changed my career happened in {setting}. A {person_type} asked me one simple question about {topic} that I couldn't answer.",
      "Last month, I witnessed something that perfectly illustrates why {topic} is crucial in 2025. Here's the story:"
    ]
  },
  problem_solution: {
    name: "Problem-Solution Framework", 
    templates: [
      "Here's the harsh truth about {topic} in 2025: {problem_statement}. But there's a solution most people are missing.",
      "Every {profession} faces this challenge: {specific_problem}. After working with {number}+ professionals, I've discovered the real solution.",
      "The biggest mistake I see in {industry}? {common_mistake}. Here's the systematic approach that actually works:",
      "Stop doing {wrong_approach} for {topic}. Instead, try this {number}-step framework that's working in 2025:",
      "{percentage}% of professionals struggle with {challenge}. Here's the unconventional approach that's changing the game:"
    ]
  },
  insight_driven: {
    name: "Insight-Driven Framework",
    templates: [
      "After analyzing {data_point} in {industry}, I discovered something surprising about {topic}. The implications for 2025 are massive.",
      "The data doesn't lie: {statistic} of {target_audience} are approaching {topic} completely wrong. Here's what the research reveals:",
      "I've been tracking {trend} for {time_period}, and the pattern is clear. Here's what every {profession} needs to know about {topic}:",
      "Contrary to popular belief, {common_assumption} about {topic} is actually holding us back. Here's what the evidence shows:",
      "The intersection of {field1} and {field2} is creating unprecedented opportunities in {topic}. Here's why 2025 is the perfect time to act:"
    ]
  },
  educational: {
    name: "Educational Framework",
    templates: [
      "Master {topic} in 2025 with this {number}-step system. I've tested it with {validation} and the results speak for themselves.",
      "The {topic} playbook that every {profession} needs: From {starting_point} to {end_goal} in {timeframe}.",
      "Think you know {topic}? These {number} principles will change how you approach it entirely. #ThreadAlert",
      "The complete guide to {topic} for {target_audience}: Everything I wish someone had told me {time_ago}.",
      "Breaking down {complex_topic} into simple, actionable steps. Save this post for your {goal} journey:"
    ]
  },
  contrarian: {
    name: "Contrarian Framework",
    templates: [
      "Unpopular opinion: {controversial_statement} about {topic}. Here's why everyone else has it backwards in 2025.",
      "While everyone is obsessing over {popular_trend}, the real opportunity in {topic} lies elsewhere. Here's what they're missing:",
      "Stop following the crowd on {topic}. The {alternative_approach} is what actually drives results in 2025.",
      "The {topic} advice you see everywhere? It's outdated. Here's what's actually working now:",
      "Everyone's talking about {mainstream_view} for {topic}. But the smartest professionals are quietly doing this instead:"
    ]
  }
};

const industryContexts = [
  "artificial intelligence", "sustainability", "remote work", "leadership", "entrepreneurship",  
  "digital transformation", "data science", "cybersecurity", "blockchain", "fintech",
  "healthcare innovation", "e-commerce", "social media marketing", "content creation",
  "personal branding", "career development", "productivity", "team management"
];

const generateAdvancedContent = async (prompt: string, tone: string, length: string, contentType: string) => {
  // Select framework based on content type and tone
  const frameworks = Object.keys(contentFrameworks);
  const selectedFramework = frameworks[Math.floor(Math.random() * frameworks.length)];
  const framework = contentFrameworks[selectedFramework];
  
  const template = framework.templates[Math.floor(Math.random() * framework.templates.length)];
  
  // Enhanced variable generation with context awareness
  const variables = generateSmartVariables(prompt, contentType, tone);
  
  // Replace template variables
  let opening = template;
  Object.entries(variables).forEach(([key, value]) => {
    opening = opening.replace(new RegExp(`{${key}}`, 'g'), value);
  });

  // Generate structured content based on length
  const lengthConfig = {
    short: { sections: 2, pointsPerSection: 2, engagement: "high" },
    medium: { sections: 3, pointsPerSection: 3, engagement: "medium" }, 
    long: { sections: 4, pointsPerSection: 4, engagement: "detailed" }
  };

  const config = lengthConfig[length] || lengthConfig.medium;
  
  const sections = [
    opening,
    generateMainContent(prompt, contentType, tone, config, selectedFramework),
    generateActionableSection(prompt, config),
    generateEngagementEnding(tone, contentType, prompt)
  ];

  return sections.filter(section => section.trim()).join('\n\n');
};

const generateSmartVariables = (prompt: string, contentType: string, tone: string) => {
  const currentYear = 2025;
  const industry = industryContexts[Math.floor(Math.random() * industryContexts.length)];
  
  return {
    topic: prompt.toLowerCase(),
    industry: industry,
    challenge_moment: `when I realized traditional approaches to ${prompt.toLowerCase()} weren't working anymore`,
    consequence: "months of progress and several important opportunities",
    lesson: "the power of authentic, strategic thinking over reactive tactics",
    misconception: `that ${prompt.toLowerCase()} was just about following best practices`,
    pivotal_event: "a failed project taught me",
    setting: "an unexpected place - a coffee shop conversation",
    person_type: "seasoned industry veteran",
    problem_statement: `most professionals are approaching ${prompt.toLowerCase()} with outdated methods`,
    profession: contentType === "leadership" ? "leader" : "professional",
    specific_problem: `inconsistent results with ${prompt.toLowerCase()} strategies`,
    number: Math.floor(Math.random() * 500) + 100,
    common_mistake: `treating ${prompt.toLowerCase()} as a one-size-fits-all solution`,
    wrong_approach: "generic, templated strategies",
    percentage: Math.floor(Math.random() * 30) + 60,
    challenge: `staying relevant in ${prompt.toLowerCase()} during rapid industry changes`,
    data_point: `over ${Math.floor(Math.random() * 1000) + 500} case studies`,
    statistic: `${Math.floor(Math.random() * 25) + 65}%`,
    target_audience: "forward-thinking professionals",
    trend: `emerging patterns in ${prompt.toLowerCase()}`,
    time_period: "the past 18 months",
    common_assumption: `that traditional ${prompt.toLowerCase()} methods still work`,
    field1: "technology",
    field2: "human psychology",
    validation: `${Math.floor(Math.random() * 50) + 20} client success stories`,
    starting_point: "wherever you are now",
    end_goal: "measurable, sustainable results",
    timeframe: "90 days",
    time_ago: "when I started my career",
    complex_topic: prompt.toLowerCase(),
    goal: `${prompt.toLowerCase()} mastery`,
    controversial_statement: `most ${prompt.toLowerCase()} advice is keeping you stuck`,
    popular_trend: "following influencer playbooks blindly",
    alternative_approach: "principle-based, personalized strategy",
    mainstream_view: "quick-fix solutions"
  };
};

const generateMainContent = (prompt: string, contentType: string, tone: string, config: any, framework: string) => {
  const insights = {
    storytelling: [
      `What I discovered fundamentally changed how I approach ${prompt.toLowerCase()}. The breakthrough wasn't in the tactics everyone talks about - it was in understanding the underlying principles that drive real results.`,
      `The turning point came when I stopped copying what others were doing and started analyzing why certain approaches worked for them but not for me. Context matters more than we realize.`,
      `Here's what nobody tells you about ${prompt.toLowerCase()}: sustainable success comes from building systems, not chasing outcomes.`
    ],
    problem_solution: [
      `The root cause isn't what most people think. After working with hundreds of professionals, I've identified the real issue: we're solving the wrong problem.`,
      `Most solutions fail because they address symptoms, not causes. Here's the systematic approach that actually works in 2025.`,
      `The breakthrough happens when you shift from reactive to proactive thinking. Here's how to make that transition effectively.`
    ],
    insight_driven: [
      `The data reveals something fascinating: the most successful professionals in 2025 are doing three things differently when it comes to ${prompt.toLowerCase()}.`,
      `After analyzing thousands of cases, the pattern is clear. It's not about working harder - it's about working with precision and intention.`,
      `The research shows that conventional wisdom is often wrong. Here's what the evidence actually supports.`
    ],
    educational: [
      `Let me break this down into a step-by-step system you can implement immediately. Each step builds on the previous one.`,
      `The framework I'm about to share has been tested across different industries and consistently delivers results. Here's how it works.`,
      `Understanding ${prompt.toLowerCase()} requires mastering these core principles. Once you grasp them, everything else becomes clearer.`
    ],
    contrarian: [
      `While everyone else is zigging, the smartest professionals are zagging. Here's why the conventional approach is actually counterproductive.`,
      `The reason most ${prompt.toLowerCase()} strategies fail isn't complexity - it's that they're built on false assumptions.`,
      `What if everything you've been told about ${prompt.toLowerCase()} is backwards? Here's the alternative perspective that's changing everything.`
    ]
  };

  const frameworkInsights = insights[framework] || insights.educational;
  const selectedInsight = frameworkInsights[Math.floor(Math.random() * frameworkInsights.length)];

  // Generate supporting points based on config
  const supportingPoints = generateSupportingPoints(prompt, config.pointsPerSection);
  
  return `${selectedInsight}\n\n${supportingPoints}`;
};

const generateSupportingPoints = (prompt: string, numPoints: number) => {
  const pointTypes = [
    `First, focus on fundamentals over tactics. While everyone chases the latest ${prompt.toLowerCase()} trends, the basics still drive 80% of results.`,
    `Second, customize your approach. What works for others might not work for you - and that's perfectly fine. Build systems that fit your specific context.`,
    `Third, measure what matters. Vanity metrics feel good but don't drive real progress. Focus on leading indicators that predict success.`,
    `Fourth, iterate based on feedback. The best ${prompt.toLowerCase()} strategies evolve continuously based on real-world results.`,
    `Finally, think long-term. Quick wins are great, but sustainable success requires patience and persistence.`
  ];

  return pointTypes.slice(0, numPoints).join('\n\n');
};

const generateActionableSection = (prompt: string, config: any) => {
  const actionItems = [
    `Start with audit: Evaluate your current ${prompt.toLowerCase()} approach honestly. What's working? What isn't?`,
    `Define success clearly: Set specific, measurable goals that align with your broader objectives.`,
    `Build your system: Create repeatable processes that don't depend on motivation or perfect conditions.`,
    `Test and refine: Implement small experiments, measure results, and adjust based on data.`,
    `Scale what works: Once you find effective approaches, systematize them for consistent results.`
  ];

  const selectedActions = actionItems.slice(0, config.pointsPerSection);
  
  return `Here's how to implement this in 2025:\n\n${selectedActions.map((action, index) => `${index + 1}. ${action}`).join('\n\n')}`;
};

const generateEngagementEnding = (tone: string, contentType: string, prompt: string) => {
  const engagementTypes = {
    professional: [
      `What's been your experience with ${prompt.toLowerCase()}? I'd love to hear your perspective in the comments.`,
      `How do you approach ${prompt.toLowerCase()} in your industry? Share your insights below.`,
      `What would you add to this framework? Your experience could help others in our network.`
    ],
    casual: [
      `Have you tried any of these approaches? Drop a comment and let me know how it goes!`,
      `What's your take on this? I'm always learning from this community.`,
      `Anyone else dealing with similar challenges? Let's discuss in the comments.`
    ],
    inspiring: [
      `Your success in ${prompt.toLowerCase()} starts with a single step. Which one will you take today?`,
      `Remember: every expert was once a beginner. What matters is starting and staying consistent.`,
      `The best time to begin was yesterday. The second best time is now. What's your first move?`
    ]
  };

  const endings = engagementTypes[tone] || engagementTypes.professional;
  const selectedEnding = endings[Math.floor(Math.random() * endings.length)];
  
  const hashtags = [
    '#LinkedIn2025', '#ProfessionalDevelopment', '#Leadership', '#CareerGrowth',
    '#Innovation', '#BusinessStrategy', '#PersonalBranding', '#Networking',
    '#SkillBuilding', '#Productivity', '#Success', '#GrowthMindset'
  ];
  
  const relevantHashtags = hashtags.sort(() => 0.5 - Math.random()).slice(0, 4).join(' ');
  
  return `${selectedEnding}\n\n${relevantHashtags}`;
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

    console.log('Generating advanced content for:', { prompt, tone, length, contentType });

    // Try OpenAI with enhanced prompting
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (openaiKey) {
      try {
        const systemPrompt = `You are a world-class LinkedIn content strategist and professional writer specializing in creating viral, engaging content for 2025. Your expertise includes:

- Deep understanding of LinkedIn algorithm and engagement patterns
- Master of storytelling, persuasion, and professional communication
- Ability to create authentic, valuable content that drives real engagement
- Expert in various content frameworks: storytelling, problem-solution, insight-driven, educational, and contrarian approaches
- Skilled at making complex topics accessible and actionable

Create content that:
✅ Feels authentic and personal, not generic or templated
✅ Provides genuine value and actionable insights
✅ Uses compelling hooks and storytelling elements
✅ Includes specific examples and concrete details
✅ Ends with engaging questions that drive comments
✅ Reflects 2025 trends and current professional challenges
✅ Balances professionalism with personality

Current year: 2025. Focus on contemporary challenges and opportunities.`;

        const userPrompt = `Create a ${length} LinkedIn post about "${prompt}" with a ${tone} tone for ${contentType} content.

Requirements:
- Length: ${length === 'short' ? '300-500 words' : length === 'medium' ? '600-900 words' : '1000-1400 words'}
- Include a compelling hook that stops scrolling
- Use storytelling elements and specific examples
- Provide actionable insights and practical value
- End with an engaging question that encourages comments
- Make it feel authentic and conversational, not corporate
- Include relevant hashtags (4-6 maximum)
- Reflect 2025 professional landscape and challenges

Avoid:
❌ Generic advice or obvious insights
❌ Overly promotional language
❌ Cliché phrases or buzzwords
❌ Template-like structure
❌ Excessive hashtags or emoji`;

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
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 1100 : 1600,
            temperature: 0.8,
            presence_penalty: 0.3,
            frequency_penalty: 0.5,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content) {
            console.log('Generated advanced content with OpenAI successfully');
            return new Response(JSON.stringify({ content, source: 'openai_enhanced' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('OpenAI enhanced failed, trying Anthropic:', error.message);
      }
    }

    if (anthropicKey) {
      try {
        const anthropicPrompt = `Create a compelling ${length} LinkedIn post about "${prompt}" with a ${tone} tone.

Make it engaging, authentic, and valuable for professionals in 2025. Requirements:
- Start with a compelling hook
- Include storytelling elements and specific examples  
- Provide actionable insights
- End with an engaging question
- Target length: ${length === 'short' ? '300-500' : length === 'medium' ? '600-900' : '1000-1400'} words
- Feel conversational and authentic, not corporate
- Include 4-6 relevant hashtags

Focus on 2025 professional challenges and make it feel personal and valuable, not generic.`;

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: length === 'short' ? 600 : length === 'medium' ? 1100 : 1600,
            temperature: 0.8,
            messages: [{ role: 'user', content: anthropicPrompt }]
          }),
        });

        if (anthropicResponse.ok) {
          const data = await anthropicResponse.json();
          const content = data.content[0]?.text;
          if (content) {
            console.log('Generated advanced content with Anthropic successfully');
            return new Response(JSON.stringify({ content, source: 'anthropic_enhanced' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (error) {
        console.log('Anthropic enhanced failed, using advanced fallback:', error.message);
      }
    }

    // Advanced fallback with sophisticated content generation
    console.log('Using advanced fallback content generation');
    const advancedContent = await generateAdvancedContent(prompt, tone, length, contentType);
    
    return new Response(JSON.stringify({ 
      content: advancedContent, 
      source: 'advanced_fallback',
      note: 'Generated using advanced content frameworks. For best results, configure OpenAI or Anthropic API keys.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Advanced content generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation temporarily unavailable. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
