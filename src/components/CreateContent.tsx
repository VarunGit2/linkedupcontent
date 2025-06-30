
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CreateContent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
              content: `You are a professional LinkedIn content creator. Create engaging LinkedIn posts that are ${tone} in tone and ${length} in length. Include relevant hashtags and make the content engaging for professional audiences.`
            },
            {
              role: 'user',
              content: `Create a LinkedIn post about: ${prompt}`
            }
          ],
          max_tokens: length === 'short' ? 150 : length === 'medium' ? 300 : 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      setGeneratedContent(content);
      toast({
        title: "Content Generated!",
        description: "Your LinkedIn post has been created successfully.",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Content</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Generate engaging LinkedIn posts using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Content Settings</CardTitle>
            <CardDescription>
              Configure your content preferences and generate your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Topic or Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter the topic or idea you want to create content about..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div>
                <Label htmlFor="length">Length</Label>
                <select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>

            <Button 
              onClick={generateContent} 
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated LinkedIn post will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Your generated content will appear here..."
                />
                <div className="flex space-x-2">
                  <Button onClick={copyToClipboard} variant="outline">
                    Copy to Clipboard
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Schedule Post
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                Generated content will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateContent;
