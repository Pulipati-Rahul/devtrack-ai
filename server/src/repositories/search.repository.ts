import { db } from '../db/database';
import { eq, and, ilike, or, desc } from 'drizzle-orm';
import {
  profile,
  resume,
  project,
  portfolio,
  dsaProblem,
  interviewSession,
  aiConversation,
  searchHistory,
  pinnedCommand
} from '../db/schema';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'profile' | 'resume' | 'project' | 'portfolio' | 'dsa' | 'interview' | 'ai' | 'settings';
  url: string;
}

export class SearchRepository {
  /**
   * Searches across all relevant database tables in parallel for a given user.
   */
  async search(userId: string, query: string, limit = 5): Promise<SearchResult[]> {
    const term = `%${query}%`;

    const [
      profiles,
      resumes,
      projects,
      portfolios,
      dsaProblems,
      interviewSessions,
      aiConversations
    ] = await Promise.all([
      // 1. Profile Query
      db
        .select()
        .from(profile)
        .where(
          and(
            eq(profile.userId, userId),
            or(
              ilike(profile.fullName, term),
              ilike(profile.headline, term),
              ilike(profile.bio, term)
            )
          )
        )
        .limit(limit),

      // 2. Resume Query
      db
        .select()
        .from(resume)
        .where(
          and(
            eq(resume.userId, userId),
            or(
              ilike(resume.name, term),
              ilike(resume.template, term),
              ilike(resume.summary, term)
            )
          )
        )
        .limit(limit),

      // 3. Project Query
      db
        .select()
        .from(project)
        .where(
          and(
            eq(project.userId, userId),
            or(
              ilike(project.title, term),
              ilike(project.description, term),
              ilike(project.technologies, term)
            )
          )
        )
        .limit(limit),

      // 4. Portfolio Query
      db
        .select()
        .from(portfolio)
        .where(
          and(
            eq(portfolio.userId, userId),
            or(
              ilike(portfolio.headline, term),
              ilike(portfolio.bio, term),
              ilike(portfolio.theme, term)
            )
          )
        )
        .limit(limit),

      // 5. DSA Problems Query
      db
        .select()
        .from(dsaProblem)
        .where(
          and(
            eq(dsaProblem.userId, userId),
            or(
              ilike(dsaProblem.title, term),
              ilike(dsaProblem.platform, term),
              ilike(dsaProblem.difficulty, term),
              ilike(dsaProblem.topic, term),
              ilike(dsaProblem.notes, term)
            )
          )
        )
        .limit(limit),

      // 6. Interview Sessions Query
      db
        .select()
        .from(interviewSession)
        .where(
          and(
            eq(interviewSession.userId, userId),
            or(
              ilike(interviewSession.title, term),
              ilike(interviewSession.category, term),
              ilike(interviewSession.company, term),
              ilike(interviewSession.position, term),
              ilike(interviewSession.notes, term)
            )
          )
        )
        .limit(limit),

      // 7. AI Conversations Query
      db
        .select()
        .from(aiConversation)
        .where(
          and(
            eq(aiConversation.userId, userId),
            or(
              ilike(aiConversation.title, term),
              ilike(aiConversation.assistant, term)
            )
          )
        )
        .limit(limit)
    ]);

    const results: SearchResult[] = [];

    // Map profiles
    profiles.forEach((p) => {
      results.push({
        id: p.id,
        title: p.fullName || 'Untitled Profile',
        subtitle: p.headline || p.bio || 'Developer profile details',
        type: 'profile',
        url: '/profile',
      });
    });

    // Map resumes
    resumes.forEach((r) => {
      results.push({
        id: r.id,
        title: r.name,
        subtitle: `Resume template: ${r.template || 'Default'}`,
        type: 'resume',
        url: `/resume/${r.id}`,
      });
    });

    // Map projects
    projects.forEach((pr) => {
      results.push({
        id: pr.id,
        title: pr.title,
        subtitle: pr.description || pr.technologies || 'Side project board details',
        type: 'project',
        url: `/projects/${pr.id}`,
      });
    });

    // Map portfolios
    portfolios.forEach((po) => {
      results.push({
        id: po.id,
        title: `Portfolio Showroom (${po.publicSlug})`,
        subtitle: po.headline || po.bio || 'Developer portfolio parameters',
        type: 'portfolio',
        url: '/portfolio',
      });
    });

    // Map DSA problems
    dsaProblems.forEach((dp) => {
      results.push({
        id: dp.id,
        title: dp.title,
        subtitle: `${dp.platform} • ${dp.difficulty} • ${dp.topic || 'No topic'}`,
        type: 'dsa',
        url: '/dsa',
      });
    });

    // Map interview sessions
    interviewSessions.forEach((is) => {
      results.push({
        id: is.id,
        title: is.title,
        subtitle: `${is.company || 'Unknown Company'} • ${is.position || 'Unknown Role'} • ${is.category}`,
        type: 'interview',
        url: '/interview',
      });
    });

    // Map AI conversations
    aiConversations.forEach((ac) => {
      results.push({
        id: ac.id,
        title: ac.title,
        subtitle: `AI Career Coach conversation (${ac.assistant})`,
        type: 'ai',
        url: '/ai',
      });
    });

    return results;
  }

  async saveSearchHistory(userId: string, query: string) {
    // Keep search history entries unique by pruning duplicates of the same query term first
    await db.delete(searchHistory).where(and(eq(searchHistory.userId, userId), eq(searchHistory.query, query)));
    
    const [result] = await db.insert(searchHistory).values({ userId, query }).returning();
    return result;
  }

  async getRecentSearches(userId: string, limit = 5) {
    return await db
      .select({
        id: searchHistory.id,
        query: searchHistory.query,
        createdAt: searchHistory.createdAt,
      })
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }

  async getPinnedCommands(userId: string) {
    return await db
      .select({ commandId: pinnedCommand.commandId })
      .from(pinnedCommand)
      .where(eq(pinnedCommand.userId, userId));
  }

  async pinCommand(userId: string, commandId: string) {
    const existing = await db
      .select()
      .from(pinnedCommand)
      .where(and(eq(pinnedCommand.userId, userId), eq(pinnedCommand.commandId, commandId)))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existing) {
      await db.insert(pinnedCommand).values({ userId, commandId });
    }
  }

  async unpinCommand(userId: string, commandId: string) {
    await db
      .delete(pinnedCommand)
      .where(and(eq(pinnedCommand.userId, userId), eq(pinnedCommand.commandId, commandId)));
  }
}

export const searchRepository = new SearchRepository();
