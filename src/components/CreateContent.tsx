import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PenTool, Wand2, Copy, CheckCircle, Sparkles, Target, Users, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CreateContent: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [interests, setInterests] = useState('');
  const [writingTone, setWritingTone] = useState('professional');
  const [contentLength, setContentLength] = useState('medium');
  const [contentFocus, setContentFocus] = useState('general');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contentQuality, setContentQuality] = useState('');
  const [contentSource, setContentSource] = useState('');
  const { toast } = useToast();

  // Load saved content on component mount
  useEffect(() => {
    const savedContent = sessionStorage.getItem('createContent_generatedContent');
    const savedTopic = sessionStorage.getItem('createContent_topic');
    const savedIndustry = sessionStorage.getItem('createContent_industry');
    const savedAudience = sessionStorage.getItem('createContent_audience');
    const savedInterests = sessionStorage.getItem('createContent_interests');
    const savedTone = sessionStorage.getItem('createContent_writingTone');
    const savedLength = sessionStorage.getItem('createContent_contentLength');
    const savedFocus = sessionStorage.getItem('createContent_contentFocus');
    
    if (savedContent) setGeneratedContent(savedContent);
    if (savedTopic) setTopic(savedTopic);
    if (savedIndustry) setIndustry(savedIndustry);
    if (savedAudience) setAudience(savedAudience);
    if (savedInterests) setInterests(savedInterests);
    if (savedTone) setWritingTone(savedTone);
    if (savedLength) setContentLength(savedLength);
    if (savedFocus) setContentFocus(savedFocus);
  }, []);

  // Save content to session storage whenever it changes
  useEffect(() => {
    if (generatedContent) {
      sessionStorage.setItem('createContent_generatedContent', generatedContent);
    }
  }, [generatedContent]);

  // Save form data to session storage
  useEffect(() => {
    sessionStorage.setItem('createContent_topic', topic);
    sessionStorage.setItem('createContent_industry', industry);
    sessionStorage.setItem('createContent_audience', audience);
    sessionStorage.setItem('createContent_interests', interests);
    sessionStorage.setItem('createContent_writingTone', writingTone);
    sessionStorage.setItem('createContent_contentLength', contentLength);
    sessionStorage.setItem('createContent_contentFocus', contentFocus);
  }, [topic, industry, audience, interests, writingTone, contentLength, contentFocus]);

  const generateContent = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your LinkedIn post.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setContentQuality('');
    setContentSource('');

    try {
      console.log('Generating content with parameters:', {
        topic, writingTone, contentLength, contentFocus, industry, audience, interests
      });

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: topic,
          type: 'content',
          writingTone,
          contentLength,
          contentFocus,
          industry,
          audience,
          interests
        }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedContent(data.content);
        setContentQuality(data.quality || 'good');
        setContentSource(data.source || 'template');
        
        const qualityEmoji = data.quality === 'premium' ? '🚀' : data.quality === 'high' ? '✨' : '👍';
        
        toast({
          title: `${qualityEmoji} Content Generated Successfully!`,
          description: `High-quality LinkedIn post created with ${data.source?.replace('_', ' ').toUpperCase()} AI`,
        });
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy content. Please try manually.",
        variant: "destructive",
      });
    }
  };

  const getQualityBadge = () => {
    const badges: { [key: string]: { color: string; text: string; desc: string } } = {
      premium: { color: 'bg-gradient-to-r from-purple-600 to-pink-600', text: '🚀 Premium AI', desc: 'Groq Llama 70B' },
      high: { color: 'bg-gradient-to-r from-blue-600 to-indigo-600', text: '✨ High Quality', desc: 'OpenAI GPT-4o-mini' },
      good: { color: 'bg-gradient-to-r from-green-600 to-emerald-600', text: '👍 Good', desc: 'Enhanced Template' }
    };
    
    const badge = badges[contentQuality] || badges.good;
    return (
      <Badge className={`${badge.color} text-white border-0 text-xs`}>
        {badge.text} ({badge.desc})
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create LinkedIn Content
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-base sm:text-lg px-4">
          Generate viral LinkedIn posts with AI-powered content creation 🚀
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PenTool className="h-5 w-5 text-blue-600" />
              Content Parameters
            </CardTitle>
            <CardDescription>
              Customize your content generation with specific parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Topic Input */}
            <div>
              <Label htmlFor="topic" className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                Content Topic *
              </Label>
              <Textarea
                id="topic"
                placeholder="e.g., Remote work productivity tips, AI in marketing, Career growth strategies..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[80px] border-2 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4" />
                  Writing Tone
                </Label>
                <Select value={writingTone} onValueChange={setWritingTone}>
                  <SelectTrigger className="border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">🎯 Professional</SelectItem>
                    <SelectItem value="casual">😊 Casual & Friendly</SelectItem>
                    <SelectItem value="inspirational">💪 Inspirational</SelectItem>
                    <SelectItem value="educational">📚 Educational</SelectItem>
                    <SelectItem value="humorous">😄 Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">📏 Content Length</Label>
                <Select value={contentLength} onValueChange={setContentLength}>
                  <SelectTrigger className="border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">⚡ Short (150-250 words)</SelectItem>
                    <SelectItem value="medium">📝 Medium (400-600 words)</SelectItem>
                    <SelectItem value="long">📖 Long (800+ words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">🎯 Content Focus</Label>
                <Select value={contentFocus} onValueChange={setContentFocus}>
                  <SelectTrigger className="border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">🌟 General Professional</SelectItem>
                    <SelectItem value="thought-leadership">🧠 Thought Leadership</SelectItem>
                    <SelectItem value="personal-story">❤️ Personal Story</SelectItem>
                    <SelectItem value="industry-insights">📊 Industry Insights</SelectItem>
                    <SelectItem value="tips-advice">💡 Tips & Advice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Target Audience
                </Label>
                <Input
                  placeholder="e.g., developers, marketers..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="border-2 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Additional Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">🏢 Industry</Label>
                <Input
                  placeholder="e.g., tech, finance, marketing..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="border-2 focus:border-blue-500"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">⭐ Key Interests</Label>
                <Input
                  placeholder="e.g., AI, leadership, innovation..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="border-2 focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              onClick={generateContent}
              disabled={!topic.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold py-3 h-auto text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Premium Content...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Viral Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Generated Content
                </CardTitle>
                <CardDescription>
                  AI-powered LinkedIn post ready to publish
                </CardDescription>
              </div>
              {contentQuality && getQualityBadge()}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 border-2 rounded-xl p-6 min-h-[300px]">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {generatedContent}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Content
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={generateContent}
                    variant="outline"
                    disabled={isGenerating}
                    className="flex-1 border-2"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>

                {contentSource && (
                  <div className="text-xs text-gray-500 text-center">
                    Generated using: {contentSource.replace('_', ' ').toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <div className="min-h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                  <Wand2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Ready to create viral content?</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Fill in your topic and parameters, then click generate
                  </p>
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
