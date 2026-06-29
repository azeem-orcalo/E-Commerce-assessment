'use client';

import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import { setAccessToken, setStoredUser, getStoredUser, authApi } from '@/lib/api';
import Navbar from '@/components/Navbar';

const theme = createTheme({
  palette: {
    primary: { main: '#f7444e', contrastText: '#fff' },
    secondary: { main: '#002c3e', contrastText: '#fff' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif',
  },
});

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

const values = [
  {
    icon: <StorefrontIcon sx={{ fontSize: 40, color: ACCENT }} />,
    title: 'Curated Selection',
    description:
      'We handpick every product to ensure quality, value, and relevance — no filler, just the good stuff.',
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 40, color: ACCENT }} />,
    title: 'Fast Delivery',
    description:
      'Orders processed same day and shipped within 24 hours so your purchases arrive when you need them.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: ACCENT }} />,
    title: 'Secure Shopping',
    description:
      'Your data is encrypted end-to-end and we never store payment details on our servers.',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 40, color: ACCENT }} />,
    title: '24 / 7 Support',
    description:
      'Real humans available around the clock to answer questions and resolve issues quickly.',
  },
];

const team = [
  { name: 'Azeem Aslam', role: 'Founder & CEO', initials: 'AA' },
  { name: 'Sara Khan', role: 'Head of Operations', initials: 'SK' },
  { name: 'James Lee', role: 'Lead Engineer', initials: 'JL' },
  { name: 'Priya Mehta', role: 'Customer Experience', initials: 'PM' },
];

export default function AboutPage() {
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const handleAuthSuccess = (user: AuthUser, accessToken: string) => {
    setAccessToken(accessToken);
    setStoredUser(user);
    setCurrentUser(user);
    setAuthModal(null);
  };

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    setAccessToken(null);
    setStoredUser(null);
    setCurrentUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ─── NAVBAR ─── */}
      <Navbar
        currentUser={currentUser}
        onSignIn={() => setAuthModal('login')}
        onSignUp={() => setAuthModal('signup')}
        onLogout={handleLogout}
      />

      {/* ─── HERO ─── */}
      <Box sx={{ bgcolor: NAVY, color: '#fff', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            About{' '}
            <Box component="span" sx={{ color: ACCENT }}>
              BinAzeem
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, lineHeight: 1.7 }}
          >
            We&apos;re a passionate team building a smarter, simpler way to shop online —
            combining great products with a seamless experience from browse to delivery.
          </Typography>
        </Container>
      </Box>

      {/* ─── MAIN CONTENT ─── */}
      <Box sx={{ bgcolor: '#f8f9fa' }}>
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
          {/* Story */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: NAVY, mb: 3, textAlign: 'center' }}>
            Our Story
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#444', lineHeight: 1.9, fontSize: '1.05rem', textAlign: 'center' }}
          >
            BinAzeem started as a small side project born out of frustration with cluttered,
            slow, and hard-to-navigate online stores. We believed shopping should feel effortless —
            so we built the store we always wanted to use. Today we serve thousands of happy
            customers across the UK, shipping everything from electronics and books to home
            essentials and clothing. Every decision we make — from the products we stock to the
            technology we build — is guided by one question:{' '}
            <em>does this make life better for our customers?</em>
          </Typography>

          <Divider sx={{ my: 6 }} />

          {/* Values */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: NAVY, mb: 4, textAlign: 'center' }}>
            What We Stand For
          </Typography>
          <Grid container spacing={3}>
            {values.map((v) => (
              <Grid item xs={12} sm={6} key={v.title}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid #e8edf2',
                    borderRadius: 3,
                    p: 1,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 8px 30px rgba(0,44,62,0.1)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 1.5 }}>{v.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: NAVY, mb: 1 }}>
                      {v.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                      {v.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 6 }} />

          {/* Team */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: NAVY, mb: 4, textAlign: 'center' }}>
            Meet the Team
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {team.map((member) => (
              <Grid item xs={6} sm={3} key={member.name}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      bgcolor: ACCENT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
                      {member.initials}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: NAVY }}>
                    {member.name}
                  </Typography>
                  <Chip
                    label={member.role}
                    size="small"
                    sx={{ mt: 0.5, bgcolor: '#eef2f7', color: '#444', fontSize: '0.72rem' }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 6 }} />

          {/* Stats */}
          <Grid container spacing={4} justifyContent="center" textAlign="center">
            {[
              { value: '12,000+', label: 'Happy Customers' },
              { value: '500+', label: 'Products' },
              { value: '99.2%', label: 'On-time Delivery' },
              { value: '4.8 ★', label: 'Average Rating' },
            ].map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: ACCENT, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── PROMO STRIP ─── */}
      <Box sx={{ bgcolor: ACCENT, py: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 4, md: 10 }, flexWrap: 'wrap' }}>
            {['Free Shipping on Orders $50+', '30-Day Easy Returns', 'Secure Checkout', 'Authentic Products'].map((text) => (
              <Typography key={text} sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                ✓ {text}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── FOOTER ─── */}
      <Box sx={{ bgcolor: NAVY, color: '#fff', pt: 8, pb: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 2fr' }, gap: 5 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.06em', mb: 2 }}>
                Bin<Box component="span" sx={{ color: ACCENT }}>Azeem</Box>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 290, lineHeight: 1.9 }}>
                Premium clothing for the modern wardrobe. Quality craftsmanship, timeless design — built around you.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Shop</Typography>
              {['New Arrivals', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'].map((l) => (
                <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mb: 1.2, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: ACCENT } }}>{l}</Typography>
              ))}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Help</Typography>
              {['FAQ', 'Shipping Info', 'Returns', 'Contact Us', 'Size Guide'].map((l) => (
                <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mb: 1.2, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: ACCENT } }}>{l}</Typography>
              ))}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Newsletter</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2.5, lineHeight: 1.7 }}>
                Subscribe for special offers, style guides, and new arrivals straight to your inbox.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  component="input"
                  placeholder="Your email address"
                  sx={{
                    flex: 1, px: 2, py: 1.4,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: '0.875rem', outline: 'none', borderRadius: '6px',
                    '&::placeholder': { color: 'rgba(255,255,255,0.35)' },
                    '&:focus': { borderColor: ACCENT },
                  }}
                />
                <Button variant="contained" color="primary" sx={{ fontWeight: 700, textTransform: 'none', px: 2.5, borderRadius: '6px', whiteSpace: 'nowrap' }}>
                  Subscribe
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mt: 6, mb: 3.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
              © 2026 BinAzeem Fashion. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookies'].map((l) => (
                <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', cursor: 'pointer', '&:hover': { color: ACCENT }, transition: 'color 0.2s' }}>{l}</Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── AUTH MODALS ─── */}
      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitch={(to) => setAuthModal(to)}
        onSuccess={handleAuthSuccess}
      />
    </ThemeProvider>
  );
}
