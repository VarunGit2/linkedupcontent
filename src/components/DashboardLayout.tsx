
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  PenTool, 
  Lightbulb, 
  Calendar,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

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
  onNavigate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const navigationItems = [
    { 
      id: 'create-content', 
      label: 'Create Content', 
      icon: PenTool,
      description: 'Generate AI-powered content'
    },
    { 
      id: 'generate-ideas', 
      label: 'Generate Ideas', 
      icon: Lightbulb,
      description: 'Get content inspiration'
    },
    { 
      id: 'schedule-posts', 
      label: 'Schedule Posts', 
      icon: Calendar,
      description: 'Plan your content calendar'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Track your performance'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      description: 'Manage your profile'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'App preferences'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LinkedUp
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`
            fixed lg:relative z-40 h-full lg:h-screen transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarExpanded ? 'w-72' : 'w-16 lg:w-20'}
            bg-card border-r border-border
          `}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    LinkedUp
                  </h1>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`
                      w-full justify-start gap-3 h-12 px-3 transition-all duration-200
                      ${sidebarExpanded ? 'px-4' : 'px-3'}
                      ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-accent'}
                      group relative
                    `}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    {sidebarExpanded && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium truncate">{item.label}</div>
                          <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {!sidebarExpanded && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            {sidebarExpanded ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">{user.initials}</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-8 h-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block flex-1">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Badge variant="outline" className="hidden xl:flex">
                {user.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
