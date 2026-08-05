'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  ExternalLink,
  Code2,
  Calendar,
  Layers,
  GraduationCap,
  Award,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PublicPortfolioResponse {
  portfolio: {
    id: string;
    headline: string | null;
    bio: string | null;
    theme: string | null;
    appearance: {
      primaryColor?: string;
      accentColor?: string;
      typography?: string;
      darkMode?: boolean;
      cardStyle?: string;
      spacing?: string;
      borderRadius?: string;
      heroBgUrl?: string;
      resumeUrl?: string;
      profileImageUrl?: string;
    } | null;
    sectionsConfig: {
      id: string;
      name: string;
      visible: boolean;
      sortOrder: number;
    }[] | null;
    seoSettings: {
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      canonicalUrl?: string | null;
    } | null;
    socialLinks: {
      github?: string | null;
      linkedin?: string | null;
      twitter?: string | null;
      email?: string | null;
    } | null;
  };
  developer: {
    user: {
      name: string;
      email: string;
      image: string | null;
    };
    profile: {
      headline: string | null;
      bio: string | null;
    } | null;
    educations: any[];
    experiences: any[];
    skills: any[];
    certifications: any[];
    achievements: any[];
  };
  projects: {
    portfolioProjectId: string;
    featured: boolean;
    sortOrder: number;
    project: {
      id: string;
      title: string;
      description: string | null;
      technologies: string | null;
      githubUrl: string | null;
      liveUrl: string | null;
    };
  }[];
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;

  // --- 1. Query Public Data ---
  const { data, isLoading, isError } = useQuery<PublicPortfolioResponse>({
    queryKey: ['publicPortfolio', slug],
    queryFn: () => apiClient.get<PublicPortfolioResponse>(`/portfolio/${slug}`),
    retry: 1,
  });

  // SEO & Meta Injections
  React.useEffect(() => {
    if (!data) return;
    const { portfolio, developer } = data;
    const seo = portfolio.seoSettings || {};
    const socials = portfolio.socialLinks || {};
    const appearance = portfolio.appearance || {};
    
    // Title
    const docTitle = seo.title || `${developer.user.name} - Professional Developer Portfolio`;
    document.title = docTitle;

    // Helper
    const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', nameOrProperty);
        else el.setAttribute('name', nameOrProperty);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMeta('description', seo.description || portfolio.bio || developer.profile?.bio || 'Developer portfolio page.');
    setMeta('keywords', seo.keywords || 'Portfolio, Developer, Software Engineer');
    
    // OG
    setMeta('og:title', docTitle, true);
    setMeta('og:description', seo.description || portfolio.bio || developer.profile?.bio || '', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', window.location.href, true);
    if (appearance.profileImageUrl || developer.user.image) {
      setMeta('og:image', appearance.profileImageUrl || developer.user.image || '', true);
    }

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', docTitle);
    setMeta('twitter:description', seo.description || portfolio.bio || developer.profile?.bio || '');
    if (appearance.profileImageUrl || developer.user.image) {
      setMeta('twitter:image', appearance.profileImageUrl || developer.user.image || '');
    }

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    // JSON-LD Structured Data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      'mainEntity': {
        '@type': 'Person',
        'name': developer.user.name,
        'jobTitle': portfolio.headline || developer.profile?.headline || 'Software Engineer',
        'description': portfolio.bio || developer.profile?.bio || '',
        'image': appearance.profileImageUrl || developer.user.image,
        'sameAs': [
          socials.github,
          socials.linkedin,
          socials.twitter
        ].filter(Boolean)
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.innerHTML = JSON.stringify(schema);
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading developer profile...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Profile Offline or Not Found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The developer portfolio you are trying to view does not exist or has not been published.
          </p>
        </div>
      </div>
    );
  }

  const { portfolio, developer, projects } = data;
  const appearance = portfolio.appearance || {};
  const sections = portfolio.sectionsConfig || [];
  const socials = portfolio.socialLinks || {};


  // Extract appearance variables
  const primaryColor = appearance.primaryColor || 'hsl(215, 20%, 65%)';
  const accentColor = appearance.accentColor || 'hsl(255, 60%, 60%)';
  const typography = appearance.typography || 'Inter';
  const darkMode = appearance.darkMode ?? true;
  const radius = appearance.borderRadius === 'none' ? '0px' : appearance.borderRadius === 'md' ? '6px' : appearance.borderRadius === 'xl' ? '16px' : '10px';
  const spacing = appearance.spacing === 'compact' ? 'py-4 my-2' : appearance.spacing === 'relaxed' ? 'py-12 my-6' : 'py-8 my-4';

  const visibleSections = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Layout templates configuration
  const fontStyle = { fontFamily: typography };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        darkMode ? 'bg-[#0b0c10] text-gray-200' : 'bg-gray-50 text-gray-800'
      }`}
      style={fontStyle}
    >
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Render visible sections in user configuration sorting order */}
        {visibleSections.map((sec) => {
          switch (sec.id) {
            case 'hero':
              return (
                <header
                  key={sec.id}
                  className={`${spacing} space-y-4 border-b border-border/20 pb-8 rounded-xl px-6 relative overflow-hidden`}
                  style={appearance.heroBgUrl ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, ${darkMode ? '0.7' : '0.45'}), rgba(0, 0, 0, ${darkMode ? '0.9' : '0.75'})), url(${appearance.heroBgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : undefined}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-widest font-extrabold" style={{ color: accentColor }}>
                        Developer Portfolio
                      </span>
                      <h1 className={`text-4xl font-extrabold ${appearance.heroBgUrl ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {developer.user.name}
                      </h1>
                      <p className={`text-base font-medium ${appearance.heroBgUrl ? 'text-gray-200' : 'text-muted-foreground'}`}>
                        {portfolio.headline || developer.profile?.headline || 'Software Engineer'}
                      </p>
                      
                      {appearance.resumeUrl && (
                        <a
                          href={appearance.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs font-semibold mt-2"
                        >
                          <GraduationCap size={12} />
                          <span>Download Resume</span>
                        </a>
                      )}
                    </div>

                    {(appearance.profileImageUrl || developer.user.image) && (
                      <img
                        src={appearance.profileImageUrl || developer.user.image || ''}
                        alt={developer.user.name}
                        className="h-20 w-20 rounded-full object-cover border-2 border-border/40 shadow-sm"
                      />
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed max-w-2xl relative z-10 ${appearance.heroBgUrl ? 'text-gray-300' : 'text-muted-foreground'}`}>
                    {portfolio.bio || developer.profile?.bio || 'Passionate developer building apps.'}
                  </p>
                </header>
              );

            case 'skills':
              if (developer.skills.length === 0) return null;
              return (
                <section key={sec.id} className={spacing}>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider mb-4" style={{ color: primaryColor }}>
                    {sec.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {developer.skills.map((s: any) => (
                      <span
                        key={s.id}
                        className="text-xs border px-3 py-1.5 font-medium shadow-xs"
                        style={{
                          borderRadius: radius,
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        {s.name} {s.level ? `(${s.level})` : ''}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case 'projects': {
              const featured = projects.filter((item) => item.featured);
              if (featured.length === 0) return null;
              return (
                <section key={sec.id} className={spacing}>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider mb-4" style={{ color: primaryColor }}>
                    {sec.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featured.map((item) => (
                      <div
                        key={item.project.id}
                        className="p-5 border flex flex-col justify-between gap-4 shadow-xs"
                        style={{
                          borderRadius: radius,
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'white',
                        }}
                      >
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-foreground">{item.project.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {item.project.description || 'No description added.'}
                          </p>
                          {item.project.technologies && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {item.project.technologies.split(',').map((tech) => (
                                <span
                                  key={tech}
                                  className="text-[9px] bg-secondary border border-border/30 px-2 py-0.5 rounded text-foreground font-semibold"
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-2 text-[10px] text-gray-500 font-bold border-t border-border/10">
                          {item.project.githubUrl && (
                            <a
                              href={item.project.githubUrl}
                              target="_blank"
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <Github size={11} /> Code
                            </a>
                          )}
                          {item.project.liveUrl && (
                            <a
                              href={item.project.liveUrl}
                              target="_blank"
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <ExternalLink size={11} /> Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            case 'experience':
              if (developer.experiences.length === 0) return null;
              return (
                <section key={sec.id} className={spacing}>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider mb-4" style={{ color: primaryColor }}>
                    {sec.name}
                  </h3>
                  <div className="space-y-4 border-l border-border/20 pl-4">
                    {developer.experiences.map((exp: any) => (
                      <div key={exp.id} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#0b0c10] border border-border" />
                        <h4 className="text-xs font-bold text-foreground">
                          {exp.role} @ <span style={{ color: accentColor }}>{exp.company}</span>
                        </h4>
                        <span className="text-[10px] text-gray-500 block">
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} -{' '}
                          {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                        </span>
                        {exp.description && <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'education':
              if (developer.educations.length === 0) return null;
              return (
                <section key={sec.id} className={spacing}>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider mb-4" style={{ color: primaryColor }}>
                    {sec.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {developer.educations.map((edu: any) => (
                      <div key={edu.id} className="p-4 border rounded-lg bg-secondary/5 border-border/30">
                        <h4 className="text-xs font-bold text-foreground">
                          {edu.degree} in {edu.fieldOfStudy}
                        </h4>
                        <span className="text-[10px] text-gray-500 block mt-0.5">{edu.institution}</span>
                        <span className="text-[9px] text-muted-foreground mt-1 block">
                          Graduation: {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'achievements':
              if (developer.achievements.length === 0) return null;
              return (
                <section key={sec.id} className={spacing}>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider mb-4" style={{ color: primaryColor }}>
                    {sec.name}
                  </h3>
                  <div className="space-y-3">
                    {developer.achievements.map((ach: any) => (
                      <div key={ach.id} className="flex gap-3 items-start p-3 border rounded-lg bg-secondary/5 border-border/20">
                        <Award className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{ach.title}</h4>
                          <span className="text-[9px] text-gray-500 block">Awarded by: {ach.issuer || 'N/A'}</span>
                          {ach.description && <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{ach.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'certifications':
              if (developer.certifications.length === 0) return null;
              return (
                <section key={sec.id} className={spacing}>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider mb-4" style={{ color: primaryColor }}>
                    {sec.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {developer.certifications.map((cert: any) => (
                      <div key={cert.id} className="p-4 border rounded-lg bg-secondary/5 border-border/25 flex gap-3 items-start">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{cert.name}</h4>
                          <span className="text-[9px] text-gray-500 block">Issuer: {cert.issuer}</span>
                          <span className="text-[9px] text-muted-foreground block mt-1">
                            Earned: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'contact':
              return (
                <section key={sec.id} className={`${spacing} border-t border-border/20 pt-8`}>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider mb-4" style={{ color: primaryColor }}>
                    {sec.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs font-medium">
                    {socials.email && (
                      <a href={`mailto:${socials.email}`} className="flex items-center gap-1 hover:text-foreground">
                        <Mail size={12} /> {socials.email}
                      </a>
                    )}
                    {socials.github && (
                      <a href={socials.github} target="_blank" className="flex items-center gap-1 hover:text-foreground">
                        <Github size={12} /> GitHub Profile
                      </a>
                    )}
                    {socials.linkedin && (
                      <a href={socials.linkedin} target="_blank" className="flex items-center gap-1 hover:text-foreground">
                        <Linkedin size={12} /> LinkedIn Profile
                      </a>
                    )}
                    {socials.twitter && (
                      <a href={socials.twitter} target="_blank" className="flex items-center gap-1 hover:text-foreground">
                        <Twitter size={12} /> Twitter / X
                      </a>
                    )}
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </div>

      <footer className="border-t border-border/10 py-6 text-center text-[10px] text-gray-500">
        <span>Generated with DevTrack AI. All rights reserved.</span>
      </footer>
    </div>
  );
}
