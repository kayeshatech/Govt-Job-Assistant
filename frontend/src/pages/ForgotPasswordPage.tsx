import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { APP_CONFIG } from '../config/brand';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useToast } from '../context/ToastContext';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid registered email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    // Simulated recovery dispatch
    setSubmittedEmail(data.email);
    showToast('Reset Instructions Dispatched', `Password recovery link sent to ${data.email}`, 'success');
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <div className="text-center mb-6">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-nocturne flex items-center justify-center text-starlight font-bold text-lg">
            G
          </div>
          <span className="text-2xl font-black text-nocturne">{APP_CONFIG.name}</span>
        </Link>
        <h1 className="text-xl font-bold text-nocturne">Recover Aspirant Account</h1>
        <p className="text-xs text-wisteria mt-1">We will send password reset instructions to your email</p>
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        {submittedEmail ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-nocturne text-starlight flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-nocturne">Reset Instructions Sent</h2>
            <p className="text-xs text-eclipse leading-relaxed">
              We have dispatched recovery steps to <strong className="text-nocturne">{submittedEmail}</strong>. In production, this link expires in 15 minutes.
            </p>
            <div className="pt-4 border-t border-opaline/60">
              <Link to={ROUTES.LOGIN}>
                <Button variant="primary" size="md" className="w-full">
                  Return to Log In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="e.g. aspirant@domain.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Send Password Reset Link
            </Button>

            <div className="pt-4 border-t border-opaline/60 text-center">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-wisteria hover:text-nocturne"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Log In</span>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
