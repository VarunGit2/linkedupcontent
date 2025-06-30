
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb } from 'lucide-react';

const GenerateIdeas: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [interests, setInterests] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateIdeas = async () => {
    if (!industry.trim()) {
      toast({
        title: "Error",
        description: "Please enter your industry or field.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a creative content strategist specializing in LinkedIn content. Generate engaging, relevant, and professional LinkedIn post ideas that will drive engagement and provide value to the professional community.'
            },
            {
              role: 'user',
              content: `Generate 8 creative LinkedIn post ideas for someone in the ${industry} industry. ${interests ? `Their interests include: ${interests}.` : ''} ${targetAudience ? `Their target audience is: ${targetAudience}.` : ''} Each idea should be engaging and professional. Return only the ideas, one per line, without numbering.`
            }
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ideas');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const ideaList = content.split('\n').filter(idea => idea.trim().length > 0).slice(0, 8);
      
      setIdeas(ideaList);
      toast({
        title: "Ideas Generated!",
        description: `Generated ${ideaList.length} LinkedIn post ideas for you.`,
      });
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useIdea = (idea: string) => {
    navigator.clipboard.writeText(idea);
    toast({
      title: "Idea Copied!",
      description: "The idea has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Generate Blog Ideas</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Get creative LinkedIn post ideas tailored to your industry and audience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tell Us About You</CardTitle>
            <CardDescription>
              Help us generate personalized content ideas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="industry">Industry/Field *</Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Marketing, Finance"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                placeholder="e.g., AI, Leadership, Startups"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Entrepreneurs, Developers, Managers"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <Button 
              onClick={generateIdeas} 
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Generate Ideas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Ideas Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Content Ideas</CardTitle>
              <CardDescription>
                Click on any idea to copy it to your clipboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ideas.length > 0 ? (
                <div className="space-y-3">
                  {ideas.map((idea, index) => (
                    <div
                      key={index}
                      onClick={() => useIdea(idea)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary pr-4">
                          {idea}
                        </p>
                        <Badge variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to Copy
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="text-center">
                    <Lightbulb className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>Your generated ideas will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateIdeas;
