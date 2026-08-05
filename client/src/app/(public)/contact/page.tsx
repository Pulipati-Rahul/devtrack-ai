'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { Container, PageHeader } from '@/components/layout/reusable';
import { useNotificationStore } from '@/store/use-notification-store';
import { Icons } from '@/components/ui/icons';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(4, 'Subject must be at least 4 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFields = z.infer<typeof contactSchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function ContactPage() {
  const { addToast } = useNotificationStore();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFields>({
    resolver: zodResolver(contactSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFields) => {
    setSubmitting(true);
    try {
      // Simulate form submission delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitting(false);
      addToast(`Thank you, ${data.name}! Your message was successfully sent (simulated).`, 'success');
      reset();
    } catch (err: any) {
      setSubmitting(false);
      addToast(err?.message || 'Something went wrong.', 'error');
    }
  };

  return (
    <Container className="py-12 space-y-12">
      <motion.div {...fadeInUp}>
        <PageHeader
          title="Contact Support"
          description="Have questions, suggestions, or feedback about DevTrack AI? Fill out the contact sheet below."
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
        {/* Support Channels */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
              <Mail size={18} className="text-primary" />
              <span>Email Support</span>
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For security reports, business operations queries, or API access waitlists, email us directly:
            </p>
            <div className="text-sm font-mono text-primary font-semibold">
              support@devtrack.ai
            </div>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <span>GitHub Discussions</span>
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you have feature recommendations or want to propose layout improvements, feel free to open a thread on our repository boards.
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border/40 rounded-xl p-6 md:p-8 shadow-sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                disabled={submitting}
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
                disabled={submitting}
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
                Subject
              </label>
              <input
                type="text"
                placeholder="Feature Request / Question"
                disabled={submitting}
                {...register('subject')}
                className={`w-full bg-secondary/35 border ${
                  errors.subject ? 'border-destructive' : 'border-border/40'
                } rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50`}
              />
              {errors.subject && (
                <p className="text-xs text-destructive mt-1.5">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Message Content
              </label>
              <textarea
                placeholder="Write details of your message here..."
                disabled={submitting}
                rows={4}
                {...register('message')}
                className={`w-full bg-secondary/35 border ${
                  errors.message ? 'border-destructive' : 'border-border/40'
                } rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50 resize-none`}
              />
              {errors.message && (
                <p className="text-xs text-destructive mt-1.5">{errors.message.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity items-center justify-center text-center disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              >
                {submitting ? (
                  <Icons.Spinner className="animate-spin" size={14} />
                ) : (
                  <>
                    <Send size={12} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Container>
  );
}
