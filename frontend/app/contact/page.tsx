'use client';

import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import Navbar from '@/components/Navbar';
import { getStoredUser, setAccessToken, setStoredUser, authApi, contactApi, extractApiError } from '@/lib/api';
import { useCart } from '@/lib/CartContext';

const theme = createTheme({
  palette: {
    primary: { main: '#f7444e', contrastText: '#fff' },
    secondary: { main: '#002c3e', contrastText: '#fff' },
  },
  typography: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' },
});

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

export default function ContactPage() {
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { refreshCart, resetCartState } = useCart();

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await contactApi.submit(form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    setStoredUser(user);
    setForm((prev) => ({
      ...prev,
      name: prev.name || `${user.firstName} ${user.lastName}`,
      email: prev.email || user.email,
    }));
    await refreshCart();
    setAuthModal(null);
  };

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    setAccessToken(null);
    setStoredUser(null);
    resetCartState();
    setCurrentUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
        <Navbar
          currentUser={currentUser}
          onSignIn={() => setAuthModal('login')}
          onSignUp={() => setAuthModal('signup')}
          onLogout={handleLogout}
        />

        {/* Hero */}
        <Box sx={{ bgcolor: NAVY, color: '#fff', py: { xs: 5, md: 8 }, textAlign: 'center', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 88%)', pb: { xs: '80px', md: '100px' } }}>
          <Container maxWidth="md">
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
              Contact <Box component="span" sx={{ color: ACCENT }}>Us</Box>
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: 540, mx: 'auto' }}>
              Have a question, complaint, or feedback? Fill in the form below and our support team will get back to you.
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>

            {/* Info sidebar */}
            <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #e5e7eb', mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: NAVY, mb: 2.5 }}>
                  Get in Touch
                </Typography>
                {[
                  { icon: <EmailIcon sx={{ fontSize: 20, color: ACCENT }} />, label: 'Email', value: 'support@omnishop.com' },
                  { icon: <PhoneIcon sx={{ fontSize: 20, color: ACCENT }} />, label: 'Phone', value: '+92 300 0000000' },
                  { icon: <LocationOnIcon sx={{ fontSize: 20, color: ACCENT }} />, label: 'Address', value: 'Lahore, Punjab, Pakistan' },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Box sx={{ mt: 0.2 }}>{icon}</Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: NAVY, fontWeight: 500 }}>{value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>

              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', bgcolor: NAVY }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', mb: 1 }}>
                  Response Time
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  We aim to respond to all queries within <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>24 hours</Box> on business days.
                </Typography>
              </Paper>
            </Box>

            {/* Form */}
            <Box sx={{ flex: 1 }}>
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: NAVY, mb: 3 }}>
                  Send a Message
                </Typography>

                {success ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: NAVY, mb: 1 }}>
                      Message Sent!
                    </Typography>
                    <Typography sx={{ color: '#6b7280', mb: 3 }}>
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setSuccess(false)}
                      sx={{ borderColor: NAVY, color: NAVY, fontWeight: 600, borderRadius: 2 }}
                    >
                      Send Another Message
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
                      <TextField
                        label="Your Name"
                        value={form.name}
                        onChange={handleChange('name')}
                        required
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        required
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Box>

                    <TextField
                      label="Subject"
                      value={form.subject}
                      onChange={handleChange('subject')}
                      required
                      fullWidth
                      size="small"
                      sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <TextField
                      label="Message"
                      value={form.message}
                      onChange={handleChange('message')}
                      required
                      fullWidth
                      multiline
                      rows={5}
                      sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      helperText={`${form.message.length}/2000`}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      fullWidth
                      sx={{
                        bgcolor: ACCENT,
                        '&:hover': { bgcolor: '#d93a43' },
                        borderRadius: 2,
                        py: 1.3,
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {submitting ? <CircularProgress size={22} color="inherit" /> : 'Send Message'}
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitch={(to) => setAuthModal(to)}
        onSuccess={handleAuthSuccess}
      />
    </ThemeProvider>
  );
}
