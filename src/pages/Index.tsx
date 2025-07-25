import React, { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import CreateContent from '@/components/CreateContent';
import GenerateIdeas from '@/components/GenerateIdeas';
import SchedulePosts from '@/components/SchedulePosts';
import ProfileSettings from '@/components/ProfileSettings';
import ProfileView from '@/components/ProfileView';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import TermsOfService from '@/components/TermsOfService';
import Chatbot from '@/components/Chatbot';
import SuggestionBox from '@/components/SuggestionBox';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import Analytics from '@/components/Analytics';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState('create-content');
  const [showSuggestionBox, setShowSuggestionBox] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          if (!session.user.email_confirmed_at) {
            toast({
              title: "Email Verification Required",
              description: "Please check your email and verify your account before continuing.",
              variant: "destructive",
            });
            setSession(null);
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);
            return;
          }
          
          // Clear any auth error parameters from URL after successful login
          const url = new URL(window.location.href);
          if (url.searchParams.has('error') || url.searchParams.has('error_description')) {
            url.search = '';
            window.history.replaceState({}, document.title, url.toString());
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !session.user.email_confirmed_at) {
        setSession(null);
        setUser(null);
        setIsLoggedIn(false);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  // Handle LinkedIn OAuth callback
  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        console.error('LinkedIn OAuth error:', error, errorDescription);
        toast({
          title: "LinkedIn Connection Failed",
          description: errorDescription || "OAuth error occurred",
          variant: "destructive",
        });
        
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
        return;
      }

      const storedState = localStorage.getItem('linkedin-oauth-state');
      const storedRedirectUri = localStorage.getItem('linkedin-redirect-uri');

      if (code && state && state === storedState) {
        try {
          const redirectUri = storedRedirectUri || window.location.origin;
          
          console.log('Processing LinkedIn callback with redirect:', redirectUri);
          
          const { data, error } = await supabase.functions.invoke('linkedin-auth', {
            body: {
              action: 'exchangeCode',
              code: code,
              redirectUri: redirectUri
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          if (data?.success) {
            localStorage.setItem('linkedin-connected', 'true');
            localStorage.setItem('linkedin-access-token', data.accessToken);
            localStorage.setItem('linkedin-profile', JSON.stringify(data.profile));
            localStorage.setItem('linkedin-user-id', data.profile.sub);
            localStorage.removeItem('linkedin-oauth-state');
            localStorage.removeItem('linkedin-redirect-uri');

            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, document.title, url.toString());

            toast({
              title: "🎉 LinkedIn Connected!",
              description: `Welcome ${data.profile.name}! You can now publish posts to LinkedIn.`,
            });

            setCurrentPage('schedule-posts');
          } else {
            throw new Error(data?.error || 'LinkedIn authentication failed');
          }
        } catch (error) {
          console.error('LinkedIn callback error:', error);
          localStorage.removeItem('linkedin-oauth-state');
          localStorage.removeItem('linkedin-redirect-uri');
          
          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState({}, document.title, url.toString());

          toast({
            title: "LinkedIn Connection Failed",
            description: "Please check your LinkedIn configuration and try again.",
            variant: "destructive",
          });
        }
      }
    };

    if (isLoggedIn && !isLoading) {
      handleLinkedInCallback();
    }
  }, [isLoggedIn, isLoading, toast]);

  const handleLogin = (userData: { email: string; name: string }) => {
    // This is handled by the auth state change listener
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear LinkedIn data on logout
    localStorage.removeItem('linkedin-connected');
    localStorage.removeItem('linkedin-profile');
    localStorage.removeItem('linkedin-access-token');
    localStorage.removeItem('linkedin-user-id');
    setCurrentPage('create-content');
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'User') return 'U';
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const renderCurrentPage = () => {
    console.log('Current page:', currentPage);
    switch (currentPage) {
      case 'create-content':
        return <CreateContent />;
      case 'generate-ideas':
        return <GenerateIdeas />;
      case 'schedule-posts':
        return <SchedulePosts />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return (
          <ProfileView 
            user={user} 
            onEditProfile={() => setCurrentPage('profile-settings')} 
          />
        );
      case 'profile-settings':
        return (
          <ProfileSettings 
            user={user} 
            onBack={() => setCurrentPage('profile')}
          />
        );
      case 'settings':
        return (
          <ProfileSettings 
            user={user} 
            onBack={() => setCurrentPage('create-content')}
          />
        );
      case 'privacy-policy':
        return (
          <PrivacyPolicy 
            onBack={() => setCurrentPage('create-content')}
          />
        );
      case 'terms-of-service':
        return (
          <TermsOfService 
            onBack={() => setCurrentPage('create-content')}
          />
        );
      default:
        return <CreateContent />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading LinkedUp...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const userData = {
    email: user?.email || '',
    name: getUserDisplayName(),
    initials: getUserInitials()
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <DashboardLayout
        user={userData}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      >
        <div className="px-2 sm:px-4 lg:px-6 xl:px-8">
          {renderCurrentPage()}
          
          <Button
            onClick={() => setShowSuggestionBox(true)}
            className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl z-40 rounded-full p-2 sm:p-3 border-2 border-white dark:border-gray-800"
            size="sm"
          >
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </DashboardLayout>
      
      <Chatbot />
      <SuggestionBox 
        isOpen={showSuggestionBox} 
        onClose={() => setShowSuggestionBox(false)} 
      />
    </div>
  );
};

export default Index;
