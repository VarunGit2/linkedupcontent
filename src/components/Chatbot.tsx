
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
      text: "👋 Hi! I'm your LinkedUp AI assistant. I can help you with content creation, LinkedIn strategies, and professional networking tips. Choose a quick question below or ask me anything!",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const predefinedQuestions = [
    {
      icon: <Lightbulb className="w-4 h-4" />,
      question: "Give me 5 content ideas for my industry",
      answer: "🎯 Here are 5 powerful LinkedIn content ideas:\n\n1. **Industry Insights**: Share your take on recent trends or news in your field\n2. **Behind-the-Scenes**: Show your work process, team collaborations, or day-in-the-life content\n3. **Lessons Learned**: Write about challenges you've overcome and what you learned\n4. **Educational Content**: Create how-to posts or tips that help your audience\n5. **Personal Stories**: Share professional milestones, career changes, or growth moments\n\n💡 Pro tip: Mix these formats to keep your content fresh and engaging!"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      question: "How to increase LinkedIn engagement?",
      answer: "🚀 Here's how to boost your LinkedIn engagement:\n\n✅ **Post consistently** (3-5 times per week)\n✅ **Use storytelling** - People connect with stories, not just facts\n✅ **Ask questions** in your posts to encourage comments\n✅ **Engage first** - Comment on others' posts before posting your own\n✅ **Use 3-5 relevant hashtags** (not more!)\n✅ **Post when your audience is active** (check your analytics)\n✅ **Add visuals** - Images, carousels, and videos perform better\n✅ **Write compelling hooks** - First 2 lines are crucial\n\nRemember: Authentic engagement beats vanity metrics!"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      question: "Best times to post on LinkedIn",
      answer: "⏰ Optimal LinkedIn posting times:\n\n🌅 **Weekday Mornings**: 8-10 AM (when people check LinkedIn before work)\n🌆 **Lunch Hours**: 12-2 PM (midday breaks)\n🌃 **Early Evening**: 5-6 PM (end of workday)\n\n📅 **Best Days**: Tuesday, Wednesday, Thursday\n🚫 **Avoid**: Late evenings, weekends (unless B2C)\n\n💡 **Pro Tips**:\n• Test different times for YOUR audience\n• Use LinkedIn Analytics to see when your followers are active\n• Consider your audience's time zones\n• Consistency matters more than perfect timing\n\nWhat industry are you in? I can give more specific advice!"
    },
    {
      icon: <Target className="w-4 h-4" />,
      question: "How to write compelling headlines?",
      answer: "✍️ Headline formulas that work:\n\n🎯 **The Problem/Solution**: 'Why [Common Problem] Happens (And How to Fix It)'\n📊 **Number Lists**: '7 Strategies That Increased My [Metric] by 200%'\n❓ **Questions**: 'Are You Making These [Number] LinkedIn Mistakes?'\n🔥 **Power Words**: Use 'Proven', 'Secret', 'Ultimate', 'Breakthrough'\n📈 **Specific Results**: Include exact numbers and outcomes\n\n**Examples**:\n• 'The 5-Minute LinkedIn Strategy That Got Me 50K Followers'\n• 'Why 90% of Professionals Fail at Networking (And How You Can Succeed)'\n• 'I Analyzed 1,000 LinkedIn Posts. Here's What Actually Works.'\n\n💡 Keep it under 150 characters for mobile users!"
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
    
    // Check for predefined questions
    const matchedQuestion = predefinedQuestions.find(q => 
      message.includes(q.question.toLowerCase()) || 
      (message.includes('content') && message.includes('idea') && q.question.includes('content ideas')) ||
      (message.includes('engagement') && q.question.includes('engagement')) ||
      (message.includes('time') && message.includes('post') && q.question.includes('times')) ||
      (message.includes('headline') && q.question.includes('headlines'))
    );

    if (matchedQuestion) {
      return matchedQuestion.answer;
    }

    // Content strategy
    if (message.includes('strategy') || message.includes('plan')) {
      return "🎯 LinkedIn Content Strategy Framework:\n\n**1. Define Your Goals**\n• Brand awareness\n• Lead generation\n• Thought leadership\n• Network building\n\n**2. Know Your Audience**\n• Industry professionals\n• Potential clients\n• Peers and colleagues\n• Industry influencers\n\n**3. Content Mix (80/20 Rule)**\n• 80% Value-driven content\n• 20% Promotional content\n\n**4. Content Types**\n• Educational posts\n• Industry insights\n• Personal stories\n• Behind-the-scenes\n\nNeed help with any specific part?";
    }

    // Networking
    if (message.includes('network') || message.includes('connect')) {
      return "🤝 Effective LinkedIn Networking:\n\n**Connection Requests**:\n• Always personalize your message\n• Mention mutual connections or interests\n• Be specific about why you want to connect\n\n**Building Relationships**:\n• Engage with their content regularly\n• Share their posts with thoughtful comments\n• Offer help before asking for favors\n• Send follow-up messages after events\n\n**Template**:\n'Hi [Name], I enjoyed your recent post about [topic]. As a fellow [industry/role], I'd love to connect and exchange insights. Best, [Your name]'\n\nWhat's your networking goal?";
    }

    // Default responses
    const defaultResponses = [
      "I'd be happy to help you with that! Can you be more specific about what aspect of LinkedIn marketing you'd like to focus on?",
      "That's a great question! For the most relevant advice, could you tell me more about your industry or current LinkedIn challenges?",
      "I can definitely help with that. Are you looking for content creation tips, engagement strategies, or networking advice?",
      "LinkedIn success comes from consistent, valuable content and authentic engagement. What's your biggest challenge right now?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageToSend,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowQuickQuestions(false);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(messageToSend),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
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
        <Card className="fixed bottom-24 right-6 w-96 h-[600px] shadow-2xl z-40 border-2 bg-white dark:bg-gray-900">
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
                  <div className={`flex items-start space-x-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
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

            {/* Quick Questions */}
            {showQuickQuestions && messages.length <= 1 && (
              <div className="px-4 py-3 border-t bg-gray-50 dark:bg-gray-800">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Quick questions:</div>
                <div className="space-y-2">
                  {predefinedQuestions.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => handleQuickQuestion(item.question)}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.question}</span>
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
                  onClick={() => handleSendMessage()}
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
