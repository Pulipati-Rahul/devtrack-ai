import { BaseService } from './base.service';
import { profileRepository } from '../repositories/profile.repository';
import {
  ConflictError,
  NotFoundError,
  AuthorizationError,
} from '../errors/app-errors';
import { uploadService } from '../storage/upload.service';

export interface FullProfilePayload {
  profile: any;
  education: any[];
  experience: any[];
  skills: any[];
  certifications: any[];
  achievements: any[];
  completionPercentage: number;
}

export class ProfileService extends BaseService {
  constructor() {
    super('ProfileService');
  }

  async getFullProfile(userId: string): Promise<FullProfilePayload> {
    this.logInfo('Fetching full profile details', { userId });
    const data = await profileRepository.getFullProfileData(userId);
    const completionPercentage = this.calculateCompletion(data);

    return {
      ...data,
      completionPercentage,
    };
  }

  async updateProfile(userId: string, data: any) {
    this.logInfo('Updating profile records', { userId });
    
    if (data.username) {
      const taken = await profileRepository.isUsernameTaken(data.username, userId);
      if (taken) {
        throw new ConflictError('Username is already taken by another account');
      }
    }

    const updatedData = { ...data };
    if (data.dob) {
      updatedData.dob = new Date(data.dob);
    }

    return await profileRepository.updateProfile(userId, updatedData);
  }

  // --- Education Service CRUD ---
  async addEducation(userId: string, data: any) {
    const userProfile = await profileRepository.getProfileByUserId(userId);
    return await profileRepository.createEducation({
      ...data,
      profileId: userProfile.id,
    });
  }

  async updateEducation(userId: string, id: string, data: any) {
    const record = await profileRepository.getEducationById(id);
    if (!record) throw new NotFoundError('Education record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to modify this record');
    }

    return await profileRepository.updateEducation(id, data);
  }

  async deleteEducation(userId: string, id: string) {
    const record = await profileRepository.getEducationById(id);
    if (!record) throw new NotFoundError('Education record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to delete this record');
    }

    return await profileRepository.deleteEducation(id);
  }

  // --- Experience Service CRUD ---
  async addExperience(userId: string, data: any) {
    const userProfile = await profileRepository.getProfileByUserId(userId);
    
    // Parse Dates
    const expData = {
      ...data,
      profileId: userProfile.id,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    };

    return await profileRepository.createExperience(expData);
  }

  async updateExperience(userId: string, id: string, data: any) {
    const record = await profileRepository.getExperienceById(id);
    if (!record) throw new NotFoundError('Experience record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to modify this record');
    }

    const expData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : (data.currentlyWorking ? null : undefined),
    };

    return await profileRepository.updateExperience(id, expData);
  }

  async deleteExperience(userId: string, id: string) {
    const record = await profileRepository.getExperienceById(id);
    if (!record) throw new NotFoundError('Experience record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to delete this record');
    }

    return await profileRepository.deleteExperience(id);
  }

  // --- Skills Service CRUD ---
  async addSkill(userId: string, data: any) {
    const userProfile = await profileRepository.getProfileByUserId(userId);
    return await profileRepository.createSkill({
      ...data,
      profileId: userProfile.id,
    });
  }

  async deleteSkill(userId: string, id: string) {
    const record = await profileRepository.getSkillById(id);
    if (!record) throw new NotFoundError('Skill record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to delete this record');
    }

    return await profileRepository.deleteSkill(id);
  }

  // --- Certification Service CRUD ---
  async addCertification(userId: string, data: any) {
    const userProfile = await profileRepository.getProfileByUserId(userId);
    const certData = {
      ...data,
      profileId: userProfile.id,
      issueDate: data.issueDate ? new Date(data.issueDate) : null,
    };
    return await profileRepository.createCertification(certData);
  }

  async updateCertification(userId: string, id: string, data: any) {
    const record = await profileRepository.getCertificationById(id);
    if (!record) throw new NotFoundError('Certification record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to modify this record');
    }

    const certData = {
      ...data,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
    };

    return await profileRepository.updateCertification(id, certData);
  }

  async deleteCertification(userId: string, id: string) {
    const record = await profileRepository.getCertificationById(id);
    if (!record) throw new NotFoundError('Certification record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to delete this record');
    }

    return await profileRepository.deleteCertification(id);
  }

  // --- Achievement Service CRUD ---
  async addAchievement(userId: string, data: any) {
    const userProfile = await profileRepository.getProfileByUserId(userId);
    const achData = {
      ...data,
      profileId: userProfile.id,
      date: data.date ? new Date(data.date) : null,
    };
    return await profileRepository.createAchievement(achData);
  }

  async updateAchievement(userId: string, id: string, data: any) {
    const record = await profileRepository.getAchievementById(id);
    if (!record) throw new NotFoundError('Achievement record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to modify this record');
    }

    const achData = {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    };

    return await profileRepository.updateAchievement(id, achData);
  }

  async deleteAchievement(userId: string, id: string) {
    const record = await profileRepository.getAchievementById(id);
    if (!record) throw new NotFoundError('Achievement record not found');

    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (record.profileId !== userProfile.id) {
      throw new AuthorizationError('You do not have permissions to delete this record');
    }

    return await profileRepository.deleteAchievement(id);
  }

  // --- Helpers ---
  private calculateCompletion(data: {
    profile: any;
    education: any[];
    experience: any[];
    skills: any[];
    certifications: any[];
    achievements: any[];
  }): number {
    let score = 0;
    const profile = data.profile;

    if (!profile) return 0;

    // A. Personal Information (Bio, locations, phone, names) - Max 20%
    let personalScore = 0;
    if (profile.fullName) personalScore += 4;
    if (profile.username) personalScore += 4;
    if (profile.phone) personalScore += 4;
    if (profile.bio) personalScore += 4;
    if (profile.country || profile.state || profile.city) personalScore += 4;
    score += personalScore;

    // B. Social Links - Max 10%
    let socialScore = 0;
    if (profile.githubUrl) socialScore += 3.5;
    if (profile.linkedinUrl) socialScore += 3.5;
    if (profile.portfolioUrl || profile.twitterUrl) socialScore += 3;
    score += Math.round(socialScore);

    // C. Education (at least 1 entry) - Max 20%
    if (data.education.length > 0) {
      score += 20;
    }

    // D. Experience (at least 1 entry) - Max 20%
    if (data.experience.length > 0) {
      score += 20;
    }

    // E. Skills (at least 1 entry) - Max 15%
    if (data.skills.length > 0) {
      score += 15;
    }

    // F. Certifications (at least 1 entry) - Max 10%
    if (data.certifications.length > 0) {
      score += 10;
    }

    // G. Achievements (at least 1 entry) - Max 5%
    if (data.achievements.length > 0) {
      score += 5;
    }

    return Math.min(100, score);
  }

  private getPublicIdFromUrl(url: string): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    
    const pathPart = url.substring(uploadIndex + 8);
    const segments = pathPart.split('/');
    if (segments[0].match(/^v\d+$/)) {
      segments.shift();
    }
    
    const fullPath = segments.join('/');
    const lastDotIndex = fullPath.lastIndexOf('.');
    if (lastDotIndex === -1) return fullPath;
    return fullPath.substring(0, lastDotIndex);
  }

  async uploadAvatar(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number }
  ) {
    this.logInfo('Handling avatar upload request', { userId });
    
    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (userProfile.avatar) {
      const oldPublicId = this.getPublicIdFromUrl(userProfile.avatar);
      if (oldPublicId) {
        try {
          await uploadService.deleteFile(oldPublicId);
          this.logInfo('Successfully deleted old Cloudinary avatar', { userId, oldPublicId });
        } catch (err) {
          this.logError('Failed to delete old avatar from Cloudinary', err, { userId, oldPublicId });
        }
      }
    }

    const customId = `avatar_${userId}`;
    const result = await uploadService.uploadSingle(file, 'avatars', customId);
    await profileRepository.updateProfile(userId, { avatar: result.url });

    return { avatarUrl: result.url };
  }

  async deleteAvatar(userId: string) {
    this.logInfo('Handling avatar deletion request', { userId });
    
    const userProfile = await profileRepository.getProfileByUserId(userId);
    if (userProfile.avatar) {
      const oldPublicId = this.getPublicIdFromUrl(userProfile.avatar);
      if (oldPublicId) {
        try {
          await uploadService.deleteFile(oldPublicId);
          this.logInfo('Successfully deleted old Cloudinary avatar', { userId, oldPublicId });
        } catch (err) {
          this.logError('Failed to delete avatar from Cloudinary', err, { userId, oldPublicId });
        }
      }
    }

    await profileRepository.updateProfile(userId, { avatar: null });
    return { success: true };
  }
}
export const profileService = new ProfileService();
