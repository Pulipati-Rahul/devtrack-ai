import { db } from '../db/database';
import { eq, and, ne } from 'drizzle-orm';
import {
  profile,
  education,
  experience,
  skill,
  certification,
  achievement,
} from '../db/schema';

export class ProfileRepository {
  async getProfileByUserId(userId: string) {
    const result = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    if (result[0]) return result[0];

    // Auto-create a blank profile for new users
    const [newProfile] = await db
      .insert(profile)
      .values({
        userId,
        fullName: '',
        username: `dev_${userId.substring(0, 8)}`,
      })
      .returning();

    return newProfile;
  }

  async isUsernameTaken(username: string, excludeUserId: string): Promise<boolean> {
    const result = await db
      .select({ id: profile.id })
      .from(profile)
      .where(
        and(
          eq(profile.username, username),
          ne(profile.userId, excludeUserId)
        )
      )
      .limit(1);
    
    return result.length > 0;
  }

  async getFullProfileData(userId: string) {
    const userProfile = await this.getProfileByUserId(userId);
    const profileId = userProfile.id;

    const [educations, experiences, skills, certifications, achievements] = await Promise.all([
      db.select().from(education).where(eq(education.profileId, profileId)),
      db.select().from(experience).where(eq(experience.profileId, profileId)),
      db.select().from(skill).where(eq(skill.profileId, profileId)),
      db.select().from(certification).where(eq(certification.profileId, profileId)),
      db.select().from(achievement).where(eq(achievement.profileId, profileId)),
    ]);

    return {
      profile: userProfile,
      education: educations,
      experience: experiences,
      skills,
      certifications,
      achievements,
    };
  }

  async updateProfile(userId: string, data: Partial<typeof profile.$inferInsert>) {
    const [updated] = await db
      .update(profile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profile.userId, userId))
      .returning();
    return updated;
  }

  // --- Education CRUD ---
  async getEducationById(id: string) {
    const [result] = await db.select().from(education).where(eq(education.id, id)).limit(1);
    return result || null;
  }

  async createEducation(data: typeof education.$inferInsert) {
    const [result] = await db.insert(education).values(data).returning();
    return result;
  }

  async updateEducation(id: string, data: Partial<typeof education.$inferInsert>) {
    const [result] = await db
      .update(education)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(education.id, id))
      .returning();
    return result;
  }

  async deleteEducation(id: string) {
    const [result] = await db.delete(education).where(eq(education.id, id)).returning();
    return result;
  }

  // --- Experience CRUD ---
  async getExperienceById(id: string) {
    const [result] = await db.select().from(experience).where(eq(experience.id, id)).limit(1);
    return result || null;
  }

  async createExperience(data: typeof experience.$inferInsert) {
    const [result] = await db.insert(experience).values(data).returning();
    return result;
  }

  async updateExperience(id: string, data: Partial<typeof experience.$inferInsert>) {
    const [result] = await db
      .update(experience)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(experience.id, id))
      .returning();
    return result;
  }

  async deleteExperience(id: string) {
    const [result] = await db.delete(experience).where(eq(experience.id, id)).returning();
    return result;
  }

  // --- Skills CRUD ---
  async getSkillById(id: string) {
    const [result] = await db.select().from(skill).where(eq(skill.id, id)).limit(1);
    return result || null;
  }

  async createSkill(data: typeof skill.$inferInsert) {
    const [result] = await db.insert(skill).values(data).returning();
    return result;
  }

  async deleteSkill(id: string) {
    const [result] = await db.delete(skill).where(eq(skill.id, id)).returning();
    return result;
  }

  // --- Certification CRUD ---
  async getCertificationById(id: string) {
    const [result] = await db.select().from(certification).where(eq(certification.id, id)).limit(1);
    return result || null;
  }

  async createCertification(data: typeof certification.$inferInsert) {
    const [result] = await db.insert(certification).values(data).returning();
    return result;
  }

  async updateCertification(id: string, data: Partial<typeof certification.$inferInsert>) {
    const [result] = await db
      .update(certification)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(certification.id, id))
      .returning();
    return result;
  }

  async deleteCertification(id: string) {
    const [result] = await db.delete(certification).where(eq(certification.id, id)).returning();
    return result;
  }

  // --- Achievement CRUD ---
  async getAchievementById(id: string) {
    const [result] = await db.select().from(achievement).where(eq(achievement.id, id)).limit(1);
    return result || null;
  }

  async createAchievement(data: typeof achievement.$inferInsert) {
    const [result] = await db.insert(achievement).values(data).returning();
    return result;
  }

  async updateAchievement(id: string, data: Partial<typeof achievement.$inferInsert>) {
    const [result] = await db
      .update(achievement)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(achievement.id, id))
      .returning();
    return result;
  }

  async deleteAchievement(id: string) {
    const [result] = await db.delete(achievement).where(eq(achievement.id, id)).returning();
    return result;
  }
}
export const profileRepository = new ProfileRepository();
