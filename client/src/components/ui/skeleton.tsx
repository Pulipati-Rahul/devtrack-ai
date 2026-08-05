import * as React from 'react';
import { Icons } from './icons';

export function LoadingSpinner({ className = 'h-6 w-6' }: { className?: string }) {
  return <Icons.Spinner className={`animate-spin text-primary ${className}`} />;
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner className="h-10 w-10" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse font-display">Loading DevTrack AI...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded bg-muted/60 ${className}`} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-6 w-12 rounded-lg" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-[1px] w-full bg-border/40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4 border border-border/40 rounded-xl p-4 bg-card">
      <div className="flex items-center justify-between pb-2 border-b border-border/20">
        <Skeleton className="h-5 w-1/6" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-10 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Top statistics skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      {/* Main dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TableSkeleton />
        </div>
        <div className="lg:col-span-1">
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
