
import React, { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import CreateContent from '@/components/CreateContent';
import GenerateIdeas from '@/components/GenerateIdeas';
import SchedulePosts from '@/components/SchedulePosts';
import ProfileSettings from '@/components/ProfileSettings';
import Chatbot from '@/components/Chatbot';
import SuggestionBox from '@/components/SuggestionBox';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState('create-content');
  const [showSuggestionBox, setShowSuggestionBox] = useState(false);

  const handleLogin = (userData: { email: string; name: string }) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('create-content');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'create-content':
        return <CreateContent />;
      case 'generate-ideas':
        return <GenerateIdeas />;
      case 'schedule-posts':
        return <SchedulePosts />;
      case 'profile-settings':
        return <ProfileSettings user={user!} />;
      default:
        return <CreateContent />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <DashboardLayout
        user={user!}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          {renderCurrentPage()}
          
          {/* Suggestion Button */}
          <Button
            onClick={() => setShowSuggestionBox(true)}
            className="fixed bottom-6 left-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl z-40 rounded-full p-3 border-2 border-white dark:border-gray-800"
            size="sm"
          >
            <Lightbulb className="h-5 w-5" />
          </Button>
        </div>
      </DashboardLayout>
      
      <Footer />
      <Chatbot />
      <SuggestionBox 
        isOpen={showSuggestionBox} 
        onClose={() => setShowSuggestionBox(false)} 
      />
    </div>
  );
};

export default Index;
