import { z } from 'zod';
import { BaseService } from './base.service';
import { analyticsRepository } from '../repositories/analytics.repository';
import { careerRepository } from '../repositories/career.repository';
import { aiService } from '../ai/services/ai.service';
import { ResponseValidator } from '../ai/validators/response.validator';
import { DEFAULT_MODEL } from '../ai/constants';

export const careerAnalysisSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingSkills: z.array(z.string()),
  opportunities: z.array(z.string()),
  recommendedTech: z.array(z.string()),
  recommendedCertifications: z.array(z.string()),
  recommendedProjects: z.array(z.string()),
  learningRoadmap: z.object({
    plan30Days: z.array(z.string()),
    plan90Days: z.array(z.string()),
    plan6Months: z.array(z.string()),
    plan1Year: z.array(z.string()),
  }),
});

export type CareerAnalysisReport = z.infer<typeof careerAnalysisSchema>;

export class CareerService extends BaseService {
  constructor() {
    super('CareerService');
  }

  /**
   * Aggregates stats from all user modules to construct a rich context prompt string.
   */
  public async compileCareerContext(userId: string): Promise<string> {
    const [
      profile,
      resumesCount,
      projects,
      dsa,
      mocksCount
    ] = await Promise.all([
      analyticsRepository.getProfileCompletenessDetails(userId),
      analyticsRepository.getResumesCount(userId),
      analyticsRepository.getProjectsCounts(userId),
      analyticsRepository.getDsaProblemsCounts(userId),
      analyticsRepository.getInterviewSessionsCounts(userId),
    ]);

    const contextParts = [
      `User Profile completeness: Bio="${profile?.bio || 'None'}", FullName="${profile?.fullName || 'None'}", githubUrl="${profile?.githubUrl || 'None'}", linkedinUrl="${profile?.linkedinUrl || 'None'}"`,
      `Skills Count: ${profile?.skillsCount || 0}, Experiences Count: ${profile?.experiencesCount || 0}, Educations Count: ${profile?.educationsCount || 0}`,
      `Resumes drafted: ${resumesCount}`,
      `Projects logged: Total=${projects.total}, Completed=${projects.completed}, In Progress/Active=${projects.active}`,
      `DSA Solved: Total=${dsa.total}, Easy=${dsa.easy}, Medium=${dsa.medium}, Hard=${dsa.hard}`,
      `Interview mock sessions completed: ${mocksCount}`,
    ];

    return contextParts.join('\n');
  }

  /**
   * Processes a conversational message context query, saving logs in Postgres.
   */
  public async chat(userId: string, conversationId: string, message: string) {
    this.logInfo('Directing query to AI Career Coach', { userId, conversationId });

    // 1. Gather current user context
    const context = await this.compileCareerContext(userId);

    // 2. Inject context as a system prompt helper
    const enrichedSystemInstruction = `You are a supportive, technical AI Career Coach. Here is the developer's current progress context:\n${context}\n\nGuide them on target roadmap goals, resume keywords, project designs, or interview skills.`;

    // 3. Delegate to the centralized AI Service chat routine
    return await aiService.chat(conversationId, message, {
      systemInstruction: enrichedSystemInstruction,
    });
  }

  /**
   * Generates a structured JSON analysis report of the developer's current profile.
   */
  public async analyze(userId: string): Promise<CareerAnalysisReport> {
    this.logInfo('Compiling Career Analysis Report', { userId });

    const context = await this.compileCareerContext(userId);

    const prompt = `Perform a career analysis audit based on the developer's current stats:\n${context}\n\nReturn a structured JSON object containing strengths, weaknesses, missingSkills, opportunities, recommendedTech, recommendedCertifications, recommendedProjects, and a learningRoadmap timeline.`;

    const systemInstruction = `You are an demanding software engineering career consultant. You must output raw JSON content matching the Zod schema details. Do not output conversational text or markdown code fence blocks other than valid JSON. JSON structure:\n{\n  "strengths": ["string"],\n  "weaknesses": ["string"],\n  "missingSkills": ["string"],\n  "opportunities": ["string"],\n  "recommendedTech": ["string"],\n  "recommendedCertifications": ["string"],\n  "recommendedProjects": ["string"],\n  "learningRoadmap": {\n    "plan30Days": ["string"],\n    "plan90Days": ["string"],\n    "plan6Months": ["string"],\n    "plan1Year": ["string"]\n  }\n}`;

    const response = await aiService.generate(prompt, {
      systemInstruction,
      modelName: DEFAULT_MODEL,
      temperature: 0.2, // low temperature for structured output stability
    });

    const fallback: CareerAnalysisReport = {
      strengths: ['Analytical mindset', 'Interest in programming challenges'],
      weaknesses: ['Underspecified project details'],
      missingSkills: ['System Design methodologies'],
      opportunities: ['Expand DSA solve counts to build recursion confidence'],
      recommendedTech: ['React', 'TypeScript', 'Node.js'],
      recommendedCertifications: ['AWS Certified Developer'],
      recommendedProjects: ['Full-stack SaaS application task manager'],
      learningRoadmap: {
        plan30Days: ['Log basic skills and profile bio.'],
        plan90Days: ['Solve 10 Easy/Medium DSA questions.'],
        plan6Months: ['Build a portfolio landing page.'],
        plan1Year: ['Complete mock interview practice.'],
      },
    };

    const report = ResponseValidator.validate<CareerAnalysisReport>(
      response.content,
      careerAnalysisSchema,
      fallback
    );

    // Save report history to database
    await careerRepository.createReport(userId, report);

    return report;
  }

  // --- Goals CRUD Operations ---
  public async listGoals(userId: string) {
    this.logInfo('Listing career goals', { userId });
    return await careerRepository.listGoals(userId);
  }

  public async createGoal(userId: string, data: any) {
    this.logInfo('Creating career goal', { userId });
    return await careerRepository.createGoal(userId, {
      title: data.title,
      description: data.description,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      status: data.status,
      aiGenerated: data.aiGenerated,
    });
  }

  public async updateGoal(userId: string, id: string, data: any) {
    this.logInfo('Updating career goal', { userId, id });
    return await careerRepository.updateGoal(id, {
      title: data.title,
      description: data.description,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      status: data.status,
    });
  }

  public async deleteGoal(userId: string, id: string) {
    this.logInfo('Deleting career goal', { userId, id });
    return await careerRepository.deleteGoal(id);
  }

  // --- Roadmaps Operations ---
  public async getRoadmap(userId: string) {
    this.logInfo('Retrieving career roadmap', { userId });
    return await careerRepository.getRoadmap(userId);
  }

  public async generateRoadmap(userId: string) {
    this.logInfo('Generating AI Career Roadmap', { userId });
    const context = await this.compileCareerContext(userId);

    const prompt = `Based on candidate progress stats:\n${context}\n\nGenerate a structured timeline roadmap with plan30Days, plan90Days, plan6Months, and plan1Year steps. Output only a raw JSON block like:\n{\n  "plan30Days": ["step 1", "step 2"],\n  "plan90Days": ["step 1"],\n  "plan6Months": ["step 1"],\n  "plan1Year": ["step 1"]\n}`;

    try {
      const res = await aiService.generate(prompt, {
        systemInstruction: 'You must output a valid JSON response with keys plan30Days, plan90Days, plan6Months, plan1Year. Do not output markdown.',
      });
      let cleanText = res.content.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }
      const steps = JSON.parse(cleanText);
      return await careerRepository.upsertRoadmap(userId, steps);
    } catch (e) {
      // Fallback roadmap
      const steps = {
        plan30Days: ['Enhance profile resume technical highlights.'],
        plan90Days: ['Log and complete 3 technical projects.'],
        plan6Months: ['Complete 5 mock interview logs.'],
        plan1Year: ['Achieve career transition targets.'],
      };
      return await careerRepository.upsertRoadmap(userId, steps);
    }
  }

  // --- Recommendations Operations ---
  public async listRecommendations(userId: string) {
    this.logInfo('Listing career recommendations', { userId });
    return await careerRepository.listRecommendations(userId);
  }

  public async generateRecommendations(userId: string) {
    this.logInfo('Generating AI recommendations list', { userId });
    const context = await this.compileCareerContext(userId);

    const prompt = `Based on candidate details:\n${context}\n\nRecommend exactly 6 custom items. For each recommendation specify type (Course, Project, Certification, Technology, DSA, Interview, Book, Doc) and a detailed title. Output only JSON array like:\n[\n  {"type": "Course", "title": "Advanced System Design by Alex Xu"},\n  {"type": "DSA", "title": "Solve 15 Tree and DFS problems"}\n]`;

    try {
      const res = await aiService.generate(prompt, {
        systemInstruction: 'Output raw JSON list only. No markdown formatting.',
      });
      let cleanText = res.content.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }
      const list = JSON.parse(cleanText);
      if (Array.isArray(list)) {
        return await careerRepository.bulkInsertRecommendations(userId, list);
      }
    } catch (e) {
      // Fallback recommendations list
    }

    const fallbacks = [
      { type: 'Course', title: 'Deep dive node.js architecture design patterns' },
      { type: 'Certification', title: 'AWS Certified Cloud Practitioner' },
      { type: 'DSA', title: 'Solve 10 Recursion and backtracking coding problems' },
      { type: 'Project', title: 'Build a Next.js full-stack SaaS workspace tracker' },
      { type: 'Book', title: 'Clean Code: A Handbook of Agile Software Craftsmanship' },
      { type: 'Doc', title: 'Read official React 19 concurrent features documentation' },
    ];
    return await careerRepository.bulkInsertRecommendations(userId, fallbacks);
  }

  public async toggleRecommendation(userId: string, id: string, completed: boolean) {
    this.logInfo('Toggling career recommendation', { userId, id });
    return await careerRepository.toggleRecommendationCompleted(id, completed);
  }
}
export const careerService = new CareerService();
