import { BaseService } from './base.service';
import { interviewRepository } from '../repositories/interview.repository';
import { NotFoundError, AuthorizationError } from '../errors/app-errors';

interface StaticQuestion {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answer: string;
  explanation: string;
  tags: string[];
  company: string[];
}

const STATIC_QUESTIONS: StaticQuestion[] = [
  {
    id: 'js-1',
    title: 'Explain closures in JavaScript.',
    category: 'JavaScript',
    difficulty: 'Medium',
    answer: 'A closure is the combination of a function bundled together with references to its surrounding state.',
    explanation: 'Closures allow an inner function to access the scope of an outer function even after the outer function has returned. They are commonly used for data encapsulation.',
    tags: ['Scope', 'Functions'],
    company: ['Google', 'Meta'],
  },
  {
    id: 'react-1',
    title: 'How does the Virtual DOM work in React?',
    category: 'React',
    difficulty: 'Medium',
    answer: 'React keeps a lightweight representation of the real DOM in memory, called the Virtual DOM.',
    explanation: 'When state changes, React creates a new virtual tree, compares it with the previous tree (diffing), and updates only the modified nodes in the real DOM (reconciliation).',
    tags: ['DOM', 'Performance'],
    company: ['Meta', 'Netflix'],
  },
  {
    id: 'node-1',
    title: 'What is the Event Loop in Node.js?',
    category: 'Node.js',
    difficulty: 'Hard',
    answer: 'The event loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.',
    explanation: 'It offloads operations to the system kernel whenever possible. When an operation completes, the kernel notifies Node.js so that the callback can be queued and processed.',
    tags: ['Async', 'I/O'],
    company: ['Amazon', 'Uber'],
  },
  {
    id: 'sql-1',
    title: 'Explain ACID properties in DBMS.',
    category: 'DBMS',
    difficulty: 'Medium',
    answer: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
    explanation: 'Atomicity ensures all operations succeed or roll back. Consistency maintains schema rules. Isolation keeps concurrent edits independent. Durability ensures changes persist.',
    tags: ['SQL', 'Transactions'],
    company: ['Microsoft', 'Oracle'],
  },
  {
    id: 'os-1',
    title: 'What is the difference between a process and a thread?',
    category: 'Operating Systems',
    difficulty: 'Easy',
    answer: 'A process is an executing program instance with its own memory space, whereas a thread is a execution path within a process.',
    explanation: 'Threads share the memory and resources of their parent process, making context switching faster but introducing concurrency risks.',
    tags: ['Concurrency', 'Memory'],
    company: ['Intel', 'Apple'],
  },
  {
    id: 'net-1',
    title: 'Describe the TCP/IP three-way handshake.',
    category: 'Computer Networks',
    difficulty: 'Medium',
    answer: 'It is the process used to establish a reliable TCP connection.',
    explanation: '1. Client sends SYN (Synchronize). 2. Server responds with SYN-ACK. 3. Client sends ACK (Acknowledge). The connection is then established.',
    tags: ['TCP', 'Handshake'],
    company: ['Cisco', 'Cloudflare'],
  },
  {
    id: 'oop-1',
    title: 'What is polymorphism in OOP?',
    category: 'OOP',
    difficulty: 'Easy',
    answer: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass.',
    explanation: 'Supported via Method Overloading (compile-time) and Method Overriding (runtime), allowing methods to behave differently based on the calling object.',
    tags: ['OOP', 'Inheritance'],
    company: ['Google', 'Microsoft'],
  },
  {
    id: 'hr-1',
    title: 'Why do you want to join our company?',
    category: 'HR',
    difficulty: 'Easy',
    answer: 'Align your response with the company mission, values, and work culture.',
    explanation: 'Highlight target achievements of the company, express excitement for their products, and mention how your background fits their immediate growth needs.',
    tags: ['HR', 'Culture'],
    company: ['All'],
  },
  {
    id: 'beh-1',
    title: 'Describe a time you had a conflict with a team member.',
    category: 'Behavioral',
    difficulty: 'Medium',
    answer: 'Use the STAR method (Situation, Task, Action, Result) to explain positive resolution.',
    explanation: 'Emphasize constructive conversation, focusing on technical trade-offs instead of personal friction, and explain how the project succeeded as a result.',
    tags: ['Behavioral', 'STAR'],
    company: ['All'],
  },
];

export class InterviewService extends BaseService {
  constructor() {
    super('InterviewService');
  }

  // --- Helper: Verify Ownership ---
  async verifyOwnership(userId: string, sessionId: string) {
    const session = await interviewRepository.getSessionById(sessionId);
    if (!session) throw new NotFoundError('Interview session not found');
    if (session.userId !== userId) throw new AuthorizationError('You do not own this session record');
    return session;
  }

  // --- 1. Question Bank Operations ---
  async listQuestions(userId: string) {
    this.logInfo('Listing questions with user bookmark status', { userId });
    const states = await interviewRepository.listQuestionStates(userId);

    // Map user configurations
    return STATIC_QUESTIONS.map((q) => {
      const match = states.find((s) => s.questionId === q.id);
      return {
        ...q,
        bookmarked: match ? match.bookmarked : false,
        solved: match ? match.solved : false,
      };
    });
  }

  async toggleQuestionState(userId: string, questionId: string, data: { bookmarked?: boolean; solved?: boolean }) {
    this.logInfo('Toggling question bookmarks or solved status', { userId, questionId });
    return await interviewRepository.upsertQuestionState(userId, questionId, data);
  }

  // --- 2. Session CRUD Operations ---
  async listSessions(userId: string) {
    this.logInfo('Listing interview sessions', { userId });
    return await interviewRepository.listSessions(userId);
  }

  async createSession(userId: string, data: any) {
    this.logInfo('Creating mock interview session', { userId });
    const session = await interviewRepository.createSession({
      userId,
      title: data.title,
      category: data.category,
      company: data.company || null,
      position: data.position || null,
      duration: data.duration || null,
      score: data.score || null,
      notes: data.notes || null,
    });

    if (data.feedback !== undefined || data.rating !== undefined) {
      await interviewRepository.upsertFeedback(session.id, {
        feedback: data.feedback || '',
        rating: data.rating || 5,
        strengths: data.strengths || '',
        weaknesses: data.weaknesses || '',
      });
    }

    return await interviewRepository.getSessionById(session.id);
  }

  async updateSession(userId: string, id: string, data: any) {
    this.logInfo('Updating mock interview parameters', { userId, id });
    await this.verifyOwnership(userId, id);

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.company !== undefined) updatePayload.company = data.company;
    if (data.position !== undefined) updatePayload.position = data.position;
    if (data.duration !== undefined) updatePayload.duration = data.duration;
    if (data.score !== undefined) updatePayload.score = data.score;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    await interviewRepository.updateSession(id, updatePayload);

    if (data.feedback !== undefined || data.rating !== undefined) {
      await interviewRepository.upsertFeedback(id, {
        feedback: data.feedback || '',
        rating: data.rating || 5,
        strengths: data.strengths || '',
        weaknesses: data.weaknesses || '',
      });
    }

    return await interviewRepository.getSessionById(id);
  }

  async deleteSession(userId: string, id: string) {
    this.logInfo('Deleting mock interview session', { userId, id });
    await this.verifyOwnership(userId, id);
    return await interviewRepository.deleteSession(id);
  }

  // --- 3. Preparation Statistics & Streaks ---
  async getStatistics(userId: string) {
    this.logInfo('Calculating preparation statistics', { userId });
    const states = await interviewRepository.listQuestionStates(userId);
    const sessions = await interviewRepository.listSessions(userId);

    const solvedCount = states.filter((s) => s.solved).length;
    const bookmarkedCount = states.filter((s) => s.bookmarked).length;
    const completedMocks = sessions.length;

    let sumScore = 0;
    let validScoreCount = 0;
    sessions.forEach((s) => {
      if (s.score !== null) {
        sumScore += s.score;
        validScoreCount++;
      }
    });
    const avgScore = validScoreCount > 0 ? Math.round(sumScore / validScoreCount) : 0;

    // Prep streaks calculator: unique dates of solved questions or mock sessions
    const solveDates = states.map((s) => new Date(s.updatedAt).toISOString().split('T')[0]);
    const sessionDates = sessions.map((s) => new Date(s.createdAt).toISOString().split('T')[0]);
    const uniqueDates = Array.from(new Set([...solveDates, ...sessionDates])).sort((a, b) => b.localeCompare(a));

    let currentStreak = 0;
    let longestStreak = 0;

    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

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

      // Longest streak
      let runningStreak = 0;
      let prevTime: number | null = null;
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
            if (runningStreak > longestStreak) longestStreak = runningStreak;
            runningStreak = 1;
          }
        }
        prevTime = currTime;
      }
      if (runningStreak > longestStreak) longestStreak = runningStreak;
    }

    // Category progress breakdown
    const categorySolvedMap: Record<string, number> = {};
    STATIC_QUESTIONS.forEach((q) => {
      const match = states.find((s) => s.questionId === q.id);
      if (match && match.solved) {
        categorySolvedMap[q.category] = (categorySolvedMap[q.category] || 0) + 1;
      }
    });

    return {
      totalSolved: solvedCount,
      bookmarkedCount,
      completedMocks,
      avgScore,
      streaks: { currentStreak, longestStreak },
      categoryBreakdown: Object.entries(categorySolvedMap).map(([category, count]) => ({ category, count })),
    };
  }
}
export const interviewService = new InterviewService();
