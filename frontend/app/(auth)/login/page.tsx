'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi, setAccessToken, extractApiError } from '@/lib/api';

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  global?: string;
}

function validate(fields: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!fields.email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Enter a valid email address.';
  if (!fields.password) errors.password = 'Password is required.';
  else if (fields.password.length < 8)
    errors.password = 'Password must be at least 8 characters.';
  return errors;
}

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { data } = await authApi.login(form);
      setAccessToken(data.data.accessToken);
      const role = data.data.user.role;
      router.push(role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setErrors({ global: extractApiError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-block lg:hidden text-brand-900 text-lg font-light tracking-[0.2em] uppercase mb-8"
        >
          DRAPE
        </Link>
        <p className="text-xs tracking-[0.3em] uppercase text-brand-400 mb-2">Welcome back</p>
        <h1 className="text-2xl font-light text-brand-900">Sign in to your account</h1>
      </div>

      {/* Global error */}
      {errors.global && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm">
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-brand-500 hover:text-brand-900 underline underline-offset-2 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-brand-900 font-medium hover:underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
