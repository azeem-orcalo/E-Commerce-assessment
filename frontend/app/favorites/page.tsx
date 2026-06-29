'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import Navbar from '@/components/Navbar';
import { getStoredUser, setStoredUser, setAccessToken, authApi, type ApiProduct } from '@/lib/api';
import { useFavorites } from '@/lib/useFavorites';
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
const PLACEHOLDER_IMG = 'https://placehold.co/800x900/f5f6f8/9ca3af?text=No+Image';

export default function FavoritesPage() {
  const router = useRouter();
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const { favorites, toggle, syncFromApi } = useFavorites();
  const { refreshCart, resetCartState, openCart, addItem } = useCart();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.replace('/'); return; }
    if (user.role === 'ADMIN') { router.replace('/admin'); return; }
    setCurrentUser(user);
  }, [router]);

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredUser(null);
    resetCartState();
    setAccessToken(null);
    authApi.logout().catch(() => {});
    router.replace('/');
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    setStoredUser(user);
    await refreshCart();
    await syncFromApi();
  };

  const handleRemove = (product: ApiProduct) => {
    toggle(product);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: ApiProduct) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      setAuthModal('login');
      return;
    }
    const result = await addItem({ productId: product.id, quantity: 1 });
    if (result === 'success') openCart();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Navbar
        currentUser={currentUser}
        onSignIn={() => setAuthModal('login')}
        onSignUp={() => setAuthModal('signup')}
        onLogout={handleLogout}
      />

      {/* ─── HERO SECTION ─── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 420, md: 540 },
          pb: { xs: '80px', md: '100px' },
          display: 'flex',
          alignItems: 'center',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 88%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1800&h=700&fit=crop&q=85"
          alt="Wishlist"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', display: 'block' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(0,44,62,0.96) 0%, rgba(0,44,62,0.82) 42%, rgba(0,44,62,0.52) 72%, rgba(0,44,62,0.22) 100%)` }} />
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 7, md: 9 } }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3.5 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: ACCENT } }}>
                Home
              </Typography>
            </Link>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.83rem' }}>/</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem', fontWeight: 600 }}>Wishlist</Typography>
          </Box>

          {/* Overline */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.78rem' }}>
              Your Saved Items
            </Typography>
          </Box>

          {/* Title */}
          <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: { xs: '2.6rem', sm: '3.4rem', md: '5rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mb: 2.5 }}>
            My<br />
            <Box component="span" sx={{ color: ACCENT }}>Wishlist</Box>
          </Typography>

          {/* Subtitle */}
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.97rem', md: '1.08rem' }, maxWidth: 460, lineHeight: 1.85, mb: 5 }}>
            {favorites.length === 0
              ? 'Save your favourite pieces here — they\'ll be waiting whenever you\'re ready.'
              : `${favorites.length} saved item${favorites.length !== 1 ? 's' : ''} — ready to add to your cart.`}
          </Typography>

          {/* Badges */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              { icon: <FavoriteIcon sx={{ fontSize: 16 }} />, text: 'Saved across sessions' },
              { icon: <ShoppingCartIcon sx={{ fontSize: 16 }} />, text: 'One-click add to cart' },
              { icon: <ArrowForwardIcon sx={{ fontSize: 16 }} />, text: 'Quick checkout' },
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', px: 2.2, py: 0.9, backdropFilter: 'blur(8px)' }}>
                <Box sx={{ color: ACCENT, display: 'flex' }}>{icon}</Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.83rem', fontWeight: 600 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        {favorites.length === 0 ? (
          /* ── Empty state ── */
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 8, md: 12 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: '#f9fafb',
                border: '2px dashed #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <FavoriteBorderIcon sx={{ fontSize: 40, color: '#d1d5db' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#374151' }}>
              Your wishlist is empty
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#9ca3af', maxWidth: 360 }}>
              Browse our products and click the heart icon to save items you love.
            </Typography>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: 1,
                  bgcolor: ACCENT,
                  '&:hover': { bgcolor: '#d93540' },
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '10px',
                }}
              >
                Browse Products
              </Button>
            </Link>
          </Box>
        ) : (
          <>
            {/* Action bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 4,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '1rem' }}>
                {favorites.length} item{favorites.length !== 1 ? 's' : ''} saved
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderColor: NAVY,
                      color: NAVY,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': { bgcolor: NAVY, color: '#fff' },
                    }}
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </Box>
            </Box>

            {/* Products grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 1fr',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: { xs: 2, md: 3 },
              }}
            >
              {favorites.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    elevation={0}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    sx={{
                      border: '1.5px solid rgba(0,0,0,0.07)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 16px 40px rgba(0,44,62,0.12)',
                        borderColor: `${ACCENT}44`,
                      },
                    }}
                  >
                    {/* Image */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 200, sm: 240 } }}>
                      <CardMedia
                        component="img"
                        image={product.imageUrl ?? PLACEHOLDER_IMG}
                        alt={product.name}
                        sx={{
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s',
                          ...(hoveredProduct === product.id && { transform: 'scale(1.07)' }),
                        }}
                      />

                      {/* Category badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: NAVY,
                          color: '#fff',
                          px: 1.2,
                          py: 0.3,
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {product.category.name}
                      </Box>

                      {/* Remove from wishlist */}
                      <IconButton
                        size="small"
                        aria-label="Remove from wishlist"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(product);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: ACCENT,
                          color: '#fff',
                          width: 32,
                          height: 32,
                          opacity: hoveredProduct === product.id ? 1 : 0.85,
                          transition: 'opacity 0.2s, transform 0.2s',
                          '&:hover': { bgcolor: '#d93540', transform: 'scale(1.1)' },
                        }}
                      >
                        <FavoriteIcon sx={{ fontSize: 15 }} />
                      </IconButton>

                      {/* Out of stock overlay */}
                      {product.stock === 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(0,0,0,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Chip
                            label="Out of Stock"
                            sx={{
                              bgcolor: '#111',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Info */}
                    <CardContent sx={{ pb: 0.5, pt: 1.8, px: 2, flexGrow: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#9ca3af',
                          fontWeight: 600,
                          fontSize: '0.67rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {product.category.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#1a1a2e',
                          fontSize: '0.88rem',
                          mt: 0.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4,
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '1rem' }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: product.stock > 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* Add to cart */}
                    <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        disabled={product.stock === 0}
                        onClick={(e) => handleAddToCart(e, product)}
                        startIcon={<ShoppingCartIcon sx={{ fontSize: '0.95rem' }} />}
                        sx={{
                          bgcolor: ACCENT,
                          '&:hover': { bgcolor: '#d93540' },
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '0.82rem',
                          borderRadius: '8px',
                          py: 1,
                          opacity: hoveredProduct === product.id ? 1 : 0,
                          transform: hoveredProduct === product.id ? 'translateY(0)' : 'translateY(6px)',
                          transition: 'opacity 0.2s, transform 0.2s',
                        }}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </Card>
                </Link>
              ))}
            </Box>
          </>
        )}
      </Container>

      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitch={(to) => setAuthModal(to)}
        onSuccess={handleAuthSuccess}
      />
    </ThemeProvider>
  );
}
