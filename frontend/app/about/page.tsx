'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import { setAccessToken, setStoredUser, getStoredUser, authApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/CartContext';

const theme = createTheme({
  palette: {
    primary: { main: '#f7444e', contrastText: '#fff' },
    secondary: { main: '#002c3e', contrastText: '#fff' },
  },
  typography: { fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' },
});

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

const values = [
  {
    icon: <StorefrontIcon sx={{ fontSize: 32 }} />,
    title: 'Curated Selection',
    description: 'We handpick every product to ensure quality, value, and relevance — no filler, just the good stuff.',
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 32 }} />,
    title: 'Fast Delivery',
    description: 'Orders processed same day and shipped within 24 hours so your purchases arrive when you need them.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    title: 'Secure Shopping',
    description: 'Your data is encrypted end-to-end and we never store payment details on our servers.',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 32 }} />,
    title: '24 / 7 Support',
    description: 'Real humans available around the clock to answer questions and resolve issues quickly.',
  },
];

const stats = [
  { value: '12,000+', label: 'Happy Customers', icon: <GroupsIcon sx={{ fontSize: 28, color: ACCENT }} /> },
  { value: '500+',    label: 'Products',         icon: <StorefrontIcon sx={{ fontSize: 28, color: ACCENT }} /> },
  { value: '99.2%',  label: 'On-time Delivery',  icon: <AutoGraphIcon sx={{ fontSize: 28, color: ACCENT }} /> },
  { value: '4.8 ★',  label: 'Average Rating',    icon: <EmojiEventsIcon sx={{ fontSize: 28, color: ACCENT }} /> },
];

const team = [
  { name: 'Azeem Aslam', role: 'Founder & CEO',          initials: 'AA', color: '#f7444e' },
  { name: 'Sara Khan',   role: 'Head of Operations',      initials: 'SK', color: '#7c3aed' },
  { name: 'James Lee',   role: 'Lead Engineer',           initials: 'JL', color: '#0284c7' },
  { name: 'Priya Mehta', role: 'Customer Experience',     initials: 'PM', color: '#059669' },
];

export default function AboutPage() {
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { refreshCart, resetCartState } = useCart();

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    setStoredUser(user);
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

      {/* ─── NAVBAR ─── */}
      <Navbar
        currentUser={currentUser}
        onSignIn={() => setAuthModal('login')}
        onSignUp={() => setAuthModal('signup')}
        onLogout={handleLogout}
      />

      {/* ─── HERO ─── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 340, md: 480 },
          pb: { xs: '60px', md: '90px' },
          display: 'flex',
          alignItems: 'center',
          clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1800&h=700&fit=crop&q=85"
          alt="About BinAzeem"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 35%',
            display: 'block',
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(0,44,62,0.97) 0%, rgba(0,44,62,0.88) 45%, rgba(0,44,62,0.62) 75%, rgba(0,44,62,0.26) 100%)' }} />
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 7, md: 10 } }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3.5 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: ACCENT } }}>
                Home
              </Typography>
            </Link>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.83rem' }}>/</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem', fontWeight: 600 }}>About Us</Typography>
          </Box>

          {/* Eyebrow */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.78rem' }}>
              Our Story
            </Typography>
          </Box>

          {/* Headline */}
          <Typography
            sx={{
              fontWeight: 900,
              color: '#fff',
              fontSize: { xs: '2.8rem', sm: '3.8rem', md: '5.4rem' },
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              mb: 2.5,
            }}
          >
            Built for<br />
            <Box component="span" sx={{ color: ACCENT }}>People</Box>{' '}
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.55)' }}>Who</Box><br />
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.55)' }}>Shop Smart</Box>
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.65)', maxWidth: 520, lineHeight: 1.85, fontSize: '1.05rem' }}>
            We&apos;re a passionate team combining great products with a seamless experience —
            from browse to doorstep.
          </Typography>
        </Container>
      </Box>

      {/* ─── STATS BAR ─── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #f0f2f5' }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-around',
              py: { xs: 4, md: 5 },
              gap: 3,
            }}
          >
            {stats.map((s) => (
              <Box key={s.label} sx={{ textAlign: 'center', flex: '1 1 140px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>{s.icon}</Box>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', md: '2rem' }, color: NAVY, lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5, fontWeight: 500 }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── OUR STORY ─── */}
      <Box sx={{ bgcolor: '#f8f9fb', py: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 5, md: 10 },
              alignItems: 'center',
            }}
          >
            {/* Left — image block */}
            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '42%' } }}>
              <Box sx={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,44,62,0.15)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=85"
                  alt="Our team"
                  style={{ display: 'block', width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                />
                {/* floating badge */}
                <Box
                  sx={{
                    position: 'absolute', bottom: 24, left: 24,
                    bgcolor: '#fff', borderRadius: '14px',
                    px: 2.5, py: 1.5,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}
                >
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: NAVY }}>
                    Serving 12,000+ customers
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right — text */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
                <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.75rem' }}>
                  How We Started
                </Typography>
              </Box>

              <Typography sx={{ fontWeight: 900, color: NAVY, fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.15, mb: 3, letterSpacing: '-0.02em' }}>
                The store we always wanted to use
              </Typography>

              <Typography sx={{ color: '#4b5563', lineHeight: 1.95, fontSize: '1rem', mb: 2.5 }}>
                BinAzeem started as a small side project born out of frustration with cluttered,
                slow, and hard-to-navigate online stores. We believed shopping should feel
                effortless — so we built the store we always wanted to use.
              </Typography>

              <Typography sx={{ color: '#4b5563', lineHeight: 1.95, fontSize: '1rem', mb: 3.5 }}>
                Today we serve thousands of happy customers across the UK, shipping everything
                from electronics and books to home essentials and clothing. Every decision we
                make is guided by one question:{' '}
                <Box component="em" sx={{ color: ACCENT, fontStyle: 'italic', fontWeight: 600 }}>
                  does this make life better for our customers?
                </Box>
              </Typography>

              <Link href="/products" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: ACCENT,
                    '&:hover': { bgcolor: '#d93540' },
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    boxShadow: '0 6px 20px rgba(247,68,78,0.35)',
                  }}
                >
                  Shop Our Collection
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── VALUES ─── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          {/* Section header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
              <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.75rem' }}>
                Our Principles
              </Typography>
              <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, color: NAVY, fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-0.02em' }}>
              What We Stand For
            </Typography>
          </Box>

          {/* 2×2 grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            {values.map((v) => (
              <Box
                key={v.title}
                sx={{
                  border: '1.5px solid #f0f2f5',
                  borderRadius: '16px',
                  p: { xs: 3, md: 4 },
                  transition: 'box-shadow 0.25s, border-color 0.25s, transform 0.25s',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(0,44,62,0.1)',
                    borderColor: 'rgba(247,68,78,0.25)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56, height: 56, borderRadius: '14px',
                    bgcolor: 'rgba(247,68,78,0.09)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 2.5, color: ACCENT,
                  }}
                >
                  {v.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: '1.1rem', mb: 1 }}>
                  {v.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.8 }}>
                  {v.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── TEAM ─── */}
      <Box sx={{ bgcolor: '#f8f9fb', py: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
              <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.75rem' }}>
                The People
              </Typography>
              <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, color: NAVY, fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-0.02em' }}>
              Meet the Team
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            {team.map((member) => (
              <Box
                key={member.name}
                sx={{
                  flex: '1 1 200px',
                  maxWidth: 240,
                  bgcolor: '#fff',
                  border: '1.5px solid #f0f2f5',
                  borderRadius: '20px',
                  p: 3.5,
                  textAlign: 'center',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                  '&:hover': {
                    boxShadow: '0 12px 36px rgba(0,44,62,0.1)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {/* Avatar */}
                <Box
                  sx={{
                    width: 76, height: 76, borderRadius: '50%',
                    bgcolor: member.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                    boxShadow: `0 8px 24px ${member.color}55`,
                  }}
                >
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem' }}>
                    {member.initials}
                  </Typography>
                </Box>

                <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: '1rem', mb: 0.5 }}>
                  {member.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                  {member.role}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── CTA BANNER ─── */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 11 },
          overflow: 'hidden',
          bgcolor: NAVY,
          textAlign: 'center',
        }}
      >
        {/* decorative circles */}
        <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(247,68,78,0.08)', top: -180, right: -120, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(247,68,78,0.06)', bottom: -140, left: -80, pointerEvents: 'none' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-0.02em', mb: 2 }}>
            Ready to start shopping?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', mb: 5, lineHeight: 1.8 }}>
            Explore thousands of curated products with fast delivery and secure checkout.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: ACCENT, '&:hover': { bgcolor: '#d93540' },
                  fontWeight: 700, textTransform: 'none',
                  px: 5, py: 1.7, borderRadius: 2, fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(247,68,78,0.4)',
                }}
              >
                Browse Products
              </Button>
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)', color: '#fff',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
                  fontWeight: 700, textTransform: 'none',
                  px: 5, py: 1.7, borderRadius: 2, fontSize: '1rem',
                }}
              >
                Back to Home
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* ─── PROMO STRIP ─── */}
      <Box sx={{ bgcolor: ACCENT, py: 2.5 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 3, md: 8 }, flexWrap: 'wrap' }}>
            {['Free Shipping on Orders £50+', '30-Day Easy Returns', 'Secure Checkout', 'Authentic Products'].map((text) => (
              <Typography key={text} sx={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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
