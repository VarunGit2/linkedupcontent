
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy, Calendar, AlertTriangle, RefreshCw, Settings, TrendingUp, Target, Lightbulb, History, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CreateContent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [contentType, setContentType] = useState('general');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [contentHistory, setContentHistory] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    const savedContentHistory = localStorage.getItem('content-history');
    const savedSearchHistory = localStorage.getItem('search-history');
    
    if (savedContentHistory) {
      setContentHistory(JSON.parse(savedContentHistory));
    }
    if (savedSearchHistory) {
      setSearchHistory(JSON.parse(savedSearchHistory));
    }
  }, []);

  // Save search to history
  const saveSearchToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updatedSearchHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
    setSearchHistory(updatedSearchHistory);
    localStorage.setItem('search-history', JSON.stringify(updatedSearchHistory));
  };

  // Professional content suggestions for 2025
  const contentSuggestions = {
    leadership: [
      "Leading hybrid teams effectively in 2025: strategies that actually work",
      "The biggest leadership mistake I see in remote work environments",
      "How to build trust with team members you've never met in person",
      "Why emotional intelligence is the #1 leadership skill for 2025"
    ],
    career: [
      "Skills that will make you irreplaceable in the AI era",
      "How I pivoted my career in 6 months without starting from scratch",
      "The networking approach that landed me 3 job offers",
      "Why your next promotion depends more on communication than technical skills"
    ],
    business: [
      "Customer acquisition strategies that work in a saturated market",
      "How we reduced churn by 40% with one simple change",
      "The pricing mistake that's costing you customers",
      "Building a business that thrives during economic uncertainty"
    ],
    innovation: [
      "How AI is reshaping our industry (and what it means for you)",
      "The innovation framework that helped us launch 5 successful products",
      "Why most companies fail at digital transformation",
      "Balancing innovation with operational excellence"
    ]
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Content Topic",
        description: "Please enter a topic or use one of our suggestions to generate content.",
        variant: "destructive",
      });
      return;
    }

    // Save search to history
    saveSearchToHistory(prompt);
    
    setIsGenerating(true);
    setError('');
    
    try {
      console.log('Starting enhanced content generation for 2025...');
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: prompt,
          tone: tone,
          length: length,
          type: 'content',
          contentType: contentType
        }
      });

      console.log('Enhanced generation response:', { data, error: functionError });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message || 'Content generation failed');
      }

      if (data?.error) {
        setError(data.error);
        toast({
          title: "Generation Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.content) {
        setGeneratedContent(data.content);
        
        // Add to content history (keep last 5)
        const newHistory = [data.content, ...contentHistory].slice(0, 5);
        setContentHistory(newHistory);
        localStorage.setItem('content-history', JSON.stringify(newHistory));
        
        toast({
          title: "Content Generated Successfully! ✨",
          description: `High-quality LinkedIn post ready! ${data.source ? `(Generated via ${data.source})` : ''}`,
        });

        // Update generation counter
        const currentCount = parseInt(localStorage.getItem('content-generated') || '0');
        localStorage.setItem('content-generated', (currentCount + 1).toString());
      } else {
        throw new Error('No content received from AI service');
      }

    } catch (error) {
      console.error('Enhanced content generation error:', error);
      const errorMessage = error.message || 'Failed to generate content';
      setError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: "Please check your API configuration in settings or try again with a different prompt.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    toast({
      title: "Suggestion Applied! 💡",
      description: "Feel free to customize the prompt before generating content.",
    });
  };

  const useSearchHistory = (searchTerm: string) => {
    setPrompt(searchTerm);
    toast({
      title: "Search History Used! 🔍",
      description: "Previous search applied as prompt.",
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
    toast({
      title: "Search History Cleared",
      description: "All previous searches have been removed.",
    });
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

  const regenerateContent = () => {
    if (prompt.trim()) {
      generateContent();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-0">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Content Creator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-base sm:text-lg px-4">
          Generate high-quality, engaging LinkedIn posts with advanced AI ✨
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Content Suggestions */}
        <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              Content Ideas
            </CardTitle>
            <CardDescription className="text-sm">
              Click any suggestion to use as your starting point
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="space-y-4">
              {Object.entries(contentSuggestions).map(([category, suggestions]) => (
                <div key={category}>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 capitalize flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {suggestions.slice(0, 2).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="w-full text-left p-2 sm:p-3 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Search History Section */}
            {searchHistory.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <History className="h-3 w-3" />
                    Recent Searches
                  </h4>
                  <Button
                    onClick={clearSearchHistory}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => useSearchHistory(search)}
                      className="w-full text-left p-2 text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-md border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Content Configuration
            </CardTitle>
            <CardDescription className="text-sm">
              Customize your content generation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 p-4 sm:p-6">
            <div>
              <Label htmlFor="prompt" className="text-sm font-semibold">Your Topic or Idea</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to write about... (e.g., 'Leadership challenges in remote work', 'Career pivot strategy', 'Innovation in fintech')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] mt-2 border-2 focus:border-blue-500 transition-colors text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific for better results. Include context, industry, or personal angle.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="contentType" className="text-sm font-semibold">Content Focus</Label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full p-2 sm:p-3 mt-2 border-2 border-input rounded-md bg-background focus:border-blue-500 transition-colors text-sm"
                >
                  <option value="general">General Professional</option>
                  <option value="leadership">Leadership & Management</option>
                  <option value="career">Career Development</option>
                  <option value="business">Business Strategy</option>
                  <option value="innovation">Innovation & Technology</option>
                  <option value="industry">Industry Insights</option>
                </select>
              </div>

              <div>
                <Label htmlFor="tone" className="text-sm font-semibold">Writing Tone</Label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 sm:p-3 mt-2 border-2 border-input rounded-md bg-background focus:border-blue-500 transition-colors text-sm"
                >
                  <option value="professional">Professional & Authoritative</option>
                  <option value="casual">Conversational & Approachable</option>
                  <option value="inspirational">Motivational & Inspiring</option>
                  <option value="educational">Educational & Informative</option>
                  <option value="thought-leadership">Thought Leadership</option>
                </select>
              </div>

              <div>
                <Label htmlFor="length" className="text-sm font-semibold">Content Length</Label>
                <select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-2 sm:p-3 mt-2 border-2 border-input rounded-md bg-background focus:border-blue-500 transition-colors text-sm"
                >
                  <option value="short">Short (200-300 words) - Quick insights</option>
                  <option value="medium">Medium (400-600 words) - Detailed thoughts</option>
                  <option value="long">Long (700-1000 words) - In-depth analysis</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Generation Error</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                  <Settings className="h-3 w-3" />
                  <span>Check API configuration in Profile Settings</span>
                </div>
              </div>
            )}

            <Button 
              onClick={generateContent} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 h-auto shadow-lg text-sm sm:text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Generate Professional Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Generated Content
            </CardTitle>
            <CardDescription className="text-sm">
              Your AI-generated professional content
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            {generatedContent ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[250px] sm:min-h-[300px] border-2 focus:border-purple-500 transition-colors text-sm leading-relaxed"
                  placeholder="Your generated content will appear here..."
                />
                
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" className="flex-1 border-2 hover:bg-gray-50 text-sm">
                      <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Copy
                    </Button>
                    <Button onClick={regenerateContent} variant="outline" className="border-2 hover:bg-gray-50 px-2 sm:px-3">
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button onClick={clearContent} variant="outline" className="border-2 hover:bg-gray-50 text-red-600 px-2 sm:px-3">
                      Clear
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContent);
                      toast({
                        title: "Ready to Schedule! 📅",
                        description: "Content copied! Go to Schedule Posts to publish it.",
                      });
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm sm:text-base"
                  >
                    <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Copy & Schedule This Post
                  </Button>
                </div>

                {/* Word count and quality indicators */}
                <div className="text-xs text-gray-500 flex justify-between items-center pt-2 border-t">
                  <span>{generatedContent.split(' ').length} words</span>
                  <span>{generatedContent.length} characters</span>
                </div>
              </div>
            ) : (
              <div className="min-h-[250px] sm:min-h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-center px-4">
                  <Sparkles className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
                  <p className="text-base sm:text-lg font-medium">AI-generated content will appear here</p>
                  <p className="text-sm text-gray-400 mt-1">Enter your topic and click generate to start</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content History */}
      {contentHistory.length > 0 && (
        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Recent Content
            </CardTitle>
            <CardDescription className="text-sm">
              Your recently generated content pieces
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {contentHistory.slice(0, 3).map((content, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm line-clamp-2 mb-2">{content}</p>
                  <Button
                    onClick={() => {
                      setGeneratedContent(content);
                      toast({
                        title: "Content Restored",
                        description: "Previous content loaded for editing.",
                      });
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Use This Content
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateContent;
