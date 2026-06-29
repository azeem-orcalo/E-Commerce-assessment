'use client';

import { useEffect, useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import Navbar from '@/components/Navbar';
import { api, setAccessToken, setStoredUser, getStoredUser } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

const theme = createTheme({
  palette: {
    primary: { main: ACCENT, contrastText: '#fff' },
    secondary: { main: NAVY, contrastText: '#fff' },
  },
  typography: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' },
});

interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercent: string | number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string | null;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysLeft(endDate: string) {
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff <= 0) return 'Expired';
  if (diff === 1) return '1 day left';
  return `${diff} days left`;
}

function OfferCard({ offer }: { offer: Offer }) {
  const pct = Number(offer.discountPercent);
  const remaining = daysLeft(offer.endDate);
  const urgent = remaining !== 'Expired' && parseInt(remaining) <= 3;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1.5px solid rgba(0,0,0,0.07)',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 48px rgba(247,68,78,0.15)',
        },
      }}
    >
      {/* Top banner */}
      <Box
        sx={{
          background: offer.imageUrl
            ? `linear-gradient(rgba(0,44,62,0.65), rgba(0,44,62,0.65)), url(${offer.imageUrl}) center/cover`
            : `linear-gradient(135deg, ${NAVY} 0%, #004a6e 100%)`,
          minHeight: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          px: 3,
          py: 3,
        }}
      >
        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            bgcolor: ACCENT,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(247,68,78,0.5)',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.8rem', lineHeight: 1 }}>
            {pct}%
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em' }}>
            OFF
          </Typography>
        </Box>

        {urgent && remaining !== 'Expired' && (
          <Chip
            label="Ending soon!"
            size="small"
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              bgcolor: '#f59e0b',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.68rem',
            }}
          />
        )}
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: NAVY, mb: 0.8, lineHeight: 1.3 }}>
          {offer.title}
        </Typography>
        <Typography sx={{ fontSize: '0.88rem', color: '#6b7280', mb: 2, lineHeight: 1.6 }}>
          {offer.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CalendarTodayIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
          <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>
            {fmt(offer.startDate)} — {fmt(offer.endDate)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Chip
            icon={<LocalOfferIcon sx={{ fontSize: '14px !important' }} />}
            label={`Save ${pct}% on every product`}
            size="small"
            sx={{
              bgcolor: `${ACCENT}12`,
              color: ACCENT,
              fontWeight: 700,
              fontSize: '0.72rem',
              '& .MuiChip-icon': { color: ACCENT },
            }}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: urgent ? '#f59e0b' : '#10b981',
            }}
          >
            {remaining}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Offer[]>('/offers');
        const raw = res.data;
        setOffers(Array.isArray(raw) ? raw : []);
      } catch {
        setError('Failed to load offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* noop */ }
    setAccessToken(null);
    setStoredUser(null);
    setCurrentUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh' }}>
        <Navbar
          currentUser={currentUser}
          onSignIn={() => setAuthModal('login')}
          onSignUp={() => setAuthModal('signup')}
          onLogout={handleLogout}
        />

        {/* Hero */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${NAVY} 0%, #004a6e 100%)`,
            py: { xs: 6, md: 8 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, color: '#fff', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.6rem' } }}
          >
            Upcoming{' '}
            <Box component="span" sx={{ color: ACCENT }}>
              Offers &amp; Deals
            </Box>
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 500, mx: 'auto' }}>
            Don't miss out — exclusive discounts for a limited time only
          </Typography>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: '20px' }} />
              ))}
            </Box>
          ) : offers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <LocalOfferIcon sx={{ fontSize: 64, color: '#e5e7eb', mb: 2 }} />
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#9ca3af' }}>
                No active offers right now
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#d1d5db', mt: 0.5 }}>
                Check back soon for upcoming deals!
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </Box>
          )}
        </Container>

        <AuthModals
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(to) => setAuthModal(to)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setAuthModal(null);
          }}
        />
      </Box>
    </ThemeProvider>
  );
}
