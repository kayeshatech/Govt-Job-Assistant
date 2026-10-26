import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { APP_CONFIG } from '../config/brand';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Full name must have at least 3 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the academic terms' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await login(data.email, data.password);
      showToast('Registration Successful', 'Welcome to Govexa! Proceed to the onboarding wizard.', 'success');
      navigate(ROUTES.ONBOARDING);
    } catch {
      showToast('Error', 'Unable to complete registration. Please try again.', 'warning');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      {/* Brand header */}
      <div className="text-center mb-6">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-nocturne flex items-center justify-center text-starlight font-bold text-lg">
            G
          </div>
          <span className="text-2xl font-black text-nocturne">{APP_CONFIG.name}</span>
        </Link>
        <h1 className="text-xl font-bold text-nocturne">Create Your Aspirant Account</h1>
        <p className="text-xs text-wisteria mt-1">
          Open to all age groups, students & graduates preparing for Indian exams.
        </p>
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Legal Name (as in Class 10 Certificate)"
            placeholder="e.g. Priya Sharma"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            {...register('fullName')}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="aspirant@gmail.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
            required
          />

          <Input
            label="Create Password"
            type="password"
            placeholder="Minimum 6 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            required
          />

          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-eclipse cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-opaline text-nocturne focus:ring-wisteria"
                {...register('agreeTerms')}
              />
              <span>
                I agree to the academic terms and understand that all exam dates and notifications should be cross-verified with official gazettes.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="mt-1 text-xs text-wisteria font-medium">{errors.agreeTerms.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-4"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Register & Continue to Onboarding
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-opaline/60 text-center text-xs text-eclipse">
          Already have an aspirant account?{' '}
          <Link to={ROUTES.LOGIN} className="font-bold text-nocturne hover:text-wisteria underline">
            Log In
          </Link>
        </div>
      </Card>

      {/* Trust pill */}
      <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-wisteria text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-wisteria" />
        <span>No age ceiling for platform registration • Educational Prototype</span>
      </div>
    </div>
  );
};
