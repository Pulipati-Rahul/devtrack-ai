import { BaseService } from './base.service';
import { searchRepository, SearchResult } from '../repositories/search.repository';

export interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'action' | 'utility';
  url?: string;
  actionId?: string;
  isPinned?: boolean;
}

const STATIC_COMMANDS: CommandItem[] = [
  { id: 'create-resume', name: 'Create Resume', description: 'Initialize a new resume draft using the builder', category: 'action', url: '/resume' },
  { id: 'new-project', name: 'New Project', description: 'Log a side project and sprint task board', category: 'action', url: '/projects' },
  { id: 'new-portfolio', name: 'New Portfolio', description: 'Configure developer showroom parameters', category: 'action', url: '/portfolio' },
  { id: 'go-dashboard', name: 'Go Dashboard', description: 'Navigate to career metrics hub', category: 'navigation', url: '/dashboard' },
  { id: 'go-profile', name: 'Go Profile', description: 'Navigate to developer profile identity controls', category: 'navigation', url: '/profile' },
  { id: 'go-resume', name: 'Go Resume', description: 'Navigate to resume builder drafts list', category: 'navigation', url: '/resume' },
  { id: 'go-portfolio', name: 'Go Portfolio', description: 'Navigate to portfolio parameters editor', category: 'navigation', url: '/portfolio' },
  { id: 'go-settings', name: 'Go Settings', description: 'Navigate to workspace configurations center', category: 'navigation', url: '/settings' },
  { id: 'open-ai-coach', name: 'Open AI Coach', description: 'Navigate to AI Career Coach loop', category: 'navigation', url: '/ai' },
  { id: 'logout', name: 'Logout', description: 'Terminate session and exit application workspace', category: 'action', actionId: 'logout' },
  { id: 'toggle-theme', name: 'Toggle Theme', description: 'Switch UI style mode between light and dark', category: 'utility', actionId: 'toggle-theme' },
];

export class SearchService extends BaseService {
  constructor() {
    super('SearchService');
  }

  /**
   * Performs a global search across all db modules and app settings.
   */
  async search(userId: string, query: string): Promise<SearchResult[]> {
    this.logInfo('Executing search query', { userId, query });
    
    if (!query || query.trim() === '') {
      return [];
    }

    const term = query.toLowerCase().trim();
    
    // Retrieve base query hits from db tables
    const dbResults = await searchRepository.search(userId, term);

    // Static matching for settings categories if keywords match
    const settingsCategories = [
      { keywords: ['theme', 'dark', 'light', 'appearance', 'style', 'color'], title: 'Theme Preference Settings', subtitle: 'Customize dark, light, or system themes and colors', id: 'theme-pref' },
      { keywords: ['language', 'english', 'locale', 'translate'], title: 'Language Options', subtitle: 'Select preferred locale settings configuration', id: 'lang-pref' },
      { keywords: ['notification', 'email', 'alert', 'push', 'subscribe'], title: 'Notification Preferences', subtitle: 'Toggle resume alerts, streak warnings, and email preferences', id: 'notif-pref' },
      { keywords: ['privacy', 'visibility', 'public', 'private', 'share'], title: 'Privacy Coordinates', subtitle: 'Manage portfolio page index status and sharing configuration', id: 'priv-pref' },
      { keywords: ['security', 'session', 'password', 'delete', 'active'], title: 'Security Settings', subtitle: 'Revoke active sessions or request account deletion', id: 'sec-pref' },
    ];

    const settingsResults: SearchResult[] = [];
    settingsCategories.forEach((cat) => {
      const match = cat.keywords.some((k) => k.includes(term) || term.includes(k));
      if (match) {
        settingsResults.push({
          id: cat.id,
          title: cat.title,
          subtitle: cat.subtitle,
          type: 'settings',
          url: '/settings',
        });
      }
    });

    // Combine results
    const combined = [...dbResults, ...settingsResults];

    // Search ranking prioritization:
    // 1. Exact match on title (case-insensitive)
    // 2. Starts with search query
    // 3. Partial match elsewhere
    combined.sort((a, b) => {
      const aTitleLower = a.title.toLowerCase();
      const bTitleLower = b.title.toLowerCase();

      const aExact = aTitleLower === term;
      const bExact = bTitleLower === term;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = aTitleLower.startsWith(term);
      const bStarts = bTitleLower.startsWith(term);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return 0;
    });

    return combined;
  }

  async getRecent(userId: string) {
    this.logInfo('Retrieving recent unique queries', { userId });
    return await searchRepository.getRecentSearches(userId);
  }

  async saveSearch(userId: string, query: string) {
    this.logInfo('Saving query to history log', { userId, query });
    if (!query || query.trim() === '') return null;
    return await searchRepository.saveSearchHistory(userId, query.trim());
  }

  async listCommands(userId: string): Promise<CommandItem[]> {
    this.logInfo('Compiling command registry with pin tags', { userId });
    const pins = await searchRepository.getPinnedCommands(userId);
    const pinnedIds = new Set(pins.map((p) => p.commandId));

    return STATIC_COMMANDS.map((cmd) => ({
      ...cmd,
      isPinned: pinnedIds.has(cmd.id),
    }));
  }

  async togglePin(userId: string, commandId: string, isPinned: boolean) {
    this.logInfo('Toggling command pin state', { userId, commandId, isPinned });
    if (isPinned) {
      await searchRepository.pinCommand(userId, commandId);
    } else {
      await searchRepository.unpinCommand(userId, commandId);
    }
    return { commandId, isPinned };
  }
}

export const searchService = new SearchService();
