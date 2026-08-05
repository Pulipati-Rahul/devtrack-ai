'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotificationStore } from '@/store/use-notification-store';
import { Icons } from '@/components/ui/icons';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useNotificationStore();
  const [loading, setLoading] = React.useState(false);

  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFields) => {
    if (!token) {
      addToast('Invalid or missing verification token.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Simulate API call for password reset using verification token
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
      addToast('Password successfully reset!', 'success');
      router.push('/login');
    } catch (err: any) {
      setLoading(false);
      addToast(err?.message || 'Something went wrong.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Set New Password</h2>
        <p className="text-xs text-muted-foreground mt-1">Please enter your new password details below.</p>
      </div>

      {!token ? (
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive leading-relaxed">
            Missing verification token. Reset password links must contain a valid Better Auth token query parameter.
          </div>
          <div>
            <Link
              href="/forgot-password"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-foreground hover:bg-secondary rounded-lg border border-border/40 transition-colors justify-center items-center text-center"
            >
              Request New Link
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              disabled={loading}
              {...register('password')}
              className={`w-full bg-secondary/35 border ${
                errors.password ? 'border-destructive' : 'border-border/40'
              } rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50`}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              disabled={loading}
              {...register('confirmPassword')}
              className={`w-full bg-secondary/35 border ${
                errors.confirmPassword ? 'border-destructive' : 'border-border/40'
              } rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1.5">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity items-center justify-center text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Icons.Spinner className="animate-spin" size={14} />
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      )}

      <div className="text-center text-xs text-muted-foreground border-t border-border/20 pt-4">
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center py-8">
        <Icons.Spinner className="animate-spin text-primary" size={24} />
      </div>
    }>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
