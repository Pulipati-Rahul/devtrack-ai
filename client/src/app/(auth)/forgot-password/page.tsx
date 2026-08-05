'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotificationStore } from '@/store/use-notification-store';
import { Icons } from '@/components/ui/icons';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { addToast } = useNotificationStore();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    setLoading(true);
    try {
      // Simulate API call since SMTP is out of scope
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
      setSuccess(true);
      addToast(`Simulated reset link sent to ${data.email}!`, 'success');
    } catch (err: any) {
      setLoading(false);
      addToast(err?.message || 'Something went wrong.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Reset Password</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {success
            ? 'Check your inbox for a simulated password reset token'
            : 'Enter your email and we will send a password reset link.'}
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400 leading-relaxed">
            A simulated password reset email has been sent. In a production environment, this integrates with your SMTP handler to deliver a signed Better Auth verification token.
          </div>
          <div>
            <Link
              href="/reset-password?token=mock_token_12345"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity justify-center items-center text-center animate-pulse"
            >
              Simulate Reset Token Redirect
            </Link>
          </div>
        </div>
      ) : (
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
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity items-center justify-center text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Icons.Spinner className="animate-spin" size={14} />
              ) : (
                'Send Reset Link'
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
