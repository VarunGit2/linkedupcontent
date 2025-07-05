
import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  BrainCircuit,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Footer from '@/components/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    email: string;
    name: string;
    initials: string;
  };
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  onLogout,
  currentPage,
  onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (page: string) => {
    onNavigate(page);
    closeMobileMenu();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LU</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LinkedUp
              </span>
            </div>

            <nav className="flex-1 space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start font-normal ${currentPage === 'create-content' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => handleNavigation('create-content')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Create Content
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start font-normal ${currentPage === 'generate-ideas' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => handleNavigation('generate-ideas')}
              >
                <BrainCircuit className="w-4 h-4 mr-2" />
                Generate Ideas
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start font-normal ${currentPage === 'schedule-posts' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => handleNavigation('schedule-posts')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Posts
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start font-normal ${currentPage === 'profile' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => handleNavigation('profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start font-normal ${currentPage === 'settings' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => handleNavigation('settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-start font-normal text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 flex flex-col overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{user.name}</span>
                </div>
                <Button variant="ghost" onClick={toggleMobileMenu}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="p-4 space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start font-normal ${currentPage === 'create-content' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => handleNavigation('create-content')}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start font-normal ${currentPage === 'generate-ideas' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => handleNavigation('generate-ideas')}
                >
                  <BrainCircuit className="w-4 h-4 mr-2" />
                  Generate Ideas
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start font-normal ${currentPage === 'schedule-posts' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => handleNavigation('schedule-posts')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Posts
                </Button>
                 <Button
                  variant="ghost"
                  className={`w-full justify-start font-normal ${currentPage === 'profile' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => handleNavigation('profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start font-normal ${currentPage === 'settings' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => handleNavigation('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </nav>

              <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full">
            {children}
          </div>
          <Footer onNavigate={onNavigate} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
