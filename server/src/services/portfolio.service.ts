import { BaseService } from './base.service';
import { portfolioRepository } from '../repositories/portfolio.repository';
import { projectRepository } from '../repositories/project.repository';
import { NotFoundError, ConflictError, AuthorizationError } from '../errors/app-errors';

export class PortfolioService extends BaseService {
  constructor() {
    super('PortfolioService');
  }

  // --- 1. Get Portfolio Configuration ---
  async getPortfolio(userId: string) {
    this.logInfo('Fetching user portfolio configuration', { userId });
    const config = await portfolioRepository.getPortfolioByUserId(userId);
    if (!config) return null;

    const projects = await portfolioRepository.getPortfolioProjects(config.id);
    return {
      portfolio: config,
      projects,
    };
  }

  // --- 2. Save Portfolio Configuration ---
  async savePortfolio(userId: string, data: any) {
    this.logInfo('Saving portfolio configuration settings', { userId });
    
    // Check slug collision
    if (data.publicSlug) {
      const existing = await portfolioRepository.getPortfolioByUserId(userId);
      const isTaken = await portfolioRepository.checkSlugExists(
        data.publicSlug,
        existing ? existing.id : undefined
      );
      if (isTaken) {
        throw new ConflictError('This public slug is already taken by another portfolio.');
      }
    }

    let config = await portfolioRepository.getPortfolioByUserId(userId);
    if (config) {
      config = await portfolioRepository.updatePortfolio(config.id, {
        headline: data.headline,
        bio: data.bio,
        theme: data.theme,
        publicSlug: data.publicSlug,
        appearance: data.appearance,
        sectionsConfig: data.sectionsConfig,
        seoSettings: data.seoSettings,
        socialLinks: data.socialLinks,
        published: data.published,
      });
    } else {
      config = await portfolioRepository.createPortfolio({
        userId,
        headline: data.headline || '',
        bio: data.bio || '',
        theme: data.theme || 'Modern',
        publicSlug: data.publicSlug || `dev-${userId.slice(0, 8)}`,
        appearance: data.appearance || {
          primaryColor: 'hsl(215, 20%, 65%)',
          accentColor: 'hsl(255, 60%, 60%)',
          typography: 'Inter',
          darkMode: true,
          cardStyle: 'bordered',
          spacing: 'normal',
          borderRadius: 'lg',
        },
        sectionsConfig: data.sectionsConfig || [
          { id: 'hero', name: 'Hero Banner', visible: true, sortOrder: 1 },
          { id: 'about', name: 'About Summary', visible: true, sortOrder: 2 },
          { id: 'skills', name: 'Core Skills', visible: true, sortOrder: 3 },
          { id: 'projects', name: 'Featured Projects', visible: true, sortOrder: 4 },
          { id: 'experience', name: 'Experience Timeline', visible: true, sortOrder: 5 },
          { id: 'education', name: 'Education History', visible: true, sortOrder: 6 },
          { id: 'achievements', name: 'Achievements & Awards', visible: true, sortOrder: 7 },
          { id: 'certifications', name: 'Certifications', visible: true, sortOrder: 8 },
          { id: 'contact', name: 'Contact Info', visible: true, sortOrder: 9 },
        ],
        seoSettings: data.seoSettings || {
          title: 'My Professional Portfolio',
          description: 'Software Engineer Portfolio built via DevTrack AI',
          keywords: 'Portfolio, Developer, React',
          ogImage: '',
          canonicalUrl: '',
        },
        socialLinks: data.socialLinks || {
          github: '',
          linkedin: '',
          twitter: '',
          portfolio: '',
          email: '',
        },
        published: data.published || false,
      });
    }

    // Sync featured projects if passed
    if (data.projects && Array.isArray(data.projects)) {
      await portfolioRepository.syncPortfolioProjects(config.id, data.projects);
    }

    const projects = await portfolioRepository.getPortfolioProjects(config.id);
    return {
      portfolio: config,
      projects,
    };
  }

  // --- 3. Publishing Operations ---
  async setPublishStatus(userId: string, published: boolean) {
    this.logInfo('Updating portfolio publish flag', { userId, published });
    const config = await portfolioRepository.getPortfolioByUserId(userId);
    if (!config) throw new NotFoundError('Portfolio configuration not found. Create it first.');
    return await portfolioRepository.updatePortfolio(config.id, { published });
  }

  // --- 4. Get Public Portfolio by Slug ---
  async getPublicPortfolio(slug: string) {
    this.logInfo('Compiling public portfolio', { slug });
    const config = await portfolioRepository.getPortfolioBySlug(slug);
    if (!config) throw new NotFoundError('Portfolio not found');
    if (!config.published) throw new AuthorizationError('This portfolio has not been published yet.');

    const devDetails = await portfolioRepository.getFullDeveloperDetails(config.userId);
    if (!devDetails) throw new NotFoundError('Developer details not found');

    const projects = await portfolioRepository.getPortfolioProjects(config.id);

    return {
      portfolio: config,
      developer: devDetails,
      projects,
    };
  }

  // --- 5. Auto Import from Profile & Projects ---
  async importProfileData(userId: string) {
    this.logInfo('Assembling auto-import values', { userId });
    const devDetails = await portfolioRepository.getFullDeveloperDetails(userId);
    if (!devDetails) throw new NotFoundError('Developer profile details not found');

    const userProjects = await projectRepository.listProjects(userId);

    // Format fields for portfolio editor merge
    return {
      headline: devDetails.profile?.headline || '',
      bio: devDetails.profile?.bio || '',
      socialLinks: {
        github: devDetails.profile?.githubUrl || '',
        linkedin: devDetails.profile?.linkedinUrl || '',
        twitter: devDetails.profile?.twitterUrl || '',
        portfolio: devDetails.profile?.portfolioUrl || '',
        email: devDetails.user.email || '',
      },
      developer: devDetails,
      projects: userProjects,
    };
  }

  // --- 6. Delete Portfolio ---
  async deletePortfolio(userId: string) {
    this.logInfo('Deleting portfolio', { userId });
    const config = await portfolioRepository.getPortfolioByUserId(userId);
    if (!config) throw new NotFoundError('Portfolio not found');
    return await portfolioRepository.deletePortfolio(config.id);
  }
}
export const portfolioService = new PortfolioService();
