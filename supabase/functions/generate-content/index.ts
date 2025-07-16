
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
    const { prompt, type = 'ideas' } = await req.json();
    
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Please provide a topic for content generation' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating premium LinkedIn content for:', prompt);

    // Try Groq first (should be the best now with your new API key)
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try {
        console.log('Using Groq Llama for high-quality content generation...');
        
        const systemPrompt = `You are an elite LinkedIn content strategist who creates viral, professional posts that get 10K+ views. You understand LinkedIn psychology and create content that stops the scroll.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 8 complete, professional LinkedIn post IDEAS (not full posts, just concise ideas)
2. Each idea should be 1-2 sentences maximum
3. Ideas must be specific, actionable, and engaging
4. Focus on professional insights, industry trends, career advice, or thought leadership
5. Make them conversation starters that encourage engagement

CONTENT PSYCHOLOGY:
- Use curiosity gaps ("The mistake 90% of developers make...")
- Include specific numbers and statistics
- Challenge conventional wisdom
- Share contrarian viewpoints
- Focus on transformation stories
- Include industry-specific insights

FORMAT: Return exactly 8 numbered ideas, each on a new line.

EXAMPLE OUTPUT:
1. The coding mistake that cost me $50K and how you can avoid it
2. Why remote work is actually killing productivity (unpopular opinion)
3. 5 AI tools that replaced my entire workflow in 2024
4. The interview question that reveals if a developer will succeed
5. Why your GitHub profile is more important than your resume
6. The soft skill that separates senior developers from the rest
7. How I went from junior dev to tech lead in 18 months
8. The programming language everyone should learn in 2025`;

        const userPrompt = `Generate 8 professional LinkedIn post ideas for: ${prompt}

Requirements:
- Each idea should be engaging and professional
- Focus on industry insights, career advice, or thought leadership
- Make them conversation starters
- Include specific, actionable topics
- Target professional audience on LinkedIn

Industry context: ${prompt}`;

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
            max_tokens: 1000,
            temperature: 0.8,
            top_p: 0.9,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('High-quality content generated with Groq Llama');
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
        console.log('Groq failed, trying other options:', error.message);
      }
    }

    // Try OpenAI GPT-4.1 as backup
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        console.log('Using OpenAI GPT-4.1 as backup...');
        
        const systemPrompt = `You are a professional LinkedIn content strategist. Generate exactly 8 high-quality LinkedIn post ideas.

REQUIREMENTS:
- Each idea must be a complete, specific topic (1-2 sentences)
- Professional and engaging
- Industry-relevant and thought-provoking
- Designed to spark conversations and engagement
- Include specific angles or unique perspectives

FORMAT: Return exactly 8 numbered ideas, each on a new line.`;

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
              { role: 'user', content: `Generate 8 professional LinkedIn post ideas for: ${prompt}` }
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const content = data.choices[0]?.message?.content;
          if (content && content.length > 100) {
            console.log('Quality content generated with OpenAI GPT-4.1');
            return new Response(JSON.stringify({ 
              content, 
              source: 'openai_gpt4.1',
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

    // Enhanced fallback with better templates
    console.log('Using enhanced template system');
    const content = generateHighQualityIdeas(prompt);
    
    return new Response(JSON.stringify({ 
      content, 
      source: 'enhanced_template',
      quality: 'good'
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

function generateHighQualityIdeas(prompt: string): string {
  const industry = prompt.toLowerCase();
  
  const ideaTemplates = [
    `The biggest misconception about ${industry} that's costing professionals their careers`,
    `5 ${industry} trends that will dominate 2025 (and how to prepare for them)`,
    `Why traditional ${industry} advice is outdated and what to do instead`,
    `The ${industry} skill that separates high performers from the average`,
    `How I transformed my ${industry} career with this one mindset shift`,
    `The ${industry} mistake I see 90% of professionals making`,
    `3 ${industry} predictions that will shock you (but I'm confident about)`,
    `The uncomfortable truth about ${industry} that nobody talks about`
  ];

  const specificIdeas = {
    'tech': [
      'The coding bootcamp graduate who outperformed CS majors (here\'s their secret)',
      'Why your technical skills matter less than you think for career growth',
      'The programming language debate that\'s dividing senior developers',
      'How AI is changing what it means to be a software engineer in 2025',
      'The soft skill that made me a better developer than any framework',
      'Why code reviews are broken and how to fix them',
      'The startup technology stack that failed spectacularly (lessons learned)',
      'How I went from junior dev to engineering manager in 2 years'
    ],
    'marketing': [
      'The marketing campaign that failed but taught me everything about customers',
      'Why ROI metrics are lying to you about campaign performance',
      'The psychology trick that increased our conversion rate by 340%',
      'How personalization became the death of authentic marketing',
      'The B2B marketing strategy that tripled our qualified leads',
      'Why most marketing attribution models are completely wrong',
      'The content marketing mistake that\'s killing your engagement',
      'How we turned our biggest marketing failure into our greatest success'
    ],
    'finance': [
      'The investment strategy that beat the market for 5 years straight',
      'Why traditional financial advice is keeping you poor',
      'The money mindset shift that doubled my net worth',
      'How I learned to read financial statements in 30 minutes',
      'The budgeting method that actually works (and it\'s not 50/30/20)',
      'Why financial advisors don\'t want you to know this',
      'The cryptocurrency lesson that cost me $10K but saved my portfolio',
      'How compound interest really works (with real examples)'
    ]
  };

  let selectedIdeas: string[];
  
  if (specificIdeas[industry]) {
    selectedIdeas = specificIdeas[industry];
  } else {
    selectedIdeas = ideaTemplates;
  }

  return selectedIdeas.slice(0, 8).map((idea, index) => `${index + 1}. ${idea}`).join('\n');
}
