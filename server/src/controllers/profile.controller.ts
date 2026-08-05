import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { profileService } from '../services/profile.service';
import { AuthenticationError, ValidationError } from '../errors/app-errors';

export class ProfileController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public getProfile = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.getFullProfile(userId);
    return this.ok(res, data, 'Full user profile dataset retrieved successfully');
  };

  public updateProfile = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.updateProfile(userId, req.body);
    return this.ok(res, data, 'Profile records updated successfully');
  };

  // --- Education CRUD ---
  public addEducation = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.addEducation(userId, req.body);
    return this.created(res, data, 'Education record added successfully');
  };

  public updateEducation = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.updateEducation(userId, req.params.id, req.body);
    return this.ok(res, data, 'Education record updated successfully');
  };

  public deleteEducation = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await profileService.deleteEducation(userId, req.params.id);
    return this.ok(res, null, 'Education record deleted successfully');
  };

  // --- Experience CRUD ---
  public addExperience = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.addExperience(userId, req.body);
    return this.created(res, data, 'Experience record added successfully');
  };

  public updateExperience = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.updateExperience(userId, req.params.id, req.body);
    return this.ok(res, data, 'Experience record updated successfully');
  };

  public deleteExperience = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await profileService.deleteExperience(userId, req.params.id);
    return this.ok(res, null, 'Experience record deleted successfully');
  };

  // --- Skills CRUD ---
  public addSkill = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.addSkill(userId, req.body);
    return this.created(res, data, 'Skill tag added successfully');
  };

  public deleteSkill = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await profileService.deleteSkill(userId, req.params.id);
    return this.ok(res, null, 'Skill tag deleted successfully');
  };

  // --- Certification CRUD ---
  public addCertification = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.addCertification(userId, req.body);
    return this.created(res, data, 'Certification added successfully');
  };

  public updateCertification = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.updateCertification(userId, req.params.id, req.body);
    return this.ok(res, data, 'Certification updated successfully');
  };

  public deleteCertification = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await profileService.deleteCertification(userId, req.params.id);
    return this.ok(res, null, 'Certification deleted successfully');
  };

  // --- Achievement CRUD ---
  public addAchievement = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.addAchievement(userId, req.body);
    return this.created(res, data, 'Achievement added successfully');
  };

  public updateAchievement = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const data = await profileService.updateAchievement(userId, req.params.id, req.body);
    return this.ok(res, data, 'Achievement updated successfully');
  };

  public deleteAchievement = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await profileService.deleteAchievement(userId, req.params.id);
    return this.ok(res, null, 'Achievement deleted successfully');
  };

  public uploadAvatar = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    if (!req.file) {
      throw new ValidationError({}, 'Avatar image file is required');
    }
    const result = await profileService.uploadAvatar(userId, req.file);
    return this.ok(res, result, 'Avatar image uploaded successfully');
  };

  public deleteAvatar = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const result = await profileService.deleteAvatar(userId);
    return this.ok(res, result, 'Avatar image removed successfully');
  };
}
export const profileController = new ProfileController();
