import { Router } from 'express';
import healthRouter from '../health';
import analyticsRouter from './analytics';
import profileRouter from './profile';
import resumeRouter from './resume';
import atsRouter from './ats';
import projectRouter from './project';
import portfolioRouter from './portfolio';
import dsaRouter from './dsa';
import interviewRouter from './interview';
import aiRouter from './ai';
import careerRouter from './career';
import settingsRouter from './settings';
import accountRouter from './account';
import adminRouter from './admin';
import uploadRouter from './upload';
import emailRouter from './email';
import searchRouter from './search';

const v1Router = Router();

// Mount health endpoints
v1Router.use('/health', healthRouter);

// Mount analytics endpoints
v1Router.use('/analytics', analyticsRouter);

// Mount profile endpoints
v1Router.use('/profile', profileRouter);

// Mount resume endpoints
v1Router.use('/resumes', resumeRouter);

// Mount ATS endpoints
v1Router.use('/ats', atsRouter);

// Mount project endpoints
v1Router.use('/projects', projectRouter);

// Mount portfolio endpoints
v1Router.use('/portfolio', portfolioRouter);

// Mount DSA endpoints
v1Router.use('/dsa', dsaRouter);

// Mount Interview Prep endpoints
v1Router.use('/interview', interviewRouter);

// Mount AI Infrastructure endpoints
v1Router.use('/ai', aiRouter);

// Mount Career Coach endpoints
v1Router.use('/career', careerRouter);

// Mount Settings & Sessions endpoints
v1Router.use('/', settingsRouter);

// Mount Account endpoints
v1Router.use('/account', accountRouter);

// Mount Admin Panel endpoints
v1Router.use('/admin', adminRouter);

// Mount Upload endpoints
v1Router.use('/upload', uploadRouter);

// Mount Email endpoints
v1Router.use('/email', emailRouter);

// Mount Search & Command Palette endpoints
v1Router.use('/search', searchRouter);

export default v1Router;
