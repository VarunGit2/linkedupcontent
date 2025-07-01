
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy, Calendar, AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CreateContent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or prompt for content generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('Starting content generation...');
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: `Create a LinkedIn post about: ${prompt}`,
          tone,
          length,
          type: 'content'
        }
      });

      console.log('Function response:', { data, error: functionError });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message || 'Function call failed');
      }

      if (data?.error) {
        setError(data.error);
        toast({
          title: "Content Generation Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.content) {
        setGeneratedContent(data.content);
        toast({
          title: "Content Generated Successfully! ✨",
          description: "Your LinkedIn post has been created.",
        });

        const currentCount = parseInt(localStorage.getItem('content-generated') || '0');
        localStorage.setItem('content-generated', (currentCount + 1).toString());
      } else {
        throw new Error('No content received from AI service');
      }

    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error.message || 'Failed to generate content';
      setError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: "AI service is temporarily unavailable. Please check your API configuration or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied! 📋",
      description: "Content copied to clipboard.",
    });
  };

  const clearContent = () => {
    setGeneratedContent('');
    setError('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Content
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
          Generate engaging LinkedIn posts using AI ✨
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Content Settings
            </CardTitle>
            <CardDescription>
              Configure your content preferences and generate your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label htmlFor="prompt" className="text-sm font-semibold">Topic or Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter the topic or idea you want to create content about..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] mt-2 border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone" className="text-sm font-semibold">Tone</Label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 mt-2 border-2 border-input rounded-md bg-background focus:border-blue-500 transition-colors"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                  <option value="humorous">Humorous</option>
                </select>
              </div>

              <div>
                <Label htmlFor="length" className="text-sm font-semibold">Length</Label>
                <select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-3 mt-2 border-2 border-input rounded-md bg-background focus:border-blue-500 transition-colors"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Generation Error</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                  <Settings className="h-3 w-3" />
                  <span>API configuration may need to be updated in Settings</span>
                </div>
              </div>
            )}

            <Button 
              onClick={generateContent} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 h-auto shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-purple-600" />
              Generated Content
            </CardTitle>
            <CardDescription>
              Your AI-generated LinkedIn post will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {generatedContent ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[250px] border-2 focus:border-purple-500 transition-colors"
                  placeholder="Your generated content will appear here..."
                />
                <div className="flex space-x-3">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1 border-2 hover:bg-gray-50">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={clearContent} variant="outline" className="border-2 hover:bg-gray-50">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Post
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Generated content will appear here</p>
                  <p className="text-sm text-gray-400 mt-1">Start by entering a topic above</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateContent;
