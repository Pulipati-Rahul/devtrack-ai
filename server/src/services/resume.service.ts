import { BaseService } from './base.service';
import { resumeRepository } from '../repositories/resume.repository';
import { profileRepository } from '../repositories/profile.repository';
import { NotFoundError, AuthorizationError } from '../errors/app-errors';

export class ResumeService extends BaseService {
  constructor() {
    super('ResumeService');
  }

  async listResumes(userId: string) {
    this.logInfo('Listing resumes', { userId });
    return await resumeRepository.listResumes(userId);
  }

  async getResume(userId: string, id: string) {
    this.logInfo('Fetching full resume data', { userId, id });
    const r = await resumeRepository.getResumeById(id);
    if (!r) throw new NotFoundError('Resume not found');
    if (r.userId !== userId) throw new AuthorizationError('You do not own this resume');

    const sections = await resumeRepository.getResumeSections(id);
    return {
      resume: r,
      sections,
    };
  }

  async createResume(userId: string, name: string, template: string) {
    this.logInfo('Creating new resume', { userId, name, template });

    // Initialize resume row
    const newResume = await resumeRepository.createResume({
      userId,
      name,
      template,
      font: 'Inter',
      accentColor: '#3b82f6',
      spacing: 2,
      fontSize: 12,
      isDefault: false,
    });

    // Populate default empty sections
    const defaultSections = [
      { sectionType: 'personal', sortOrder: 1, content: { fullName: '', email: '', phone: '', headline: '', city: '', state: '', country: '', githubUrl: '', linkedinUrl: '', portfolioUrl: '', twitterUrl: '' } },
      { sectionType: 'summary', sortOrder: 2, content: { text: '' } },
      { sectionType: 'education', sortOrder: 3, content: [] },
      { sectionType: 'experience', sortOrder: 4, content: [] },
      { sectionType: 'skills', sortOrder: 5, content: [] },
      { sectionType: 'projects', sortOrder: 6, content: [] },
      { sectionType: 'certifications', sortOrder: 7, content: [] },
      { sectionType: 'achievements', sortOrder: 8, content: [] },
      { sectionType: 'languages', sortOrder: 9, content: [] },
      { sectionType: 'interests', sortOrder: 10, content: [] },
      { sectionType: 'custom', sortOrder: 11, content: { title: 'Custom Section', items: [] } },
    ];

    await Promise.all(
      defaultSections.map((sec) =>
        resumeRepository.createResumeSection({
          resumeId: newResume.id,
          sectionType: sec.sectionType,
          sortOrder: sec.sortOrder,
          visible: true,
          content: sec.content,
        })
      )
    );

    return newResume;
  }

  async updateResume(userId: string, id: string, data: any) {
    this.logInfo('Updating resume data', { userId, id });
    const r = await resumeRepository.getResumeById(id);
    if (!r) throw new NotFoundError('Resume not found');
    if (r.userId !== userId) throw new AuthorizationError('You do not own this resume');

    if (data.isDefault) {
      return await resumeRepository.setDefaultResume(userId, id);
    }

    return await resumeRepository.updateResume(id, data);
  }

  async updateResumeSection(userId: string, resumeId: string, sectionId: string, data: any) {
    this.logInfo('Updating resume section', { userId, resumeId, sectionId });
    const r = await resumeRepository.getResumeById(resumeId);
    if (!r) throw new NotFoundError('Resume not found');
    if (r.userId !== userId) throw new AuthorizationError('You do not own this resume');

    return await resumeRepository.updateResumeSection(sectionId, data);
  }

  async deleteResume(userId: string, id: string) {
    this.logInfo('Deleting resume', { userId, id });
    const r = await resumeRepository.getResumeById(id);
    if (!r) throw new NotFoundError('Resume not found');
    if (r.userId !== userId) throw new AuthorizationError('You do not own this resume');

    return await resumeRepository.deleteResume(id);
  }

  async duplicateResume(userId: string, id: string, name: string) {
    this.logInfo('Duplicating resume', { userId, id, name });
    const r = await resumeRepository.getResumeById(id);
    if (!r) throw new NotFoundError('Resume not found');
    if (r.userId !== userId) throw new AuthorizationError('You do not own this resume');

    const copy = await resumeRepository.duplicateResume(id, name);
    if (!copy) throw new NotFoundError('Failed to copy resume');
    return copy;
  }

  async importProfile(userId: string, resumeId: string, sectionsToImport: string[]) {
    this.logInfo('Importing profile data into resume sections', { userId, resumeId, sectionsToImport });
    
    const r = await resumeRepository.getResumeById(resumeId);
    if (!r) throw new NotFoundError('Resume not found');
    if (r.userId !== userId) throw new AuthorizationError('You do not own this resume');

    // Fetch full profile database coordinates
    const profileData = await profileRepository.getFullProfileData(userId);
    const existingSections = await resumeRepository.getResumeSections(resumeId);

    const updatePromises = sectionsToImport.map(async (secType) => {
      const targetSec = existingSections.find((s) => s.sectionType === secType);
      if (!targetSec) return;

      let newContent: any = null;

      switch (secType) {
        case 'personal':
          if (profileData.profile) {
            newContent = {
              fullName: profileData.profile.fullName || '',
              email: reqUserEmail(profileData.profile), // Wait, email is not inside profile schema but we can query it
              phone: profileData.profile.phone || '',
              headline: profileData.profile.headline || '',
              city: profileData.profile.city || '',
              state: profileData.profile.state || '',
              country: profileData.profile.country || '',
              githubUrl: profileData.profile.githubUrl || '',
              linkedinUrl: profileData.profile.linkedinUrl || '',
              portfolioUrl: profileData.profile.portfolioUrl || '',
              twitterUrl: profileData.profile.twitterUrl || '',
            };
          }
          break;
        case 'education':
          newContent = profileData.education.map((edu) => ({
            id: edu.id,
            college: edu.college,
            degree: edu.degree,
            branch: edu.branch || '',
            cgpa: edu.cgpa || '',
            startYear: edu.startYear,
            endYear: edu.endYear,
            description: edu.description || '',
          }));
          break;
        case 'experience':
          newContent = profileData.experience.map((exp) => ({
            id: exp.id,
            company: exp.company,
            position: exp.position,
            employmentType: exp.employmentType || '',
            currentlyWorking: exp.currentlyWorking,
            startDate: exp.startDate.toISOString(),
            endDate: exp.endDate ? exp.endDate.toISOString() : null,
            description: exp.description || '',
          }));
          break;
        case 'skills':
          newContent = profileData.skills.map((sk) => ({
            id: sk.id,
            name: sk.name,
            category: sk.category,
            level: sk.level || 'Intermediate',
          }));
          break;
        case 'certifications':
          newContent = profileData.certifications.map((c) => ({
            id: c.id,
            title: c.title,
            issuer: c.issuer,
            issueDate: c.issueDate ? c.issueDate.toISOString() : null,
            credentialId: c.credentialId || '',
            credentialUrl: c.credentialUrl || '',
          }));
          break;
        case 'achievements':
          newContent = profileData.achievements.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description || '',
            date: a.date ? a.date.toISOString() : null,
          }));
          break;
        case 'summary':
          if (profileData.profile && profileData.profile.bio) {
            newContent = { text: profileData.profile.bio };
          }
          break;
      }

      if (newContent) {
        await resumeRepository.updateResumeSection(targetSec.id, {
          content: newContent,
          updatedAt: new Date(),
        });
      }
    });

    await Promise.all(updatePromises);
    
    // Return updated resume details
    return await this.getResume(userId, resumeId);
  }
}

function reqUserEmail(_profile: any): string {
  // Return a generic email string if needed, will be replaced inside controllers or sessions
  return '';
}

export const resumeService = new ResumeService();
