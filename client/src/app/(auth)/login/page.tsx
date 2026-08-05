'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from '@/lib/auth-client';
import { useNotificationStore } from '@/store/use-notification-store';
import { Icons } from '@/components/ui/icons';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFields = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useNotificationStore();
  const [loading, setLoading] = React.useState(false);

  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    try {
      await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: redirectTo,
      }, {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          addToast('Successfully signed in!', 'success');
          router.push(redirectTo);
          router.refresh();
        },
        onError: (ctx) => {
          setLoading(false);
          addToast(ctx.error.message || 'Authentication failed. Please verify credentials.', 'error');
        }
      });
    } catch (err: any) {
      setLoading(false);
      addToast(err?.message || 'A network error occurred. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Welcome Back</h2>
        <p className="text-xs text-muted-foreground mt-1">Please enter your credentials to access your dashboard</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            disabled={loading}
            {...register('email')}
            className={`w-full bg-secondary/35 border ${
              errors.email ? 'border-destructive' : 'border-border/40'
            } rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50`}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <Link href="/forgot-password" className="text-[10px] text-primary font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity items-center justify-center text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Icons.Spinner className="animate-spin" size={14} />
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground border-t border-border/20 pt-4">
        <span>Don&apos;t have an account? </span>
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center py-8">
        <Icons.Spinner className="animate-spin text-primary" size={24} />
      </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
