'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUp } from '@/lib/auth-client';
import { useNotificationStore } from '@/store/use-notification-store';
import { Icons } from '@/components/ui/icons';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useNotificationStore();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setLoading(true);
    try {
      await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: '/dashboard',
      }, {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          addToast('Account created successfully!', 'success');
          router.push('/dashboard');
          router.refresh();
        },
        onError: (ctx) => {
          setLoading(false);
          addToast(ctx.error.message || 'Registration failed. Email might be in use.', 'error');
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
        <h2 className="text-xl font-display font-semibold text-foreground">Create Account</h2>
        <p className="text-xs text-muted-foreground mt-1">Get started with a free account for DevTrack AI</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Jane Doe"
            disabled={loading}
            {...register('name')}
            className={`w-full bg-secondary/35 border ${
              errors.name ? 'border-destructive' : 'border-border/40'
            } rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50`}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1.5">{errors.name.message}</p>
          )}
        </div>

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
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Password
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
            Confirm Password
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
              'Create Account'
            )}
          </button>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground border-t border-border/20 pt-4">
        <span>Already have an account? </span>
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
