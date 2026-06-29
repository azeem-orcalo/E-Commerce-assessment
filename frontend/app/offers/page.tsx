'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Button,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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

function getOfferStatus(startDate: string, endDate: string) {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const daysLeftCount = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (now < start) return { label: 'UPCOMING', color: '#3b82f6', bg: '#3b82f6' };
  if (daysLeftCount <= 3) return { label: 'ENDING SOON', color: '#f59e0b', bg: '#f59e0b' };
  return { label: 'LIVE NOW', color: '#16a34a', bg: '#16a34a' };
}

function startsIn(startDate: string) {
  const diff = Math.ceil(
    (new Date(startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff <= 0) return null;
  if (diff === 1) return 'Starts tomorrow';
  return `Starts in ${diff} days`;
}

function OfferCard({ offer, onShopNow }: { offer: Offer; onShopNow: () => void }) {
  const pct = Number(offer.discountPercent);
  const now = Date.now();
  const isUpcoming = new Date(offer.startDate).getTime() > now;
  const remaining = isUpcoming ? (startsIn(offer.startDate) ?? '') : daysLeft(offer.endDate);
  const urgent = !isUpcoming && remaining !== 'Expired' && parseInt(remaining) <= 3;
  const status = getOfferStatus(offer.startDate, offer.endDate);

  // Example savings on a £100 item
  const exampleOriginal = 100;
  const exampleSaved = parseFloat((exampleOriginal * pct / 100).toFixed(2));
  const exampleFinal = parseFloat((exampleOriginal - exampleSaved).toFixed(2));

  return (
    <Card
      elevation={0}
      sx={{
        border: `2px solid ${isUpcoming ? '#3b82f633' : `${ACCENT}33`}`,
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isUpcoming
            ? '0 16px 48px rgba(59,130,246,0.15)'
            : '0 16px 48px rgba(247,68,78,0.15)',
        },
      }}
    >
      {/* Top banner */}
      <Box
        sx={{
          background: offer.imageUrl
            ? `linear-gradient(rgba(0,44,62,0.65), rgba(0,44,62,0.65)), url(${offer.imageUrl}) center/cover`
            : `linear-gradient(135deg, ${NAVY} 0%, #004a6e 100%)`,
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          px: 3,
          py: 3,
        }}
      >
        {/* Status badge */}
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
          label={status.label}
          size="small"
          sx={{
            position: 'absolute',
            top: 14,
            left: 14,
            bgcolor: status.bg,
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.65rem',
            letterSpacing: '0.05em',
            '& .MuiChip-icon': { color: '#fff' },
          }}
        />

        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: ACCENT,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(247,68,78,0.5)',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>
            {pct}%
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em' }}>
            OFF
          </Typography>
        </Box>

        {urgent && (
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

        {/* Example savings calculation */}
        <Box
          sx={{
            bgcolor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Example saving
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'line-through' }}>
              £{exampleOriginal.toFixed(2)}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>→</Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#15803d' }}>
              £{exampleFinal.toFixed(2)}
            </Typography>
            <Chip
              label={`Save £${exampleSaved.toFixed(2)}`}
              size="small"
              sx={{ bgcolor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.65rem', ml: 'auto' }}
            />
          </Box>
        </Box>

        {/* Auto-apply / upcoming notice */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 15, color: isUpcoming ? '#3b82f6' : '#16a34a' }} />
          <Typography sx={{ fontSize: '0.78rem', color: isUpcoming ? '#3b82f6' : '#16a34a', fontWeight: 600 }}>
            {isUpcoming
              ? 'Will be applied automatically at checkout when live'
              : 'Applied automatically at checkout — no code needed'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarTodayIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
          <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>
            {fmt(offer.startDate)} — {fmt(offer.endDate)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            icon={<LocalOfferIcon sx={{ fontSize: '14px !important' }} />}
            label={`Save ${pct}% on every product`}
            size="small"
            sx={{
              bgcolor: isUpcoming ? 'rgba(59,130,246,0.1)' : `${ACCENT}12`,
              color: isUpcoming ? '#3b82f6' : ACCENT,
              fontWeight: 700,
              fontSize: '0.72rem',
              '& .MuiChip-icon': { color: isUpcoming ? '#3b82f6' : ACCENT },
            }}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isUpcoming ? '#3b82f6' : urgent ? '#f59e0b' : '#10b981',
            }}
          >
            {remaining}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingBagIcon />}
          onClick={onShopNow}
          sx={{
            bgcolor: isUpcoming ? '#3b82f6' : ACCENT,
            '&:hover': { bgcolor: isUpcoming ? '#2563eb' : '#d93540' },
            fontWeight: 700,
            borderRadius: 2,
            py: 1.2,
            textTransform: 'none',
            fontSize: '0.9rem',
          }}
        >
          {isUpcoming ? `Browse Products — ${pct}% Off Coming Soon` : `Shop Now & Save ${pct}%`}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function OffersPage() {
  const router = useRouter();
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

  // Highlight the best currently-active offer for the top banner (not upcoming)
  const now = Date.now();
  const liveOffers = offers.filter(
    (o) => new Date(o.startDate).getTime() <= now && new Date(o.endDate).getTime() >= now,
  );
  const topOffer = liveOffers.length > 0
    ? liveOffers.reduce((best, o) => Number(o.discountPercent) > Number(best.discountPercent) ? o : best, liveOffers[0])
    : null;

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
            Active &amp; Upcoming{' '}
            <Box component="span" sx={{ color: ACCENT }}>
              Sales &amp; Deals
            </Box>
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 500, mx: 'auto' }}>
            Active discounts apply automatically at checkout — upcoming deals start on their listed date
          </Typography>
        </Box>

        {/* Active sale highlight banner */}
        {!loading && topOffer && (
          <Box sx={{ bgcolor: '#16a34a' }}>
            <Container maxWidth="lg">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: 1, sm: 2 },
                  flexWrap: 'wrap',
                  py: 1.5,
                }}
              >
                <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  🔥 Sale is LIVE — {Number(topOffer.discountPercent)}% off every product!
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                  Discount is applied automatically when you checkout.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push('/products')}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.6)',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 6,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#fff' },
                  }}
                >
                  Shop Now
                </Button>
              </Box>
            </Container>
          </Box>
        )}

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
                <Skeleton key={i} variant="rectangular" height={420} sx={{ borderRadius: '20px' }} />
              ))}
            </Box>
          ) : offers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <LocalOfferIcon sx={{ fontSize: 64, color: '#e5e7eb', mb: 2 }} />
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#9ca3af' }}>
                No active or upcoming offers right now
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#d1d5db', mt: 0.5 }}>
                Check back soon — new deals are on the way!
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
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onShopNow={() => router.push('/products')}
                />
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
