import { BaseService } from './base.service';
import { dsaRepository } from '../repositories/dsa.repository';
import { NotFoundError, AuthorizationError } from '../errors/app-errors';

export class DsaService extends BaseService {
  constructor() {
    super('DsaService');
  }

  // --- Helper: Verify Ownership ---
  async verifyOwnership(userId: string, problemId: string) {
    const prob = await dsaRepository.getProblemById(problemId);
    if (!prob) throw new NotFoundError('Problem not found');
    if (prob.userId !== userId) throw new AuthorizationError('You do not own this problem record');
    return prob;
  }

  // --- 1. Problem CRUD Operations ---
  async listProblems(userId: string) {
    this.logInfo('Listing solved problems', { userId });
    return await dsaRepository.listProblems(userId);
  }

  async createProblem(userId: string, data: any) {
    this.logInfo('Creating solved problem log', { userId });
    const prob = await dsaRepository.createProblem({
      userId,
      title: data.title,
      platform: data.platform,
      url: data.url || null,
      difficulty: data.difficulty,
      topic: data.topic || null,
      status: data.status || 'Solved',
      timeTaken: data.timeTaken || null,
      solvedDate: data.solvedDate ? new Date(data.solvedDate) : new Date(),
      favorite: data.favorite ?? false,
      notes: data.notes || null,
    });

    // Automatically initialize spaced revision schedule
    const nextRevisionDate = data.nextRevisionDate
      ? new Date(data.nextRevisionDate)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days default
    
    await dsaRepository.upsertRevision(prob.id, nextRevisionDate, 0);

    return await dsaRepository.getProblemById(prob.id);
  }

  async updateProblem(userId: string, id: string, data: any) {
    this.logInfo('Updating solved problem parameters', { userId, id });
    await this.verifyOwnership(userId, id);

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.platform !== undefined) updatePayload.platform = data.platform;
    if (data.url !== undefined) updatePayload.url = data.url;
    if (data.difficulty !== undefined) updatePayload.difficulty = data.difficulty;
    if (data.topic !== undefined) updatePayload.topic = data.topic;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.timeTaken !== undefined) updatePayload.timeTaken = data.timeTaken;
    if (data.solvedDate !== undefined) updatePayload.solvedDate = new Date(data.solvedDate);
    if (data.favorite !== undefined) updatePayload.favorite = data.favorite;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    await dsaRepository.updateProblem(id, updatePayload);

    // If nextRevisionDate is explicitly passed, update the schedule
    if (data.nextRevisionDate !== undefined) {
      const nextRev = data.nextRevisionDate ? new Date(data.nextRevisionDate) : new Date();
      const existingRev = await dsaRepository.getRevisionByProblemId(id);
      const count = existingRev ? existingRev.revisionCount : 0;
      await dsaRepository.upsertRevision(id, nextRev, count);
    }

    return await dsaRepository.getProblemById(id);
  }

  async deleteProblem(userId: string, id: string) {
    this.logInfo('Deleting solved problem record', { userId, id });
    await this.verifyOwnership(userId, id);
    return await dsaRepository.deleteProblem(id);
  }

  // --- 2. Revision Operations ---
  async getUpcomingRevisions(userId: string) {
    this.logInfo('Listing upcoming revisions', { userId });
    return await dsaRepository.listAllRevisions(userId);
  }

  async completeRevision(userId: string, problemId: string) {
    this.logInfo('Completing revision for problem', { userId, problemId });
    await this.verifyOwnership(userId, problemId);

    const existing = await dsaRepository.getRevisionByProblemId(problemId);
    const count = existing ? existing.revisionCount + 1 : 1;

    // Spaced repetition scheduler logic:
    // count 1 -> 3 days
    // count 2 -> 7 days
    // count 3 -> 15 days
    // count 4+ -> 30 days
    let intervalDays = 3;
    if (count === 2) intervalDays = 7;
    else if (count === 3) intervalDays = 15;
    else if (count >= 4) intervalDays = 30;

    const nextRevision = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
    const lastRevision = new Date();

    const updated = await dsaRepository.upsertRevision(problemId, nextRevision, count, lastRevision);
    return updated;
  }

  // --- 3. Statistics Aggregations & Streak Math ---
  async getStatistics(userId: string) {
    this.logInfo('Calculating stats and streaks', { userId });
    const problems = await dsaRepository.listProblems(userId);
    const allRevisions = await dsaRepository.listAllRevisions(userId);

    // Filter due count
    const now = new Date();
    const revisionsDue = allRevisions.filter((r) => new Date(r.nextRevision) <= now).length;

    // Difficulty counts
    const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
    const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
    const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;
    const totalSolved = problems.length;

    // Streaks Calculations
    const uniqueDates = Array.from(
      new Set(
        problems
          .map((p) => new Date(p.solvedDate).toISOString().split('T')[0])
      )
    ).sort((a, b) => b.localeCompare(a)); // Descending unique dates

    let currentStreak = 0;
    let longestStreak = 0;

    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Current streak check: starts if today or yesterday is present
      const hasToday = uniqueDates.includes(todayStr);
      const hasYesterday = uniqueDates.includes(yesterdayStr);

      if (hasToday || hasYesterday) {
        const checkDate = hasToday ? new Date() : yesterday;
        let running = true;
        while (running) {
          const checkStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates.includes(checkStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            running = false;
          }
        }
      }

      // Longest streak calculation
      let runningStreak = 0;
      let prevTime: number | null = null;

      // Unique dates are sorted descending, so let's reverse to ascending for longest streak math
      const ascendingDates = [...uniqueDates].reverse();

      for (const dateStr of ascendingDates) {
        const currTime = new Date(dateStr).getTime();
        if (prevTime === null) {
          runningStreak = 1;
        } else {
          const diffDays = Math.round((currTime - prevTime) / (24 * 60 * 60 * 1000));
          if (diffDays === 1) {
            runningStreak++;
          } else if (diffDays > 1) {
            if (runningStreak > longestStreak) {
              longestStreak = runningStreak;
            }
            runningStreak = 1;
          }
        }
        prevTime = currTime;
      }
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    }

    // Topics breakdown
    const topicMap: Record<string, number> = {};
    problems.forEach((p) => {
      if (p.topic) {
        topicMap[p.topic] = (topicMap[p.topic] || 0) + 1;
      }
    });

    // Platforms usage
    const platformMap: Record<string, number> = {};
    problems.forEach((p) => {
      if (p.platform) {
        platformMap[p.platform] = (platformMap[p.platform] || 0) + 1;
      }
    });

    return {
      totalSolved,
      difficultyBreakdown: { Easy: easyCount, Medium: mediumCount, Hard: hardCount },
      streaks: { currentStreak, longestStreak },
      revisionsDue,
      topicsBreakdown: Object.entries(topicMap).map(([topic, count]) => ({ topic, count })),
      platformsBreakdown: Object.entries(platformMap).map(([platform, count]) => ({ platform, count })),
      solvedHistory: uniqueDates, // unique solve dates array (heatmap helper)
    };
  }
}
export const dsaService = new DsaService();
