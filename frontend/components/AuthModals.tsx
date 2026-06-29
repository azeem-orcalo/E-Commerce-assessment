'use client';

import { useState, ChangeEvent, FormEvent, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { authApi, setAccessToken, extractApiError, type RegisterPayload } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

// Shared TextField sx — red focus ring, rounded corners
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.92rem',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,44,62,0.45)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: ACCENT,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

// Slide-up dialog transition
const SlideUp = forwardRef<unknown, TransitionProps & { children: React.ReactElement<unknown, string> }>(
  function SlideUp(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);
SlideUp.displayName = 'SlideUp';

// ── Password strength bar ───────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['Too weak', 'Weak', 'Fair', 'Strong'];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.75, mb: 0.5 }}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              bgcolor: i < score ? palette[score - 1] : 'rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </Box>
      {score > 0 && (
        <Typography sx={{ fontSize: '0.72rem', color: palette[score - 1], fontWeight: 600 }}>
          {labels[score - 1]}
        </Typography>
      )}
    </Box>
  );
}

// ── Left decorative panel ───────────────────────────────────
function LeftPanel() {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: NAVY,
        p: 4.5,
        width: 290,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* dot-grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(247,68,78,0.18) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          pointerEvents: 'none',
        }}
      />
      {/* glow blob */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -70,
          right: -70,
          width: 240,
          height: 240,
          borderRadius: '50%',
          bgcolor: 'rgba(247,68,78,0.1)',
          pointerEvents: 'none',
        }}
      />

      {/* Top: brand + copy */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff', letterSpacing: '0.06em', mb: 3 }}>
          Bin<Box component="span" sx={{ color: ACCENT }}>Azeem</Box>
        </Typography>
        <Typography
          sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, fontSize: '0.875rem', mb: 4 }}
        >
          Elevate your wardrobe with premium fashion crafted for comfort, designed for style.
        </Typography>
        {['Free Shipping over $50', 'Easy 30-Day Returns', 'Exclusive Member Deals'].map((item) => (
          <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT, flexShrink: 0 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 500 }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Bottom: fashion image */}
      <Box sx={{ position: 'relative', zIndex: 1, borderRadius: '12px', overflow: 'hidden', height: 200 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=280&fit=crop"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,44,62,0.55), transparent)',
          }}
        />
      </Box>
    </Box>
  );
}

// ─────────────────────── LOGIN FORM ────────────────────────
interface LoginFields {
  email: string;
  password: string;
}
interface LoginErrors extends Partial<LoginFields> {
  global?: string;
}

function validateLogin(f: LoginFields): LoginErrors {
  const e: LoginErrors = {};
  if (!f.email) e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.';
  if (!f.password) e.password = 'Password is required.';
  else if (f.password.length < 8) e.password = 'Must be at least 8 characters.';
  return e;
}

function LoginForm({ onSwitch, onClose }: { onSwitch: () => void; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<LoginFields>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const { data } = await authApi.login(form);
      setAccessToken(data.data.accessToken);
      onClose();
      router.push(data.data.user.role === 'ADMIN' ? '/admin' : '/');
      router.refresh();
    } catch (err) {
      setErrors({ global: extractApiError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ p: { xs: 3.5, md: 5 }, display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}
    >
      {/* Heading */}
      <Box sx={{ mb: 0.5 }}>
        <Typography
          sx={{
            color: ACCENT,
            fontWeight: 700,
            fontSize: '0.76rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            mb: 0.75,
          }}
        >
          Welcome back
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: NAVY, mb: 0.5 }}>
          Sign in to your account
        </Typography>
        <Typography variant="body2" sx={{ color: '#999' }}>
          Don&apos;t have an account?{' '}
          <Box
            component="span"
            onClick={onSwitch}
            sx={{
              color: ACCENT,
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Create one free
          </Box>
        </Typography>
      </Box>

      {errors.global && (
        <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.85rem' }}>
          {errors.global}
        </Alert>
      )}

      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        sx={fieldSx}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <TextField
          label="Password"
          name="password"
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          sx={fieldSx}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPw((p) => !p)}
                    edge="end"
                    size="small"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            component="span"
            sx={{
              fontSize: '0.8rem',
              color: '#aaa',
              cursor: 'pointer',
              '&:hover': { color: ACCENT },
              transition: 'color 0.2s',
            }}
          >
            Forgot password?
          </Typography>
        </Box>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{
          py: 1.75,
          fontWeight: 700,
          fontSize: '0.95rem',
          textTransform: 'none',
          borderRadius: '8px',
          mt: 0.5,
          boxShadow: '0 4px 14px rgba(247,68,78,0.35)',
          transition: 'transform 0.18s, box-shadow 0.18s',
          '&:hover:not(:disabled)': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 22px rgba(247,68,78,0.45)',
          },
        }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>

      {/* Divider + social hint */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.1)' }} />
        <Typography sx={{ fontSize: '0.75rem', color: '#bbb', whiteSpace: 'nowrap' }}>
          or continue with
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.1)' }} />
      </Box>

      {/* Google / Apple placeholders */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {[
          { label: 'Google', letter: 'G', color: '#ea4335' },
          { label: 'Apple', letter: '', color: '#000' },
        ].map(({ label, letter, color }) => (
          <Button
            key={label}
            variant="outlined"
            sx={{
              borderColor: 'rgba(0,0,0,0.15)',
              color: '#444',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              py: 1.2,
              '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.02)' },
            }}
            startIcon={
              <Box component="span" sx={{ fontWeight: 800, color, fontSize: '1rem', lineHeight: 1 }}>
                {letter || (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                  </svg>
                )}
              </Box>
            }
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

// ─────────────────────── SIGNUP FORM ───────────────────────
type SignupFields = RegisterPayload;
interface SignupErrors extends Partial<Record<keyof SignupFields, string>> {
  global?: string;
}

const SIGNUP_INIT: SignupFields = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  password: '',
  confirmPassword: '',
};

function validateSignup(f: SignupFields): SignupErrors {
  const e: SignupErrors = {};
  if (!f.firstName.trim()) e.firstName = 'Required.';
  if (!f.lastName.trim()) e.lastName = 'Required.';
  if (!f.email) e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email.';
  if (!f.phone) e.phone = 'Required.';
  else if (!/^\+?[1-9]\d{6,14}$/.test(f.phone.replace(/[\s\-()]/g, '')))
    e.phone = 'Format: +447911123456';
  if (!f.city.trim()) e.city = 'Required.';
  if (!f.address.trim()) e.address = 'Required.';
  if (!f.password) e.password = 'Required.';
  else if (f.password.length < 8) e.password = 'At least 8 characters.';
  if (!f.confirmPassword) e.confirmPassword = 'Please confirm.';
  else if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match.';
  return e;
}

function SignupForm({ onSwitch, onClose }: { onSwitch: () => void; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<SignupFields>(SIGNUP_INIT);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SignupErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validateSignup(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const { data } = await authApi.register(form);
      setAccessToken(data.data.accessToken);
      onClose();
      router.push('/');
      router.refresh();
    } catch (err) {
      setErrors({ global: extractApiError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ p: { xs: 3.5, md: 5 }, display: 'flex', flexDirection: 'column', gap: 2.2, flex: 1 }}
    >
      {/* Heading */}
      <Box sx={{ mb: 0.5 }}>
        <Typography
          sx={{
            color: ACCENT,
            fontWeight: 700,
            fontSize: '0.76rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            mb: 0.75,
          }}
        >
          Get started
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: NAVY, mb: 0.5 }}>
          Create your account
        </Typography>
        <Typography variant="body2" sx={{ color: '#999' }}>
          Already have an account?{' '}
          <Box
            component="span"
            onClick={onSwitch}
            sx={{
              color: ACCENT,
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign in
          </Box>
        </Typography>
      </Box>

      {errors.global && (
        <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.85rem' }}>
          {errors.global}
        </Alert>
      )}

      {/* First + Last */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField
          label="First name"
          name="firstName"
          autoComplete="given-name"
          placeholder="Jane"
          value={form.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
          fullWidth
          sx={fieldSx}
        />
        <TextField
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          placeholder="Doe"
          value={form.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
          fullWidth
          sx={fieldSx}
        />
      </Box>

      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        sx={fieldSx}
      />

      <TextField
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+447911123456"
        value={form.phone}
        onChange={handleChange}
        error={!!errors.phone}
        helperText={errors.phone}
        fullWidth
        sx={fieldSx}
      />

      {/* City + Address */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField
          label="City"
          name="city"
          autoComplete="address-level2"
          placeholder="London"
          value={form.city}
          onChange={handleChange}
          error={!!errors.city}
          helperText={errors.city}
          fullWidth
          sx={fieldSx}
        />
        <TextField
          label="Address"
          name="address"
          autoComplete="street-address"
          placeholder="10 Downing St"
          value={form.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
          fullWidth
          sx={fieldSx}
        />
      </Box>

      {/* Password + strength */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <TextField
          label="Password"
          name="password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          sx={fieldSx}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPw((p) => !p)}
                    edge="end"
                    size="small"
                    aria-label="Toggle password"
                  >
                    {showPw ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {form.password.length > 0 && <PasswordStrength password={form.password} />}
      </Box>

      {/* Confirm password */}
      <TextField
        label="Confirm password"
        name="confirmPassword"
        type={showCPw ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="Repeat password"
        value={form.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        fullWidth
        sx={fieldSx}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCPw((p) => !p)}
                  edge="end"
                  size="small"
                  aria-label="Toggle confirm password"
                >
                  {showCPw ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{
          py: 1.75,
          fontWeight: 700,
          fontSize: '0.95rem',
          textTransform: 'none',
          borderRadius: '8px',
          mt: 0.5,
          boxShadow: '0 4px 14px rgba(247,68,78,0.35)',
          transition: 'transform 0.18s, box-shadow 0.18s',
          '&:hover:not(:disabled)': {
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 22px rgba(247,68,78,0.45)',
          },
        }}
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>

      <Typography
        variant="caption"
        sx={{ color: '#bbb', textAlign: 'center', lineHeight: 1.7, mt: -0.5 }}
      >
        By creating an account you agree to our{' '}
        <Box
          component="span"
          sx={{ color: NAVY, fontWeight: 600, cursor: 'pointer', '&:hover': { color: ACCENT } }}
        >
          Terms
        </Box>{' '}
        and{' '}
        <Box
          component="span"
          sx={{ color: NAVY, fontWeight: 600, cursor: 'pointer', '&:hover': { color: ACCENT } }}
        >
          Privacy Policy
        </Box>
        .
      </Typography>
    </Box>
  );
}

// ─────────────────────── MAIN EXPORT ────────────────────────
export interface AuthModalsProps {
  mode: 'login' | 'signup' | null;
  onClose: () => void;
  onSwitch: (to: 'login' | 'signup') => void;
}

export default function AuthModals({ mode, onClose, onSwitch }: AuthModalsProps) {
  return (
    <Dialog
      open={mode !== null}
      onClose={onClose}
      slots={{ transition: SlideUp }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            m: { xs: 1.5, md: 3 },
            width: '100%',
            maxWidth: { xs: '100%', md: 800 },
            maxHeight: '95vh',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', maxHeight: '95vh' }}>
        {/* Left branding panel — hidden on mobile */}
        <LeftPanel />

        {/* Right form panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            position: 'relative',
            minWidth: 0,
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={onClose}
            aria-label="Close dialog"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.05)',
              width: 34,
              height: 34,
              '&:hover': { bgcolor: 'rgba(247,68,78,0.1)', color: ACCENT },
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {mode === 'login' ? (
            <LoginForm onClose={onClose} onSwitch={() => onSwitch('signup')} />
          ) : (
            <SignupForm onClose={onClose} onSwitch={() => onSwitch('login')} />
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
