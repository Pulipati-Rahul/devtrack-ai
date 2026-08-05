import { db } from '../db/database';
import { eq, and, ne } from 'drizzle-orm';
import { portfolio, portfolioProject, project, user, profile, education, experience, skill, certification, achievement } from '../db/schema';

export class PortfolioRepository {
  async getPortfolioByUserId(userId: string) {
    const [result] = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.userId, userId))
      .limit(1);
    return result || null;
  }

  async getPortfolioById(id: string) {
    const [result] = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.id, id))
      .limit(1);
    return result || null;
  }

  async getPortfolioBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.publicSlug, slug))
      .limit(1);
    return result || null;
  }

  async createPortfolio(data: typeof portfolio.$inferInsert) {
    const [result] = await db.insert(portfolio).values(data).returning();
    return result;
  }

  async updatePortfolio(id: string, data: Partial<typeof portfolio.$inferInsert>) {
    const [result] = await db
      .update(portfolio)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(portfolio.id, id))
      .returning();
    return result;
  }

  async deletePortfolio(id: string) {
    const [result] = await db.delete(portfolio).where(eq(portfolio.id, id)).returning();
    return result;
  }

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const query = excludeId
      ? and(eq(portfolio.publicSlug, slug), ne(portfolio.id, excludeId))
      : eq(portfolio.publicSlug, slug);

    const matches = await db.select().from(portfolio).where(query).limit(1);
    return matches.length > 0;
  }

  async syncPortfolioProjects(
    portfolioId: string,
    projectsList: { projectId: string; featured: boolean; sortOrder: number }[]
  ) {
    return await db.transaction(async (tx) => {
      await tx.delete(portfolioProject).where(eq(portfolioProject.portfolioId, portfolioId));
      if (projectsList.length > 0) {
        const values = projectsList.map((p) => ({
          portfolioId,
          projectId: p.projectId,
          featured: p.featured,
          sortOrder: p.sortOrder,
        }));
        await tx.insert(portfolioProject).values(values);
      }
      return true;
    });
  }

  async getPortfolioProjects(portfolioId: string) {
    return await db
      .select({
        portfolioProjectId: portfolioProject.id,
        featured: portfolioProject.featured,
        sortOrder: portfolioProject.sortOrder,
        project: project,
      })
      .from(portfolioProject)
      .innerJoin(project, eq(portfolioProject.projectId, project.id))
      .where(eq(portfolioProject.portfolioId, portfolioId))
      .orderBy(portfolioProject.sortOrder);
  }

  // --- Fetching complete profile info for public compile ---
  async getFullDeveloperDetails(userId: string) {
    const devUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (devUser.length === 0) return null;

    const [devProfile] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1);
    
    let educations: any[] = [];
    let experiences: any[] = [];
    let skills: any[] = [];
    let certifications: any[] = [];
    let achievements: any[] = [];

    if (devProfile) {
      educations = await db.select().from(education).where(eq(education.profileId, devProfile.id));
      experiences = await db.select().from(experience).where(eq(experience.profileId, devProfile.id));
      skills = await db.select().from(skill).where(eq(skill.profileId, devProfile.id));
      certifications = await db.select().from(certification).where(eq(certification.profileId, devProfile.id));
      achievements = await db.select().from(achievement).where(eq(achievement.profileId, devProfile.id));
    }

    return {
      user: devUser[0],
      profile: devProfile || null,
      educations,
      experiences,
      skills,
      certifications,
      achievements,
    };
  }
}
export const portfolioRepository = new PortfolioRepository();
