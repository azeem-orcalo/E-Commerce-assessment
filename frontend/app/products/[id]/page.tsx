'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReplayIcon from '@mui/icons-material/Replay';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import { authApi, productsApi, reviewsApi, setAccessToken, getStoredUser, setStoredUser, type ApiProduct, type Review } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useFavorites } from '@/lib/useFavorites';
import { useCart } from '@/lib/CartContext';

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
const PLACEHOLDER_IMG = 'https://placehold.co/800x1000/f5f6f8/9ca3af?text=No+Image';

const STATIC_COLORS = ['#1a1a2e', '#ffffff', '#f7444e', '#d1d5db'];
const STATIC_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { toggle: toggleFavorite, isFavorite, syncFromApi, clear: clearFavorites } = useFavorites();
  const wishlisted = !!product && isFavorite(product.id);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const handleFavoriteClick = () => {
    if (!product) return;
    if (!currentUser) {
      setAuthModal('login');
      return;
    }
    toggleFavorite(product);
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    setStoredUser(user);
    await syncFromApi();
    await refreshCart();
    if (product) toggleFavorite(product);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredUser(null);
    clearFavorites();
    resetCartState();
    setAccessToken(null);
    authApi.logout().catch(() => {});
  };
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { openCart, addItem, refreshCart, resetCartState } = useCart();

  // Rehydrate auth from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);

    productsApi.getOne(id)
      .then((res) => {
        const p = res.data as ApiProduct;
        setProduct(p);
        setReviewsLoading(true);
        reviewsApi.findByProduct(id)
          .then((r) => setReviews(r.data))
          .catch(() => {})
          .finally(() => setReviewsLoading(false));
        // Fetch related products in same category
        return productsApi.list({ categoryId: p.categoryId, limit: 5 });
      })
      .then((res) => {
        // Exclude the current product
        const related = res.data.data.filter((p) => p.id !== id).slice(0, 4);
        setRelatedProducts(related);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!currentUser) {
      setAuthModal('login');
      return;
    }
    const result = await addItem({
      productId: product.id,
      quantity,
      chosenColor: selectedColor ?? undefined,
      chosenSize: selectedSize ?? undefined,
    });
    if (result === 'success') {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2200);
      openCart();
    }
  };

  const imageUrl = product?.imageUrl ?? PLACEHOLDER_IMG;
  const price = product ? parseFloat(product.price) : 0;
  const originalPrice = (price * 1.3).toFixed(2);
  const discount = Math.round((1 - price / (price * 1.3)) * 100);
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;


  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar currentUser={currentUser} onSignIn={() => setAuthModal('login')} onSignUp={() => setAuthModal('signup')} onLogout={handleLogout} />
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: ACCENT }} size={52} />
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !product) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar currentUser={currentUser} onSignIn={() => setAuthModal('login')} onSignUp={() => setAuthModal('signup')} onLogout={handleLogout} />
        <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, bgcolor: '#fafbfc' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: NAVY }}>Product not found</Typography>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" sx={{ fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, borderRadius: '10px' }}>
              Back to Products
            </Button>
          </Link>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Navbar currentUser={currentUser} onSignIn={() => setAuthModal('login')} onSignUp={() => setAuthModal('signup')} onLogout={handleLogout} />

      {/* ─── HERO BANNER ─── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 240, md: 360 },
          pb: { xs: '50px', md: '70px' },
          display: 'flex',
          alignItems: 'center',
          clipPath: 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', display: 'block' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(0,44,62,0.94) 0%, rgba(0,44,62,0.82) 40%, rgba(0,44,62,0.55) 68%, rgba(0,44,62,0.22) 100%)' }} />
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 5 } }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', '&:hover': { color: ACCENT }, transition: 'color 0.2s' }}>Home</Typography>
            </Link>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', '&:hover': { color: ACCENT }, transition: 'color 0.2s' }}>Products</Typography>
            </Link>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600 }}>{product.name}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.75rem' }}>{product.category.name}</Typography>
          </Box>

          <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mb: 2 }}>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', px: 2, py: 0.7, backdropFilter: 'blur(8px)' }}>
              <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>{reviewCount > 0 ? avgRating.toFixed(1) : '—'}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.77rem' }}>({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</Typography>
            </Box>
            <Box sx={{ bgcolor: ACCENT, color: '#fff', px: 2, py: 0.7, borderRadius: '999px', fontSize: '0.85rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(247,68,78,0.45)' }}>
              ${price.toFixed(2)}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── PRODUCT DETAIL ─── */}
      <Box sx={{ position: 'relative', bgcolor: '#fafbfc', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -120, right: -120, width: 600, height: 600, borderRadius: '50%', bgcolor: 'rgba(247,68,78,0.05)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(0,44,62,0.04)', pointerEvents: 'none', zIndex: 0 }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4, md: 8 }, alignItems: 'start' }}>

            {/* LEFT — Image panel */}
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', aspectRatio: '4/5', boxShadow: '0 32px 80px rgba(0,44,62,0.18)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />

                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)', pointerEvents: 'none' }} />

                {product.stock > 0 && product.stock <= 5 && (
                  <Box sx={{ position: 'absolute', top: 20, left: 20, bgcolor: '#f59e0b', color: '#fff', px: 1.8, py: 0.6, borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                    Low Stock
                  </Box>
                )}
                {product.stock === 0 && (
                  <Box sx={{ position: 'absolute', top: 20, left: 20, bgcolor: '#ef4444', color: '#fff', px: 1.8, py: 0.6, borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                    Out of Stock
                  </Box>
                )}

                <Box sx={{ position: 'absolute', top: 18, right: 18, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <IconButton
                    onClick={handleFavoriteClick}
                    sx={{ bgcolor: '#fff', width: 44, height: 44, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', color: wishlisted ? ACCENT : '#9ca3af', '&:hover': { bgcolor: wishlisted ? '#fee2e2' : '#fff', color: ACCENT, transform: 'scale(1.08)' }, transition: 'all 0.2s' }}
                  >
                    {wishlisted ? <FavoriteIcon sx={{ fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
                  </IconButton>
                  <IconButton sx={{ bgcolor: '#fff', width: 44, height: 44, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', color: '#6b7280', '&:hover': { bgcolor: '#fff', color: NAVY, transform: 'scale(1.08)' }, transition: 'all 0.2s' }}>
                    <ShareIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {product.stock > 0 && product.stock <= 10 && (
                  <Box sx={{ position: 'absolute', bottom: 18, left: 18, bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#fff', px: 2, py: 0.8, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                    🔥 Only {product.stock} left in stock
                  </Box>
                )}
              </Box>

              {/* Thumbnail strip — decorative crops of same image */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                {[0, 1, 2, 3].map((idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      aspectRatio: '4/5',
                      border: idx === 0 ? `2.5px solid ${ACCENT}` : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, transform 0.2s',
                      '&:hover': { borderColor: ACCENT, transform: 'translateY(-2px)' },
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`View ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: idx === 0 ? 'center' : idx === 1 ? 'top' : idx === 2 ? 'bottom' : '60% 40%', display: 'block' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* RIGHT — Product info panel */}
            <Box sx={{ pt: { xs: 0, md: 1 } }}>
              {/* Category + Rating row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Chip
                  label={product.category.name}
                  size="small"
                  sx={{ bgcolor: 'rgba(247,68,78,0.08)', color: ACCENT, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', border: `1px solid rgba(247,68,78,0.2)` }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ display: 'flex' }}>
                    {[1,2,3,4,5].map((s) => (
                      <StarIcon key={s} sx={{ fontSize: 16, color: s <= Math.round(avgRating) ? '#f59e0b' : '#e5e7eb' }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: '#374151' }}>{reviewCount > 0 ? avgRating.toFixed(1) : '—'}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af' }}>({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</Typography>
                </Box>
              </Box>

              {/* Product name */}
              <Typography sx={{ fontWeight: 900, color: NAVY, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.1, letterSpacing: '-0.03em', mb: 2.5 }}>
                {product.name}
              </Typography>

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.5rem' }, color: ACCENT, lineHeight: 1 }}>
                  ${price.toFixed(2)}
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: '#9ca3af', textDecoration: 'line-through', fontWeight: 500 }}>
                  ${originalPrice}
                </Typography>
                <Box sx={{ bgcolor: '#dcfce7', color: '#16a34a', px: 1.2, py: 0.4, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {discount}% OFF
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(0,0,0,0.07)', mb: 3.5 }} />

              {/* Colour selector */}
              <Box sx={{ mb: 3.5 }}>
                <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.88rem', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Colour {selectedColor && <Box component="span" sx={{ color: ACCENT, textTransform: 'none', fontWeight: 600, letterSpacing: 0 }}>— selected</Box>}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {STATIC_COLORS.map((color) => (
                    <Box
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      sx={{
                        width: 36, height: 36, borderRadius: '50%', bgcolor: color,
                        border: selectedColor === color ? `3px solid ${ACCENT}` : '3px solid transparent',
                        outline: selectedColor === color ? `2px solid ${ACCENT}` : '2px solid #e5e7eb',
                        outlineOffset: '2px',
                        cursor: 'pointer',
                        transition: 'transform 0.18s, outline-color 0.18s',
                        '&:hover': { transform: 'scale(1.15)' },
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Size selector */}
              <Box sx={{ mb: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Size {selectedSize && <Box component="span" sx={{ color: ACCENT, textTransform: 'none', fontWeight: 600, letterSpacing: 0 }}>— {selectedSize}</Box>}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: ACCENT, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    Size guide →
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {STATIC_SIZES.map((size) => (
                    <Box
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      sx={{
                        minWidth: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1.5,
                        border: selectedSize === size ? `2px solid ${ACCENT}` : '2px solid #e5e7eb',
                        borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700,
                        color: selectedSize === size ? ACCENT : '#374151',
                        bgcolor: selectedSize === size ? 'rgba(247,68,78,0.06)' : '#fff',
                        cursor: 'pointer', transition: 'all 0.18s',
                        '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'rgba(247,68,78,0.04)' },
                      }}
                    >
                      {size}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Quantity */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.88rem', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Quantity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    sx={{ border: '2px solid #e5e7eb', borderRadius: '10px 0 0 10px', width: 44, height: 44, color: '#374151', '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'rgba(247,68,78,0.05)' } }}
                  >
                    <RemoveIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Box sx={{ width: 64, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e7eb', borderLeft: 'none', borderRight: 'none', fontSize: '1rem', fontWeight: 700, color: NAVY }}>
                    {quantity}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    sx={{ border: '2px solid #e5e7eb', borderRadius: '0 10px 10px 0', width: 44, height: 44, color: '#374151', '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'rgba(247,68,78,0.05)' } }}
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography sx={{ ml: 2, fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>
                    {product.stock} in stock
                  </Typography>
                </Box>
              </Box>

              {/* CTA Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={product.stock === 0}
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  sx={{
                    fontWeight: 800, textTransform: 'none', py: 1.8, fontSize: '1rem', borderRadius: '12px',
                    boxShadow: addedToCart ? '0 4px 20px rgba(16,185,129,0.4)' : '0 6px 20px rgba(247,68,78,0.4)',
                    bgcolor: addedToCart ? '#10b981' : ACCENT,
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: addedToCart ? '#059669' : '#e03038', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(247,68,78,0.5)' },
                  }}
                >
                  {product.stock === 0 ? 'Out of Stock' : addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                </Button>
                <IconButton
                  onClick={handleFavoriteClick}
                  sx={{
                    border: `2px solid ${wishlisted ? ACCENT : '#e5e7eb'}`, borderRadius: '12px', width: 60, height: 60,
                    color: wishlisted ? ACCENT : '#9ca3af',
                    bgcolor: wishlisted ? 'rgba(247,68,78,0.06)' : '#fff',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'rgba(247,68,78,0.06)' },
                    flexShrink: 0,
                  }}
                >
                  {wishlisted ? <FavoriteIcon sx={{ fontSize: 22 }} /> : <FavoriteBorderIcon sx={{ fontSize: 22 }} />}
                </IconButton>
              </Box>

              {/* Trust badges */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 4 }}>
                {[
                  { icon: <LocalShippingIcon sx={{ fontSize: 20 }} />, title: 'Free Shipping', sub: 'On orders over $50' },
                  { icon: <ReplayIcon sx={{ fontSize: 20 }} />, title: '30-Day Returns', sub: 'Hassle-free returns' },
                  { icon: <VerifiedIcon sx={{ fontSize: 20 }} />, title: 'Authentic', sub: '100% genuine products' },
                ].map(({ icon, title, sub }) => (
                  <Box key={title} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0.8, p: 1.8, borderRadius: '12px', border: '1.5px solid #f0f0f4', bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <Box sx={{ color: ACCENT }}>{icon}</Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: NAVY }}>{title}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', lineHeight: 1.4 }}>{sub}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Tabs — Description, Reviews, Shipping */}
              <Box>
                <Box sx={{ display: 'flex', borderBottom: '2px solid #f0f0f4', mb: 2.5 }}>
                  {(['description', 'reviews', 'shipping'] as const).map((tab) => (
                    <Button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      disableRipple
                      sx={{
                        textTransform: 'capitalize', fontWeight: activeTab === tab ? 700 : 500, fontSize: '0.88rem',
                        color: activeTab === tab ? ACCENT : '#6b7280',
                        borderBottom: activeTab === tab ? `2px solid ${ACCENT}` : '2px solid transparent',
                        borderRadius: 0, mb: '-2px', px: 2, py: 1.2, transition: 'color 0.18s',
                        '&:hover': { color: ACCENT, bgcolor: 'transparent' },
                      }}
                    >
                      {tab}
                    </Button>
                  ))}
                </Box>

                {activeTab === 'description' && (
                  <Typography sx={{ color: '#4b5563', lineHeight: 1.9, fontSize: '0.92rem' }}>
                    {product.description}
                  </Typography>
                )}

                {activeTab === 'reviews' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reviewsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} sx={{ color: ACCENT }} />
                      </Box>
                    ) : reviews.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography sx={{ color: '#9ca3af', fontSize: '0.9rem' }}>No reviews yet. Be the first to review this product!</Typography>
                      </Box>
                    ) : (
                      reviews.map((review) => {
                        const fullName = `${review.user.firstName} ${review.user.lastName}`;
                        const initials = `${review.user.firstName[0]}${review.user.lastName[0]}`.toUpperCase();
                        const formattedDate = new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                        return (
                          <Box key={review.orderId + review.productId} sx={{ p: 2.5, borderRadius: '12px', border: '1.5px solid #f0f0f4', bgcolor: '#fafbfc' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>{initials}</Typography>
                                </Box>
                                <Box>
                                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: NAVY }}>{fullName}</Typography>
                                  <Box sx={{ display: 'flex' }}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <StarIcon key={i} sx={{ fontSize: 12, color: i < review.rating ? '#f59e0b' : '#e5e7eb' }} />
                                    ))}
                                  </Box>
                                </Box>
                              </Box>
                              <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formattedDate}</Typography>
                            </Box>
                            <Typography sx={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.7 }}>{review.comment}</Typography>
                          </Box>
                        );
                      })
                    )}
                  </Box>
                )}

                {activeTab === 'shipping' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { title: 'Standard Delivery', detail: '3–5 business days · Free on orders $50+, otherwise $4.99' },
                      { title: 'Express Delivery', detail: '1–2 business days · $9.99' },
                      { title: 'Returns & Exchanges', detail: 'Free returns within 30 days of delivery. Items must be unworn with original tags attached.' },
                      { title: 'International', detail: 'Available to 40+ countries. Duties and taxes may apply at checkout.' },
                    ].map(({ title, detail }) => (
                      <Box key={title} sx={{ display: 'flex', gap: 2, p: 2, borderRadius: '10px', bgcolor: '#fafbfc', border: '1px solid #f0f0f4' }}>
                        <Box sx={{ width: 6, borderRadius: '3px', bgcolor: ACCENT, flexShrink: 0, alignSelf: 'stretch' }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.88rem', mb: 0.4 }}>{title}</Typography>
                          <Typography sx={{ color: '#6b7280', fontSize: '0.83rem', lineHeight: 1.6 }}>{detail}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── RELATED PRODUCTS ─── */}
      {relatedProducts.length > 0 && (
        <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#fff' }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
                  <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem' }}>
                    Same Category
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, color: NAVY, fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.02em' }}>
                  You Might Also Like
                </Typography>
              </Box>
              <Link href="/products" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderColor: NAVY, color: NAVY, fontWeight: 700, textTransform: 'none', borderRadius: '10px', px: 3, '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'rgba(247,68,78,0.04)' } }}>
                  View All
                </Button>
              </Link>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/products/${rp.id}`} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                      transition: 'transform 0.28s, box-shadow 0.28s, border-color 0.28s',
                      '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(0,44,62,0.12)', borderColor: 'rgba(247,68,78,0.25)', '& .product-img': { transform: 'scale(1.06)' } },
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', height: { xs: 200, md: 260 }, position: 'relative', bgcolor: '#f5f6f8' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rp.imageUrl ?? PLACEHOLDER_IMG}
                        alt={rp.name}
                        className="product-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s' }}
                      />
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {rp.category.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.9rem', flex: 1, mr: 1, lineHeight: 1.4 }}>
                          {rp.name}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '1rem', flexShrink: 0 }}>
                          ${parseFloat(rp.price).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                        <StarIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
                        <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#374151' }}>4.8</Typography>
                        <Typography sx={{ fontSize: '0.73rem', color: '#9ca3af' }}>(124)</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Link>
              ))}
            </Box>
          </Container>
        </Box>
      )}

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
                <Box component="input" placeholder="Your email address" sx={{ flex: 1, px: 2, py: 1.4, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.875rem', outline: 'none', borderRadius: '6px', '&::placeholder': { color: 'rgba(255,255,255,0.35)' }, '&:focus': { borderColor: ACCENT } }} />
                <Button variant="contained" color="primary" sx={{ fontWeight: 700, textTransform: 'none', px: 2.5, borderRadius: '6px', whiteSpace: 'nowrap' }}>Subscribe</Button>
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

      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitch={(to) => setAuthModal(to)}
        onSuccess={handleAuthSuccess}
      />
    </ThemeProvider>
  );
}
