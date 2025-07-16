
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
  BarChart3
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
        className="justify-start w-full hover:bg-secondary/50 dark:hover:bg-secondary/50 rounded-md font-normal"
      >
        <Icon className="mr-2 h-4 w-4" />
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

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden absolute top-4 left-4 z-50">
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader className="text-left">
            <SheetTitle>LinkedUp</SheetTitle>
            <SheetDescription>
              Manage your content and profile settings.
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
          <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
          <div className="text-lg font-semibold">LinkedUp</div>
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
        <div className="p-4 border-t dark:border-gray-700">
          <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold">{currentPage}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
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
