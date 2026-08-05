import { db } from '../db/database';
import { eq, and } from 'drizzle-orm';
import { userSetting, session, user, aiConversation, analyticsSnapshot, analyticsReport } from '../db/schema';

export class SettingsRepository {
  async getSettings(userId: string) {
    let result = await db
      .select()
      .from(userSetting)
      .where(eq(userSetting.userId, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!result) {
      // Create default settings if they do not exist yet
      const [created] = await db
        .insert(userSetting)
        .values({
          userId,
          theme: 'system',
          language: 'en',
          notifications: {
            email: true,
            push: false,
            inApp: true,
            aiSuggestions: true,
            dsaReminders: true,
            interviewReminders: true,
            resumeAlerts: false,
          },
          privacy: {
            portfolioVisibility: 'public',
            publicProfile: true,
            analyticsSharing: true,
            aiDataUsage: true,
            searchIndexing: false,
          },
          aiPreferences: {
            responseLength: 'medium',
            tone: 'professional',
            creativity: 0.7,
            autoSuggestions: true,
            streaming: true,
          },
          resumePreferences: {
            defaultTemplate: 'Modern',
            defaultFont: 'Inter',
            exportFormat: 'pdf',
            autoSaveInterval: 30,
          },
          portfolioPreferences: {
            defaultTemplate: 'Sleek',
            theme: 'dark',
            seoDefaults: {
              title: 'Developer Portfolio',
              description: 'My engineering portfolio site',
            },
            socialVisibility: true,
          },
          appearance: {
            accentColor: 'indigo',
            fontSize: 'medium',
            compactMode: false,
            sidebarBehavior: 'expanded',
          },
          integrations: {
            github: false,
            linkedin: false,
            google: false,
          },
        })
        .returning();
      result = created;
    }

    const [userRow] = await db
      .select({ name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return {
      ...result,
      name: userRow?.name || '',
      image: userRow?.image || '',
    };
  }

  async updateSettings(userId: string, data: any) {
    const [updated] = await db
      .update(userSetting)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userSetting.userId, userId))
      .returning();
    return updated;
  }

  async getSessions(userId: string) {
    return await db
      .select()
      .from(session)
      .where(eq(session.userId, userId));
  }

  async deleteSession(userId: string, sessionId: string) {
    const [result] = await db
      .delete(session)
      .where(and(eq(session.id, sessionId), eq(session.userId, userId)))
      .returning();
    return result;
  }

  async deleteUserAccount(userId: string) {
    const [result] = await db
      .delete(user)
      .where(eq(user.id, userId))
      .returning();
    return result;
  }

  async updateUserProfile(userId: string, data: { name?: string; image?: string }) {
    const [updated] = await db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();
    return updated;
  }

  async clearAiHistory(userId: string) {
    await db.delete(aiConversation).where(eq(aiConversation.userId, userId));
  }

  async clearAnalyticsData(userId: string) {
    await db.delete(analyticsSnapshot).where(eq(analyticsSnapshot.userId, userId));
    await db.delete(analyticsReport).where(eq(analyticsReport.userId, userId));
  }
}
export const settingsRepository = new SettingsRepository();
