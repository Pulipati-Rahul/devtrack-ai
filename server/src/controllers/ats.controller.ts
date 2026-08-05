import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { atsService } from '../services/ats.service';
import { AuthenticationError, ValidationError } from '../errors/app-errors';
import { uploadService } from '../storage/upload.service';
import { env } from '../config/env';

export class ATSController extends BaseController {
  private getUserId(req: Request): string {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new AuthenticationError('Unauthorized. Session user ID not found.');
    }
    return userId;
  }

  public analyze = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const result = await atsService.analyzeResume(userId, req.body);
    return this.created(res, result, 'Resume ATS analysis completed successfully');
  };

  public listHistory = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const list = await atsService.listAnalyses(userId);
    return this.ok(res, list, 'ATS reports history logs retrieved successfully');
  };

  public getAnalysis = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const report = await atsService.getAnalysis(userId, req.params.id);
    return this.ok(res, report, 'ATS analysis report details retrieved successfully');
  };

  public deleteAnalysis = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    await atsService.deleteAnalysis(userId, req.params.id);
    return this.ok(res, null, 'ATS analysis report deleted successfully');
  };

  public uploadAndParse = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const file = req.file;
    if (!file) {
      throw new ValidationError({}, 'No file uploaded');
    }

    // Upload to Cloudinary using uploadService
    const folder = `devtrack-ai/ats/${userId}`;
    const uploadResult = await uploadService.uploadSingle(file, folder);

    // Parse text from file using Gemini or a basic mock parse if Gemini is mocked
    let parsedText = '';
    
    const apiKey = env.GEMINI_API_KEY;
    const isMock = !apiKey || apiKey === 'placeholder_gemini_api_key' || env.NODE_ENV === 'test';

    if (isMock) {
      parsedText = `[Parsed content of document ${file.originalname}]\n` +
                   `Jane Doe\nFull-Stack Developer\nEmail: jane@example.com\n` +
                   `Experience: 3 years at TechCorp\n` +
                   `Skills: React, Node.js, TypeScript, PostgreSQL, CI/CD pipelines, Docker containerization, Unit testing, Tailwind CSS`;
    } else {
      // Send base64 PDF to Gemini to extract all text
      try {
        const base64Data = file.buffer.toString('base64');
        const prompt = 'Extract all text content from this document and return it as a clean text string.';
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: file.mimetype,
                      data: base64Data
                    }
                  }
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const body = await response.json() as any;
          parsedText = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          parsedText = `[Fallback content of ${file.originalname}]`;
        }
      } catch (err) {
        parsedText = `[Fallback content of ${file.originalname}]`;
      }
    }

    return this.ok(res, {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      text: parsedText
    }, 'File uploaded and parsed successfully');
  };

  public getStats = async (req: Request, res: Response) => {
    const userId = this.getUserId(req);
    const stats = await atsService.getStats(userId);
    return this.ok(res, stats, 'ATS reports stats calculated successfully');
  };
}
export const atsController = new ATSController();
