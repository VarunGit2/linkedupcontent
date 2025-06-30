
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your LinkedUp assistant. I can help you with questions about creating content, scheduling posts, and using the platform. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const predefinedResponses: { [key: string]: string } = {
    'how to create content': "To create content: 1) Go to the 'Create Content' page, 2) Enter your topic or prompt, 3) Select tone and length preferences, 4) Click 'Generate Content'. The AI will create a LinkedIn post for you!",
    'how to generate ideas': "To generate ideas: 1) Visit the 'Generate Ideas' page, 2) Enter your industry and interests, 3) Specify your target audience, 4) Click 'Generate Ideas' to get 8 creative LinkedIn post ideas!",
    'how to schedule posts': "To schedule posts: 1) Go to 'Schedule Posts', 2) Connect your LinkedIn account, 3) Write your post content, 4) Select date and time, 5) Click 'Schedule Post' or 'Post Now'.",
    'connect linkedin': "To connect LinkedIn: 1) Go to the 'Schedule Posts' page, 2) Click 'Connect LinkedIn' button, 3) You'll be redirected to LinkedIn for authorization, 4) Once connected, you can schedule and publish posts directly!",
    'pricing': "LinkedUp offers flexible pricing plans. Contact our support team for detailed pricing information and to find the plan that best fits your needs.",
    'support': "For additional support, you can: 1) Use this chatbot for quick questions, 2) Check our FAQ section, 3) Contact our support team via email, 4) Submit feedback through the suggestion box.",
    'features': "LinkedUp features include: 1) AI-powered content creation, 2) Blog idea generation, 3) LinkedIn post scheduling, 4) Post preview functionality, 5) Dark/light theme, 6) User profile management, and more!"
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default responses for common patterns
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! Welcome to LinkedUp. I'm here to help you with any questions about our platform. What would you like to know?";
    }
    
    if (lowerMessage.includes('help')) {
      return "I can help you with: creating content, generating ideas, scheduling posts, connecting LinkedIn, features overview, and general platform questions. What specific topic interests you?";
    }

    return "I understand you're asking about something specific. Here are the main topics I can help with: creating content, generating ideas, scheduling posts, connecting LinkedIn, platform features, and general support. Could you rephrase your question using one of these topics?";
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        size="sm"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 w-80 h-96 shadow-xl z-40 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              LinkedUp Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.isBot
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm" className="bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
