import * as React from 'react';

/**
 * Centered responsive constraint container
 */
export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {children}
    </div>
  );
}

/**
 * Page title text token
 */
export function PageTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground ${className}`}>
      {children}
    </h1>
  );
}

/**
 * Page sub-text description token
 */
export function PageDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

/**
 * Master page header block containing title, details description, and action button alignment
 */
export function PageHeader({
  title,
  description,
  actions,
  className = '',
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5 mb-6 ${className}`}>
      <div className="space-y-1.5">
        {typeof title === 'string' ? <PageTitle>{title}</PageTitle> : title}
        {description && (typeof description === 'string' ? <PageDescription>{description}</PageDescription> : description)}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Sub section titles
 */
export function SectionHeader({
  title,
  actions,
  className = '',
}: {
  title: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between border-b border-border/20 pb-3 mb-4 ${className}`}>
      <h2 className="text-lg font-display font-semibold text-foreground">
        {title}
      </h2>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Master flex-column page content structure
 */
export function ContentWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  );
}
