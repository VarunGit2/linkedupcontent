
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Lightbulb, TrendingUp, Clock, Target } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Hi! I'm your LinkedUp AI assistant. I can help you with content creation, LinkedIn strategies, and professional networking tips. What would you like to know?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const predefinedQuestions = [
    {
      icon: <Lightbulb className="w-4 h-4" />,
      question: "Give me content ideas for my industry",
      category: "Content Ideas"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      question: "How to increase LinkedIn engagement?",
      category: "Growth Tips"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      question: "Best times to post on LinkedIn",
      category: "Scheduling"
    },
    {
      icon: <Target className="w-4 h-4" />,
      question: "How to write compelling headlines?",
      category: "Writing Tips"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Content Ideas
    if (message.includes('content') && message.includes('idea')) {
      return "🎯 Here are some engaging LinkedIn content ideas:\n\n• Share industry insights and trends\n• Post about your professional achievements\n• Create educational carousel posts\n• Share behind-the-scenes content\n• Write about lessons learned from failures\n• Highlight team accomplishments\n• Comment on industry news with your perspective\n• Share helpful resources and tools\n\nWould you like me to help you develop any of these ideas further?";
    }
    
    // LinkedIn Engagement
    if (message.includes('engagement') || message.includes('likes') || message.includes('comments')) {
      return "🚀 Here's how to boost your LinkedIn engagement:\n\n✅ Post consistently (3-5 times per week)\n✅ Use storytelling in your posts\n✅ Ask questions to encourage comments\n✅ Engage with others' content first\n✅ Use relevant hashtags (3-5 per post)\n✅ Share personal experiences and insights\n✅ Post when your audience is most active\n✅ Use visuals (images, carousels, videos)\n\nWhich strategy would you like to explore more?";
    }
    
    // Best posting times
    if (message.includes('time') && (message.includes('post') || message.includes('publish'))) {
      return "⏰ Best times to post on LinkedIn:\n\n🌅 **Morning**: 8-10 AM (Tuesday-Thursday)\n🌆 **Evening**: 12-2 PM & 5-6 PM\n📅 **Days**: Tuesday, Wednesday, Thursday perform best\n🚫 **Avoid**: Late evenings and weekends\n\n💡 **Pro Tips**:\n• Test different times for your audience\n• Use LinkedIn Analytics to track performance\n• Consider your audience's time zone\n• Be consistent with your posting schedule\n\nWant me to help you create a posting schedule?";
    }
    
    // Headlines
    if (message.includes('headline') || message.includes('title')) {
      return "✍️ Tips for compelling LinkedIn headlines:\n\n🎯 **Formula**: Problem + Solution + Benefit\n📊 Use numbers and statistics\n❓ Ask intriguing questions\n🔥 Include power words (proven, secret, ultimate)\n📈 Mention specific outcomes\n👥 Address your target audience directly\n\n**Examples**:\n• '5 Proven Strategies That Increased My Team's Productivity by 40%'\n• 'Why Your LinkedIn Strategy Isn't Working (And How to Fix It)'\n• 'The Secret to Landing Your Dream Job in 90 Days'\n\nWant me to help you craft a headline for your next post?";
    }
    
    // LinkedIn Strategy
    if (message.includes('strategy') || message.includes('grow') || message.includes('network')) {
      return "🎯 Comprehensive LinkedIn growth strategy:\n\n**Content Strategy**:\n• Share valuable insights 3-5x/week\n• Mix of educational, personal, and industry content\n• Use storytelling to connect emotionally\n\n**Networking**:\n• Send personalized connection requests\n• Engage meaningfully with others' posts\n• Join and participate in relevant groups\n\n**Profile Optimization**:\n• Professional headshot\n• Keyword-rich headline and summary\n• Regular activity and updates\n\nWhich area would you like to focus on first?";
    }
    
    // Hashtags
    if (message.includes('hashtag')) {
      return "🏷️ LinkedIn hashtag best practices:\n\n**Use 3-5 hashtags per post**\n• Mix of popular and niche hashtags\n• Research hashtag performance\n• Create branded hashtags for campaigns\n\n**Popular Categories**:\n• Industry-specific: #Tech #Marketing #Sales\n• Skill-based: #Leadership #Innovation #Growth\n• General business: #Networking #Career #Success\n\n**Tools to find hashtags**:\n• LinkedIn's hashtag suggestions\n• Check competitors' posts\n• Use LinkedUp's content generator\n\nNeed help finding hashtags for your industry?";
    }
    
    // Writing tips
    if (message.includes('write') || message.includes('writing')) {
      return "✍️ LinkedIn writing tips for maximum impact:\n\n**Structure**:\n• Hook in first 2 lines\n• Short paragraphs (2-3 sentences)\n• Use bullet points and emojis\n• Include a call-to-action\n\n**Tone**:\n• Professional but conversational\n• Share personal experiences\n• Be authentic and vulnerable\n• Show expertise without bragging\n\n**Engagement**:\n• Ask questions\n• Share controversial (but professional) opinions\n• Tell stories with clear lessons\n• Tag relevant people (sparingly)\n\nWant me to review a draft of your next post?";
    }
    
    // Default responses for general queries
    const defaultResponses = [
      "I can help you with LinkedIn content strategy, engagement tips, and professional networking advice. What specific area interests you?",
      "That's a great question! For the best results, I recommend focusing on consistent, valuable content that resonates with your target audience. What's your current biggest challenge?",
      "I'm here to help you succeed on LinkedIn! Whether it's content ideas, posting strategies, or networking tips - just let me know what you need.",
      "LinkedIn success comes from authentic engagement and valuable content. What aspect of your LinkedIn presence would you like to improve?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handlePredefinedQuestion = (question: string) => {
    setInputMessage(question);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl z-50 rounded-full p-4 border-2 border-white dark:border-gray-800"
        size="lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-40 border-2 bg-white dark:bg-gray-900">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5" />
              LinkedUp AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="h-full flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      message.isBot 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-r from-green-500 to-blue-500'
                    }`}>
                      {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.isBot 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    }`}>
                      <div className="text-sm whitespace-pre-line">{message.text}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Predefined Questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t">
                <div className="text-xs font-medium text-gray-500 mb-2">Quick questions:</div>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedQuestions.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs p-2 h-auto justify-start"
                      onClick={() => handlePredefinedQuestion(item.question)}
                    >
                      <div className="flex items-center gap-1">
                        {item.icon}
                        <span className="truncate">{item.category}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about LinkedIn strategy..."
                  className="flex-1 border-2 focus:border-blue-500"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
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
