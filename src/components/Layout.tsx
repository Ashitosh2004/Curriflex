import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import {
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Settings,
  Home,
  Clock,
  Sun,
  Moon,
  Menu,
  X,
  Layers,
  DoorOpen,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Timetable', href: '/timetable', icon: Calendar },
  { name: 'Faculty', href: '/faculty', icon: Users },
  { name: 'Students', href: '/students', icon: GraduationCap },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Rooms', href: '/rooms', icon: DoorOpen },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Subject Allocation', href: '/subject-allocation', icon: Users },
  { name: 'Time Config', href: '/time-config', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Modern Glass Effect */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-ios lg:translate-x-0',
          'bg-sidebar backdrop-blur-2xl border-r border-sidebar-border',
          'shadow-xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/30 px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-sidebar-primary/10 group-hover:bg-sidebar-primary/20 transition-all duration-300 group-hover:scale-105">
              <img src="/logo.png" alt="Curriflex Logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              Curriflex
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-sidebar-accent transition-colors duration-200"
          >
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                  'transition-all duration-300 ease-out',
                  'hover:translate-x-1 hover:shadow-md',
                  isActive
                    ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25 scale-[1.02]'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 hover:scale-[1.01]'
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <item.icon className={cn(
                  'h-5 w-5 transition-transform duration-300',
                  isActive && 'scale-110'
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-sidebar to-transparent pointer-events-none" />
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 transition-all duration-300">
        {/* Top bar - Liquid Glass Effect */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:px-6 bg-background/70 backdrop-blur-xl border-b border-border/30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted/50 transition-all duration-200 active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-amber-500 transition-transform duration-500 rotate-0 hover:rotate-180" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-500 transition-transform duration-500" />
            )}
          </Button>
        </header>

        {/* Page content with subtle animation */}
        <main className="p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
