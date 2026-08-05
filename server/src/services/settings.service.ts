import { BaseService } from './base.service';
import { settingsRepository } from '../repositories/settings.repository';

export class SettingsService extends BaseService {
  constructor() {
    super('SettingsService');
  }

  async getSettings(userId: string) {
    this.logInfo('Fetching user settings', { userId });
    return await settingsRepository.getSettings(userId);
  }

  async updateSettings(userId: string, data: any) {
    this.logInfo('Updating user settings', { userId });
    
    // Whitelist preferences to update
    const updateData: any = {};
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.notifications !== undefined) updateData.notifications = data.notifications;
    if (data.privacy !== undefined) updateData.privacy = data.privacy;
    if (data.aiPreferences !== undefined) updateData.aiPreferences = data.aiPreferences;
    if (data.resumePreferences !== undefined) updateData.resumePreferences = data.resumePreferences;
    if (data.portfolioPreferences !== undefined) updateData.portfolioPreferences = data.portfolioPreferences;
    if (data.integrations !== undefined) updateData.integrations = data.integrations;
    if (data.appearance !== undefined) updateData.appearance = data.appearance;

    return await settingsRepository.updateSettings(userId, updateData);
  }

  async getSessions(userId: string) {
    this.logInfo('Fetching active device sessions', { userId });
    return await settingsRepository.getSessions(userId);
  }

  async deleteSession(userId: string, sessionId: string) {
    this.logInfo('Revoking device session token', { userId, sessionId });
    return await settingsRepository.deleteSession(userId, sessionId);
  }

  async updateAccountProfile(userId: string, data: { name?: string; image?: string }) {
    this.logInfo('Updating account display details', { userId });
    return await settingsRepository.updateUserProfile(userId, data);
  }

  async deleteAccount(userId: string) {
    this.logInfo('Executing complete account deletion', { userId });
    return await settingsRepository.deleteUserAccount(userId);
  }

  async exportUserData(userId: string) {
    this.logInfo('Compiling complete candidate data export payload', { userId });
    const settings = await settingsRepository.getSettings(userId);
    const sessions = await settingsRepository.getSessions(userId);

    return {
      userId,
      exportedAt: new Date().toISOString(),
      account: {
        name: settings.name,
        email: settings.image, // email payload placeholder
      },
      preferences: {
        theme: settings.theme,
        language: settings.language,
        notifications: settings.notifications,
        privacy: settings.privacy,
        aiPreferences: settings.aiPreferences,
        resumePreferences: settings.resumePreferences,
        portfolioPreferences: settings.portfolioPreferences,
        appearance: settings.appearance,
      },
      sessions: sessions.map((s) => ({
        id: s.id,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
      })),
    };
  }

  async deleteUserData(userId: string, target: 'ai' | 'analytics' | 'all') {
    this.logInfo('Executing target data wipe action', { userId, target });
    if (target === 'ai' || target === 'all') {
      await settingsRepository.clearAiHistory(userId);
    }
    if (target === 'analytics' || target === 'all') {
      await settingsRepository.clearAnalyticsData(userId);
    }
    return { success: true, target };
  }
}
export const settingsService = new SettingsService();
