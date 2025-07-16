
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PenTool,
  Lightbulb,
  Calendar,
  User,
  Settings,
  LogOut,
  BarChart3,
  Menu
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/ModeToggle"
import { useTheme } from 'next-themes'

interface NavItemProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (id: string) => void;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon: Icon, onClick, active }) => {
  return (
    <li>
      <Button
        variant={active ? "secondary" : "ghost"}
        onClick={() => onClick(id)}
        className={`justify-start w-full font-normal transition-all duration-200 ${
          active 
            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400" 
            : "hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        }`}
      >
        <Icon className="mr-3 h-4 w-4" />
        <span>{label}</span>
      </Button>
    </li>
  );
};

interface DashboardLayoutProps {
  user: {
    email: string;
    name: string;
    initials: string;
  };
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  currentPage,
  onNavigate,
  children
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { id: 'create-content', label: 'Create Content', icon: PenTool },
    { id: 'generate-ideas', label: 'Generate Ideas', icon: Lightbulb },
    { id: 'schedule-posts', label: 'Schedule Posts', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getPageTitle = (page: string) => {
    const item = navigationItems.find(item => item.id === page);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm border shadow-lg">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-white/95 backdrop-blur-sm">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LinkedUp
            </SheetTitle>
            <SheetDescription>
              Professional LinkedIn content management
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <ScrollArea className="h-[calc(100vh-10rem)] pl-2">
            <ul className="flex flex-col space-y-2 list-none">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  onClick={handleNavigation}
                  active={currentPage === item.id}
                />
              ))}
            </ul>
          </ScrollArea>
          <Separator className="my-4" />
          <Button variant="outline" className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-xl dark:bg-gray-900/95 dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LinkedUp
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <ul className="flex flex-col space-y-2 list-none">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                onClick={handleNavigation}
                active={currentPage === item.id}
              />
            ))}
          </ul>
        </ScrollArea>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm dark:bg-gray-900/80 dark:border-gray-700">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 capitalize">
              {getPageTitle(currentPage)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
