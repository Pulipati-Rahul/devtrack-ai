import * as React from 'react';
import { MasterLayout } from './MasterLayout';

// 1. Welcome Email Template
export function WelcomeEmail({ name }: { name: string }) {
  return (
    <MasterLayout title="Welcome to DevTrack AI">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Welcome, {name}!</h2>
      <p style={{ margin: '0 0 16px 0' }}>
        We are thrilled to welcome you to DevTrack AI—your complete software engineering career copilot. Build resumes, optimize profiles, practice DSA coding, and track your projects in one unified platform.
      </p>
      <p style={{ margin: '0 0 24px 0' }}>Get started by logging in and building your first ATS-friendly developer resume.</p>
      <a href="https://devtrack-ai.com/dashboard" style={{ display: 'inline-block', backgroundColor: '#6366f1', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
        Explore Dashboard
      </a>
    </MasterLayout>
  );
}

// 2. Email Verification Template
export function EmailVerification({ name, url }: { name: string; url: string }) {
  return (
    <MasterLayout title="Verify Your Email Address">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Confirm your registration</h2>
      <p style={{ margin: '0 0 16px 0' }}>Hi {name}, thank you for registering. Please click the button below to verify your email address and activate your account.</p>
      <a href={url} style={{ display: 'inline-block', backgroundColor: '#6366f1', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
        Verify Email Address
      </a>
      <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>If the button doesn't work, copy and paste this link: {url}</p>
    </MasterLayout>
  );
}

// 3. Password Reset Template
export function PasswordReset({ name, url }: { name: string; url: string }) {
  return (
    <MasterLayout title="Reset Your Password">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Password Reset Request</h2>
      <p style={{ margin: '0 0 16px 0' }}>Hi {name}, we received a request to reset your password. Click the button below to choose a new password.</p>
      <a href={url} style={{ display: 'inline-block', backgroundColor: '#ef4444', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
        Reset Password
      </a>
      <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
    </MasterLayout>
  );
}

// 4. Password Changed Template
export function PasswordChanged({ name }: { name: string }) {
  return (
    <MasterLayout title="Your Password Was Changed">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Password Updated</h2>
      <p style={{ margin: '0 0 16px 0' }}>Hi {name}, this email confirms that your account password was recently changed.</p>
      <p style={{ margin: 0 }}>If you did not perform this change, please immediately contact our support team to secure your account credentials.</p>
    </MasterLayout>
  );
}

// 5. Account Deleted Template
export function AccountDeleted({ name }: { name: string }) {
  return (
    <MasterLayout title="Your Account Was Deleted">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Goodbye, {name}</h2>
      <p style={{ margin: '0 0 16px 0' }}>Your account deletion request has been completed successfully. All data relating to your resumes, portfolios, and coding progress has been permanently deleted.</p>
      <p style={{ margin: 0 }}>Thank you for using DevTrack AI. We hope to see you again!</p>
    </MasterLayout>
  );
}

// 6. Resume Export Ready Template
export function ResumeExportReady({ name, resumeTitle }: { name: string; resumeTitle: string }) {
  return (
    <MasterLayout title="Your Resume Export is Ready">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Export Complete</h2>
      <p style={{ margin: '0 0 16px 0' }}>Hi {name}, your developer resume <strong>{resumeTitle}</strong> has been successfully compiled and is ready for download in PDF format.</p>
      <p style={{ margin: 0 }}>Check your dashboard under the Resume Builder section to access the file.</p>
    </MasterLayout>
  );
}

// 7. ATS Report Ready Template
export function AtsReportReady({ name, score }: { name: string; score: number }) {
  return (
    <MasterLayout title="Your ATS Audit Report is Ready">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>ATS Scan Complete</h2>
      <p style={{ margin: '0 0 16px 0' }}>Hi {name}, our AI scanning engine finished auditing your resume template matches.</p>
      <div style={{ backgroundColor: '#27272a', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', display: 'block' }}>ATS Score</span>
        <span style={{ fontSize: '32px', fontWeight: 'bold', color: score >= 80 ? '#10b981' : '#f59e0b' }}>{score} / 100</span>
      </div>
      <p style={{ margin: 0 }}>Log in to view the detailed improvement suggestions and keyword gaps identified.</p>
    </MasterLayout>
  );
}

// 8. Portfolio Published Template
export function PortfolioPublished({ name, url }: { name: string; url: string }) {
  return (
    <MasterLayout title="Your Developer Portfolio is Live!">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Portfolio Live</h2>
      <p style={{ margin: '0 0 16px 0' }}>Hi {name}, congratulations! Your software engineering developer portfolio has been published successfully.</p>
      <a href={url} style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
        View Public Site
      </a>
      <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Share this link with recruiters and on your social handles to showcase your project experiences!</p>
    </MasterLayout>
  );
}

// 9. General Notification Template
export function GeneralNotification({ name, message }: { name: string; message: string }) {
  return (
    <MasterLayout title="New Notification from DevTrack AI">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 16px 0' }}>Platform Alert</h2>
      <p style={{ margin: '0 0 16px 0' }}>Hi {name}, you have a new alert on your dashboard:</p>
      <p style={{ fontStyle: 'italic', paddingLeft: '12px', borderLeft: '4px solid #6366f1', margin: '0 0 20px 0' }}>{message}</p>
      <p style={{ margin: 0 }}>Log in to your account to review this message and update preferences.</p>
    </MasterLayout>
  );
}
