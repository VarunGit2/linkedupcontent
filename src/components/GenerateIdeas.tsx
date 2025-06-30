
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, Target, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: `Generate 8 creative LinkedIn post ideas for someone in the ${industry} industry. ${interests ? `Their interests include: ${interests}.` : ''} ${targetAudience ? `Their target audience is: ${targetAudience}.` : ''} Each idea should be engaging and professional.`,
          type: 'ideas'
        }
      });

      if (error) throw error;

      const ideaList = data.content.split('\n').filter((idea: string) => idea.trim().length > 0).slice(0, 8);
      
      setIdeas(ideaList);
      toast({
        title: "Ideas Generated! 💡",
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
      title: "Idea Copied! 📋",
      description: "The idea has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Generate Ideas
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Get creative LinkedIn post ideas tailored to your industry 💡
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <Card className="lg:col-span-1 border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Tell Us About You
            </CardTitle>
            <CardDescription>
              Help us generate personalized content ideas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label htmlFor="industry" className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Industry/Field *
              </Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Marketing, Finance"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-2 border-2 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="interests" className="text-sm font-semibold">Interests</Label>
              <Input
                id="interests"
                placeholder="e.g., AI, Leadership, Startups"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="mt-2 border-2 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="audience" className="text-sm font-semibold">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Entrepreneurs, Developers, Managers"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-2 border-2 focus:border-green-500 transition-colors"
              />
            </div>

            <Button 
              onClick={generateIdeas} 
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 h-auto shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Generate Ideas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Ideas Section */}
        <div className="lg:col-span-2">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                Your Content Ideas
              </CardTitle>
              <CardDescription>
                Click on any idea to copy it to your clipboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {ideas.length > 0 ? (
                <div className="space-y-4">
                  {ideas.map((idea, index) => (
                    <div
                      key={index}
                      onClick={() => useIdea(idea)}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 pr-4 font-medium">
                          {idea}
                        </p>
                        <Badge variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 text-blue-700 hover:bg-blue-200">
                          Click to Copy
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <div className="text-center">
                    <Lightbulb className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Your generated ideas will appear here</p>
                    <p className="text-sm text-gray-400 mt-1">Fill in your details and click generate</p>
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
