'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi, setAccessToken, extractApiError, RegisterPayload } from '@/lib/api';

type FormState = RegisterPayload;

interface FormErrors extends Partial<Record<keyof FormState, string>> {
  global?: string;
}

function validate(fields: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!fields.firstName.trim()) errors.firstName = 'First name is required.';
  if (!fields.lastName.trim()) errors.lastName = 'Last name is required.';

  if (!fields.email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Enter a valid email address.';

  if (!fields.phone) errors.phone = 'Phone number is required.';
  else if (!/^\+?[1-9]\d{6,14}$/.test(fields.phone.replace(/[\s\-()]/g, '')))
    errors.phone = 'Enter a valid international phone number (e.g. +447911123456).';

  if (!fields.city.trim()) errors.city = 'City is required.';
  if (!fields.address.trim()) errors.address = 'Address is required.';

  if (!fields.password) errors.password = 'Password is required.';
  else if (fields.password.length < 8)
    errors.password = 'Password must be at least 8 characters.';

  if (!fields.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (fields.password !== fields.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

const INITIAL: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  password: '',
  confirmPassword: '',
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL);
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
      const { data } = await authApi.register(form);
      setAccessToken(data.data.accessToken);
      router.push('/');
    } catch (err) {
      setErrors({ global: extractApiError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-block lg:hidden text-brand-900 text-lg font-light tracking-[0.2em] uppercase mb-8"
        >
          DRAPE
        </Link>
        <p className="text-xs tracking-[0.3em] uppercase text-brand-400 mb-2">Get started</p>
        <h1 className="text-2xl font-light text-brand-900">Create your account</h1>
      </div>

      {/* Global error */}
      {errors.global && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm">
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Jane"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />
        </div>

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
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+447911123456"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        {/* City + Address row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="London"
            value={form.city}
            onChange={handleChange}
            error={errors.city}
          />
          <Input
            label="Address"
            name="address"
            type="text"
            autoComplete="street-address"
            placeholder="10 Downing St"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
          />
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        {/* Password strength bar */}
        {form.password.length > 0 && (
          <PasswordStrengthIndicator password={form.password} />
        )}

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" loading={loading} fullWidth className="mt-3">
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-brand-900 font-medium hover:underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'bg-red-400',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-lime-500',
    'bg-green-500',
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? colors[strength] : 'bg-brand-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-brand-400 w-16 text-right">{labels[strength]}</span>
    </div>
  );
}
