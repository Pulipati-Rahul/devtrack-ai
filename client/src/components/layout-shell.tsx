'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useUiStore } from '@/store/use-ui-store';
import {
  LayoutDashboard,
  User,
  FileText,
  Sparkles,
  FolderKanban,
  ClipboardList,
  Code2,
  HelpCircle,
  Bot,
  BarChart3,
  Settings,
  Menu,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationItem {
  name: string;
  id: string;
  icon: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Profile', id: 'profile', icon: User },
  { name: 'Resume Builder', id: 'resume', icon: FileText },
  { name: 'ATS Analyzer', id: 'ats', icon: Sparkles },
  { name: 'Portfolio', id: 'portfolio', icon: FolderKanban },
  { name: 'Project Tracker', id: 'projects', icon: ClipboardList },
  { name: 'DSA Tracker', id: 'dsa', icon: Code2 },
  { name: 'Interview Prep', id: 'interview', icon: HelpCircle },
  { name: 'AI Career Coach', id: 'ai', icon: Bot },
  { name: 'Analytics', id: 'analytics', icon: BarChart3 },
  { name: 'Settings', id: 'settings', icon: Settings },
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { sidebarOpen, toggleSidebar, activeTab, setActiveTab } = useUiStore();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const matched = navigationItems.find(item => pathname.startsWith(`/${item.id}`));
    if (matched) {
      setActiveTab(matched.id);
    } else if (pathname === '/') {
      setActiveTab('dashboard');
    }
  }, [pathname, setActiveTab]);

  const activeItem = navigationItems.find((item) => item.id === activeTab) || navigationItems[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Desktop */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 76 }}
        className="hidden md:flex flex-col bg-card border-r border-border/40 min-h-screen relative overflow-hidden shrink-0 z-20"
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 font-display font-semibold text-lg text-primary"
              >
                <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  D
                </div>
                <span>DevTrack AI</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleSidebar}
                className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold mx-auto cursor-pointer hover:scale-110 transition-transform"
                title="Click to Maximize Sidebar"
              >
                D
              </motion.div>
            )}
          </AnimatePresence>

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                  isActive
                    ? 'text-primary-foreground bg-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Collapsed Tooltip */}
                {!sidebarOpen && (
                  <div className="absolute left-16 bg-popover text-popover-foreground text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow border border-border">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapsed Toggle Button */}
        {!sidebarOpen && (
          <div className="p-4 border-t border-border/40 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </motion.aside>

      {/* Mobile Top Header */}
      <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2 font-display font-semibold text-lg text-primary">
          <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            D
          </div>
          <span>DevTrack AI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-muted rounded text-muted-foreground transition-colors"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-card border-r border-border z-50 md:hidden flex flex-col"
            >
              <div className="h-16 flex items-center px-4 border-b border-border/40">
                <span className="font-display font-semibold text-lg text-primary">DevTrack AI</span>
              </div>
              <nav className="flex-1 py-4 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <Link
                      key={item.id}
                      href={`/${item.id}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'text-primary-foreground bg-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Desktop */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>DevTrack AI</span>
            <span>/</span>
            <span className="text-foreground font-medium">{activeItem.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border/30">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded transition-all ${
                    theme === 'light' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Light Mode"
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded transition-all ${
                    theme === 'dark' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Dark Mode"
                >
                  <Moon size={14} />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded transition-all ${
                    theme === 'system' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="System Theme"
                >
                  <Monitor size={14} />
                </button>
              </div>
            )}

            {/* Profile Avatar Placeholder */}
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-xs font-semibold text-primary">
              JD
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
