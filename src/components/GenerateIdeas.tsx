
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, Target, Briefcase, Sparkles, TrendingUp, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const GenerateIdeas: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [interests, setInterests] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ideaCount, setIdeaCount] = useState('6');
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
      const promptContext = `Generate ${ideaCount} professional LinkedIn post ideas for someone in the ${industry} industry.${interests ? ` Their interests include: ${interests}.` : ''}${targetAudience ? ` Their target audience is: ${targetAudience}.` : ''} Each idea should be engaging, thought-provoking, and designed to spark conversations. Make them unique and actionable.`;

      console.log('Sending prompt:', promptContext);

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: promptContext,
          type: 'ideas',
          ideaCount: parseInt(ideaCount),
          industry,
          audience: targetAudience,
          interests
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Received response:', data);

      if (!data?.content) {
        throw new Error('No content received from AI service');
      }

      // Parse the numbered list of ideas
      const ideaLines = data.content.split('\n').filter((line: string) => {
        const trimmed = line.trim();
        return trimmed.length > 0 && (trimmed.match(/^\d+\./) || trimmed.length > 20);
      });

      // Clean up the ideas by removing numbers and extra whitespace
      const cleanIdeas = ideaLines.map((line: string) => {
        return line.replace(/^\d+\.\s*/, '').trim();
      }).filter((idea: string) => idea.length > 10);

      if (cleanIdeas.length === 0) {
        throw new Error('No valid ideas could be extracted from the response');
      }

      setIdeas(cleanIdeas);
      
      toast({
        title: "🚀 Amazing Ideas Generated!",
        description: `Created ${cleanIdeas.length} high-quality LinkedIn post ideas using ${data.source || 'AI'}.`,
      });

    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate ideas. Please check your inputs and try again.",
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
      description: "The idea has been copied to your clipboard. Ready to create your post!",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Generate Ideas
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Get professional LinkedIn post ideas powered by advanced AI 🚀
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
              Help us generate personalized, high-quality content ideas
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
                placeholder="e.g., Technology, Marketing, Finance, Healthcare"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-2 border-2 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="interests" className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Interests (Optional)
              </Label>
              <Input
                id="interests"
                placeholder="e.g., AI, Leadership, Startups, Innovation"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="mt-2 border-2 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="audience" className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Target Audience (Optional)
              </Label>
              <Input
                id="audience"
                placeholder="e.g., Entrepreneurs, Developers, C-Suite Executives"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-2 border-2 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4" />
                Number of Ideas
              </Label>
              <Select value={ideaCount} onValueChange={setIdeaCount}>
                <SelectTrigger className="border-2 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Ideas</SelectItem>
                  <SelectItem value="5">5 Ideas</SelectItem>
                  <SelectItem value="6">6 Ideas</SelectItem>
                  <SelectItem value="8">8 Ideas</SelectItem>
                  <SelectItem value="10">10 Ideas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateIdeas} 
              disabled={isGenerating || !industry.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 h-auto shadow-lg disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating {ideaCount} Premium Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Generate {ideaCount} Professional Ideas
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
                Your Professional Content Ideas
              </CardTitle>
              <CardDescription>
                High-quality LinkedIn post ideas ready to use - click to copy
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
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              Idea #{index + 1}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium leading-relaxed">
                            {idea}
                          </p>
                        </div>
                        <Badge variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-100 text-green-700 hover:bg-green-200 shrink-0">
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
                    <p className="text-lg font-medium">Professional LinkedIn ideas will appear here</p>
                    <p className="text-sm text-gray-400 mt-1">Enter your industry and click generate to get started</p>
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
