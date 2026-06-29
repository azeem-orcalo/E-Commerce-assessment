'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
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
  Divider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RedeemIcon from '@mui/icons-material/Redeem';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AuthModals from '@/components/AuthModals';

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

const features = [
  {
    icon: <LocalShippingIcon sx={{ fontSize: 38 }} />,
    title: 'Fast Delivery',
    body: 'We deliver your orders within 24 hours straight to your doorstep anywhere in the country, guaranteed.',
  },
  {
    icon: <RedeemIcon sx={{ fontSize: 38 }} />,
    title: 'Free Shipping',
    body: 'Enjoy free shipping on all orders over $50. No hidden fees, no surprises waiting at checkout.',
  },
  {
    icon: <StarIcon sx={{ fontSize: 38 }} />,
    title: 'Best Quality',
    body: 'Every product is carefully curated and quality-checked before it ever reaches your hands.',
  },
];

const products = [
  {
    id: 1,
    name: 'Classic Crew Tee',
    price: 29.99,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
  },
  {
    id: 2,
    name: 'Slim Fit Chinos',
    price: 59.99,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
  },
  {
    id: 3,
    name: 'Oxford Button-Down',
    price: 49.99,
    category: 'Shirts',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop',
  },
  {
    id: 4,
    name: 'Floral Summer Dress',
    price: 69.99,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop',
  },
  {
    id: 5,
    name: 'Leather Bomber',
    price: 119.99,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
  },
  {
    id: 6,
    name: 'Relaxed Linen Shirt',
    price: 44.99,
    category: 'Shirts',
    image: 'https://images.unsplash.com/photo-1589992896096-94e6e80a7e67?w=400&h=500&fit=crop',
  },
  {
    id: 7,
    name: 'High-Waist Jeans',
    price: 74.99,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop',
  },
  {
    id: 8,
    name: 'Knit Pullover Sweater',
    price: 64.99,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=500&fit=crop',
  },
];

const newArrivalImages = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=380&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=380&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=380&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=380&fit=crop',
];

export default function Home() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ─────────────── NAVBAR ─────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: NAVY, boxShadow: '0 2px 24px rgba(0,44,62,0.3)' }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{ py: 1, justifyContent: 'space-between', minHeight: { xs: 64, md: 72 } }}
          >
            {/* Logo */}
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.06em', color: '#fff' }}>
              Bin<Box component="span" sx={{ color: ACCENT }}>Azeem</Box>
            </Typography>

            {/* Desktop nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'New Arrivals', href: '/products?sort=newest' },
                { label: 'About', href: '/' },
              ].map((item) => (
                <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                  <Button
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      px: 1.8,
                      '&:hover': { color: ACCENT, bgcolor: 'rgba(247,68,78,0.08)' },
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Box>

            {/* Auth buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setAuthModal('login')}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'transparent' },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAuthModal('signup')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  boxShadow: '0 4px 14px rgba(247,68,78,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(247,68,78,0.5)' },
                }}
              >
                Get Started
              </Button>
              <IconButton
                sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'flex', md: 'none' } }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open menu"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <Box sx={{ display: { md: 'none' }, pb: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {['Home', 'Products', 'New Arrivals', 'About'].map((item) => (
                <Button
                  key={item}
                  fullWidth
                  sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none', justifyContent: 'flex-start', px: 2, py: 1.2, '&:hover': { color: ACCENT } }}
                >
                  {item}
                </Button>
              ))}
              <Box sx={{ px: 2, pt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => { setMobileMenuOpen(false); setAuthModal('login'); }}
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', textTransform: 'none' }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          )}
        </Container>
      </AppBar>

      {/* ─────────────── HERO ─────────────── */}
      <Box
        sx={{
          minHeight: { xs: 'auto', md: '88vh' },
          bgcolor: '#fff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -120, right: -120, width: 560, height: 560, borderRadius: '50%', bgcolor: 'rgba(247,68,78,0.045)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -160, left: -100, width: 480, height: 480, borderRadius: '50%', bgcolor: 'rgba(0,44,62,0.035)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,44,62,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ py: { xs: 8, md: 4 }, position: 'relative', zIndex: 1 }}>
          {/* Two-column layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 6, md: 8 },
              alignItems: 'center',
            }}
          >
            {/* Left: copy */}
            <Box>
              <Typography
                variant="overline"
                sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.82rem', display: 'block', mb: 1.5 }}
              >
                ── Limited Time Offer
              </Typography>

              <Typography
                sx={{ fontWeight: 900, color: ACCENT, lineHeight: 1, mb: 0.5, fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4.8rem' } }}
              >
                Sale 20% Off
              </Typography>

              <Typography
                sx={{ fontWeight: 900, color: NAVY, lineHeight: 1.05, mb: 3.5, fontSize: { xs: '2.6rem', sm: '3.2rem', md: '5.4rem' }, letterSpacing: '-0.025em' }}
              >
                On<br />Everything
              </Typography>

              <Typography sx={{ color: '#5a6472', mb: 5, maxWidth: 460, lineHeight: 1.85, fontSize: '1.05rem' }}>
                Discover our newest collection of premium clothing — from everyday essentials to
                statement pieces. Crafted for comfort, designed for style. Your wardrobe upgrade
                starts right here.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 5, py: 1.9, fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(247,68,78,0.38)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'scale(1.04)', boxShadow: '0 12px 32px rgba(247,68,78,0.5)' },
                    }}
                  >
                    Shop Now
                  </Button>
                </Link>
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 5, py: 1.9, fontWeight: 600, fontSize: '1rem', textTransform: 'none',
                      borderColor: NAVY, color: NAVY,
                      '&:hover': { bgcolor: NAVY, color: '#fff', borderColor: NAVY },
                    }}
                  >
                    View Collection
                  </Button>
                </Link>
              </Box>

              {/* Stats */}
              <Box sx={{ mt: 7, display: 'flex', gap: { xs: 4, md: 6 } }}>
                {[['2K+', 'Happy Customers'], ['500+', 'Products'], ['4.9★', 'Avg Rating']].map(([num, label]) => (
                  <Box key={label}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', color: NAVY, lineHeight: 1 }}>{num}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#999', mt: 0.4, fontWeight: 500 }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right: hero image */}
            <Box
              sx={{
                position: 'relative',
                height: { xs: 360, sm: 480, md: 620 },
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,44,62,0.2)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=1000&fit=crop"
                alt="Fashion hero"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Sale badge */}
              <Box
                sx={{
                  position: 'absolute', top: 24, right: 24,
                  bgcolor: ACCENT, color: '#fff',
                  borderRadius: '50%', width: 96, height: 96,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(247,68,78,0.55)',
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>20%</Typography>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em' }}>OFF</Typography>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(0,44,62,0.35), transparent)' }} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─────────────── WHY SHOP WITH US ─────────────── */}
      <Box sx={{ bgcolor: '#f8f9fb', py: { xs: 9, md: 12 } }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.82rem' }}>
              Our Promise
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: NAVY, mt: 1, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>
              Why Shop With Us
            </Typography>
            <Box sx={{ width: 56, height: 4, bgcolor: ACCENT, mx: 'auto', mt: 2.5, borderRadius: 2 }} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}
          >
            {features.map((feat) => (
              <Card
                key={feat.title}
                elevation={0}
                sx={{
                  p: { xs: 4, md: 5 },
                  textAlign: 'center',
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  borderRadius: '16px',
                  bgcolor: '#fff',
                  transition: 'transform 0.28s, box-shadow 0.28s, border-color 0.28s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 50px rgba(0,44,62,0.1)', borderColor: 'transparent' },
                }}
              >
                <Box
                  sx={{
                    width: 84, height: 84, borderRadius: '50%',
                    bgcolor: 'rgba(247,68,78,0.1)', color: ACCENT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 3.5,
                  }}
                >
                  {feat.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: NAVY, mb: 1.5 }}>
                  {feat.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.9 }}>
                  {feat.body}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─────────────── NEW ARRIVALS BANNER ─────────────── */}
      <Box sx={{ bgcolor: NAVY, py: { xs: 9, md: 12 }, overflow: 'hidden' }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 6, md: 10 },
              alignItems: 'center',
            }}
          >
            {/* Left: text */}
            <Box>
              <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.82rem' }}>
                Fresh In Store
              </Typography>
              <Typography
                sx={{ fontWeight: 900, color: '#fff', mt: 1.5, mb: 2.5, fontSize: { xs: '2rem', md: '3.2rem' }, lineHeight: 1.15 }}
              >
                New Arrivals —<br />Best Apparel
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, lineHeight: 1.85, maxWidth: 460, fontSize: '1.02rem' }}>
                Be the first to wear our latest drops. Every week brings fresh styles — limited
                quantities, all-season quality. Don&apos;t miss out on the pieces everyone will be
                wearing next season.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 5 }}>
                {['Tops', 'Bottoms', 'Dresses', 'Outerwear'].map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.82rem',
                      border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s',
                      '&:hover': { bgcolor: ACCENT, borderColor: ACCENT },
                    }}
                  />
                ))}
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 5, py: 1.9, fontWeight: 700, textTransform: 'none', fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(247,68,78,0.45)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'scale(1.03)', boxShadow: '0 12px 32px rgba(247,68,78,0.56)' },
                }}
              >
                Explore New Arrivals
              </Button>
            </Box>

            {/* Right: staggered image grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                maxWidth: 520,
                mx: 'auto',
              }}
            >
              {newArrivalImages.map((src, i) => (
                <Box
                  key={i}
                  sx={{
                    borderRadius: '12px', overflow: 'hidden',
                    height: { xs: 170, md: 210 },
                    mt: i % 2 === 1 ? { xs: 2.5, md: 4 } : 0,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.04)' },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`New arrival ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─────────────── PRODUCTS GRID ─────────────── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 9, md: 12 } }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.82rem' }}>
              Handpicked For You
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: NAVY, mt: 1, fontSize: { xs: '1.9rem', md: '2.6rem' } }}>
              Our Products
            </Typography>
            <Box sx={{ width: 56, height: 4, bgcolor: ACCENT, mx: 'auto', mt: 2.5, borderRadius: 2 }} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 2, md: 3 },
            }}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                elevation={0}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                sx={{
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.28s, box-shadow 0.28s, border-color 0.28s',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(0,44,62,0.13)', borderColor: 'rgba(247,68,78,0.3)' },
                }}
              >
                {/* Image area */}
                <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 220, sm: 280 } }}>
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{
                      height: '100%', objectFit: 'cover',
                      transition: 'transform 0.45s',
                      ...(hoveredProduct === product.id && { transform: 'scale(1.08)' }),
                    }}
                  />
                  {/* Category badge */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: NAVY, color: '#fff', px: 1.2, py: 0.35, borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {product.category}
                  </Box>
                  {/* Wishlist */}
                  <IconButton
                    size="small"
                    aria-label="Add to wishlist"
                    sx={{
                      position: 'absolute', top: 8, left: 8,
                      bgcolor: '#fff', width: 34, height: 34,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      opacity: hoveredProduct === product.id ? 1 : 0,
                      transform: hoveredProduct === product.id ? 'scale(1)' : 'scale(0.7)',
                      transition: 'opacity 0.22s, transform 0.22s',
                      '&:hover': { bgcolor: ACCENT, color: '#fff' },
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Name + price */}
                <CardContent sx={{ pb: 0.5, pt: 2, px: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem', flex: 1, mr: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {product.name}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '1rem', flexShrink: 0 }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>

                {/* Add to cart — slides up on hover */}
                <CardActions sx={{ px: 2.5, pb: 2.5, pt: 1.5 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    fullWidth
                    startIcon={<ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
                    sx={{
                      fontWeight: 700, textTransform: 'none', py: 1.1, fontSize: '0.85rem', borderRadius: '6px',
                      opacity: hoveredProduct === product.id ? 1 : 0,
                      transform: hoveredProduct === product.id ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'opacity 0.22s, transform 0.22s',
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 7 }}>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderColor: NAVY, color: NAVY, px: 7, py: 1.9, fontWeight: 700, textTransform: 'none', fontSize: '1rem',
                  transition: 'background 0.2s, color 0.2s, transform 0.2s',
                  '&:hover': { bgcolor: NAVY, color: '#fff', borderColor: NAVY, transform: 'scale(1.03)' },
                }}
              >
                View All Products
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* ─────────────── PROMO STRIP ─────────────── */}
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

      {/* ─────────────── FOOTER ─────────────── */}
      <Box sx={{ bgcolor: NAVY, color: '#fff', pt: 8, pb: 4 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 2fr' },
              gap: 5,
            }}
          >
            {/* Brand */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.06em', mb: 2 }}>
                Bin<Box component="span" sx={{ color: ACCENT }}>Azeem</Box>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 290, lineHeight: 1.9 }}>
                Premium clothing for the modern wardrobe. Quality craftsmanship, timeless design — built around you.
              </Typography>
            </Box>

            {/* Shop */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                Shop
              </Typography>
              {['New Arrivals', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'].map((l) => (
                <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mb: 1.2, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: ACCENT } }}>
                  {l}
                </Typography>
              ))}
            </Box>

            {/* Help */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                Help
              </Typography>
              {['FAQ', 'Shipping Info', 'Returns', 'Contact Us', 'Size Guide'].map((l) => (
                <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mb: 1.2, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: ACCENT } }}>
                  {l}
                </Typography>
              ))}
            </Box>

            {/* Newsletter */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                Newsletter
              </Typography>
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
                    transition: 'border-color 0.2s',
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
                <Typography key={l} variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', cursor: 'pointer', '&:hover': { color: ACCENT }, transition: 'color 0.2s' }}>
                  {l}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─────────────── AUTH MODALS ─────────────── */}
      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitch={(to) => setAuthModal(to)}
      />
    </ThemeProvider>
  );
}
