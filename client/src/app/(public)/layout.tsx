'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isPending } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-primary" aria-label="DevTrack AI Home">
              <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                D
              </div>
              <span>DevTrack AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors hover:text-foreground ${isActive ? 'text-primary' : ''}`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle (Desktop Only) */}
            {mounted && (
              <div className="hidden sm:flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border/30">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded transition-all ${
                    theme === 'light' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Light Mode"
                  aria-label="Light Mode"
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded transition-all ${
                    theme === 'dark' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Dark Mode"
                  aria-label="Dark Mode"
                >
                  <Moon size={14} />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded transition-all ${
                    theme === 'system' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="System Theme"
                  aria-label="System Theme"
                >
                  <Monitor size={14} />
                </button>
              </div>
            )}

            {/* Auth Actions (Desktop Only) */}
            <div className="hidden sm:flex items-center gap-3">
              {!isPending && (
                <>
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow hover:opacity-90 transition-opacity"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="px-3.5 py-2 text-xs font-semibold hover:bg-secondary rounded-lg border border-border/40 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow hover:opacity-90 transition-opacity"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:hidden hover:bg-secondary rounded-lg transition-colors text-foreground"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black md:hidden"
            />
            {/* Content Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-64 bg-card border-l border-border/40 p-6 flex flex-col gap-6 md:hidden shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <span className="font-display font-semibold text-lg text-primary">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-secondary rounded"
                  aria-label="Close Navigation Menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm font-medium transition-colors hover:text-foreground ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-border/20 pt-4 flex flex-col gap-3">
                {/* Theme Selector (Mobile) */}
                {mounted && (
                  <div className="flex items-center justify-between gap-1 bg-secondary p-1 rounded-lg border border-border/30">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        theme === 'light' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                      }`}
                      aria-label="Light Mode"
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        theme === 'dark' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                      }`}
                      aria-label="Dark Mode"
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        theme === 'system' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                      }`}
                      aria-label="System Theme"
                    >
                      System
                    </button>
                  </div>
                )}

                {/* Mobile Auth Button */}
                {!isPending && (
                  <>
                    {isAuthenticated ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full text-center py-2 text-xs font-semibold hover:bg-secondary rounded-lg border border-border/40 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full text-center py-2.5 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow"
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-border/40 bg-card/40 pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-display font-semibold text-lg text-primary">
                <div className="h-7 w-7 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  D
                </div>
                <span>DevTrack AI</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                The modern workspace for technical developers. Manage resumes, track problems, practice mock sessions, and navigate your engineering career.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-display">Navigation</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-display">Resources</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Support & Contact</Link></li>
                <li><span className="opacity-50">API Reference (Coming Soon)</span></li>
                <li><span className="opacity-50">Blog (Coming Soon)</span></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-display">Legal & Socials</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} DevTrack AI. All rights reserved. Built as a production SaaS application.</span>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
