
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send } from 'lucide-react';

interface SuggestionBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ isOpen, onClose }) => {
  const [suggestion, setSuggestion] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('feature');
  const { toast } = useToast();

  const submitSuggestion = () => {
    if (!suggestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter your suggestion.",
        variant: "destructive",
      });
      return;
    }

    // Simulate submission
    toast({
      title: "Suggestion Submitted!",
      description: "Thank you for your feedback. We'll review it and get back to you soon.",
    });

    // Reset form and close
    setSuggestion('');
    setEmail('');
    setCategory('feature');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Share Your Suggestion
          </CardTitle>
          <CardDescription>
            Help us improve LinkedUp with your ideas and feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement</option>
              <option value="bug">Bug Report</option>
              <option value="general">General Feedback</option>
            </select>
          </div>

          <div>
            <Label htmlFor="suggestion">Your Suggestion *</Label>
            <Textarea
              id="suggestion"
              placeholder="Tell us what you'd like to see improved or added to LinkedUp..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll only use this to follow up on your suggestion
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={submitSuggestion} className="flex-1 bg-primary hover:bg-primary/90">
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionBox;
