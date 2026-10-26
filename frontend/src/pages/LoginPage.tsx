import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { APP_CONFIG } from '../config/brand';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'priya.sharma@aspirant.in',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      showToast('Welcome Back!', 'Logged into your preparation dashboard.', 'success');
      navigate(from, { replace: true });
    } catch {
      showToast('Login Failed', 'Invalid credentials or connection error.', 'warning');
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsDemoLoading(true);
    setValue('email', 'priya.sharma@aspirant.in');
    setValue('password', 'password123');
    await login('priya.sharma@aspirant.in', 'password123');
    showToast('Demo Aspirant Session Loaded', 'Logged in as Priya Sharma (UPSC & KSET Aspirant)', 'success');
    setIsDemoLoading(false);
    navigate(ROUTES.DASHBOARD);
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
        <h1 className="text-xl font-bold text-nocturne">Log In to Your Dashboard</h1>
        <p className="text-xs text-wisteria mt-1">Access your saved exams, syllabus roadmap & mock performance</p>
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        {/* 1-Click Demo Login Banner */}
        <div className="p-3.5 rounded-xl bg-opaline/30 border border-opaline/70 mb-5 flex items-center justify-between gap-3">
          <div>
            <span className="block text-xs font-bold text-nocturne">Demo Aspirant Mode</span>
            <span className="block text-[11px] text-wisteria">Pre-filled with UPSC & KSET sample track</span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleQuickDemoLogin}
            isLoading={isDemoLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Quick Fill & Go
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="aspirant@gmail.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-nocturne uppercase tracking-wider">
                Password
              </label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs font-semibold text-wisteria hover:text-nocturne underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-4"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-opaline/60 text-center text-xs text-eclipse">
          New to Govexa?{' '}
          <Link to={ROUTES.REGISTER} className="font-bold text-nocturne hover:text-wisteria underline">
            Register Account
          </Link>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-wisteria text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-wisteria" />
        <span>Development Preview Environment • Mock Authentication</span>
      </div>
    </div>
  );
};
