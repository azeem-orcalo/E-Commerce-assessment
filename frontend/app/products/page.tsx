'use client';

import { useState, useMemo } from 'react';
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
  InputBase,
  Select,
  MenuItem,
  FormControl,
  Slider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import StarIcon from '@mui/icons-material/Star';
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

const ALL_PRODUCTS = [
  { id: 1, name: 'Classic Crew Tee', price: 29.99, category: 'Tops', rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop', badge: 'Best Seller' },
  { id: 2, name: 'Slim Fit Chinos', price: 59.99, category: 'Bottoms', rating: 4.6, reviews: 87, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=600&fit=crop', badge: null },
  { id: 3, name: 'Oxford Button-Down', price: 49.99, category: 'Shirts', rating: 4.7, reviews: 203, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop', badge: 'New' },
  { id: 4, name: 'Floral Summer Dress', price: 69.99, category: 'Dresses', rating: 4.9, reviews: 312, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=600&fit=crop', badge: 'Trending' },
  { id: 5, name: 'Leather Bomber', price: 119.99, category: 'Outerwear', rating: 4.8, reviews: 56, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop', badge: 'New' },
  { id: 6, name: 'Relaxed Linen Shirt', price: 44.99, category: 'Shirts', rating: 4.5, reviews: 91, image: 'https://images.unsplash.com/photo-1589992896096-94e6e80a7e67?w=500&h=600&fit=crop', badge: null },
  { id: 7, name: 'High-Waist Jeans', price: 74.99, category: 'Bottoms', rating: 4.7, reviews: 178, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=600&fit=crop', badge: 'Best Seller' },
  { id: 8, name: 'Knit Pullover Sweater', price: 64.99, category: 'Tops', rating: 4.6, reviews: 143, image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=600&fit=crop', badge: null },
  { id: 9, name: 'Wrap Midi Dress', price: 79.99, category: 'Dresses', rating: 4.8, reviews: 267, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop', badge: 'Trending' },
  { id: 10, name: 'Oversized Hoodie', price: 54.99, category: 'Tops', rating: 4.9, reviews: 445, image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=600&fit=crop', badge: 'Best Seller' },
  { id: 11, name: 'Trench Coat', price: 149.99, category: 'Outerwear', rating: 4.7, reviews: 39, image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500&h=600&fit=crop', badge: 'New' },
  { id: 12, name: 'Pleated Midi Skirt', price: 52.99, category: 'Bottoms', rating: 4.6, reviews: 112, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&h=600&fit=crop', badge: null },
  { id: 13, name: 'Satin Blouse', price: 47.99, category: 'Shirts', rating: 4.5, reviews: 76, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500&h=600&fit=crop', badge: null },
  { id: 14, name: 'Velvet Blazer', price: 109.99, category: 'Outerwear', rating: 4.8, reviews: 48, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=600&fit=crop', badge: 'New' },
  { id: 15, name: 'Boho Maxi Dress', price: 89.99, category: 'Dresses', rating: 4.7, reviews: 189, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=600&fit=crop', badge: null },
  { id: 16, name: 'Cargo Joggers', price: 62.99, category: 'Bottoms', rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop', badge: 'Trending' },
];

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Shirts', 'Dresses', 'Outerwear'];
const BADGE_COLORS: Record<string, string> = {
  'Best Seller': '#f7444e',
  'New': '#10b981',
  'Trending': '#f59e0b',
};

export default function ProductsPage() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<number[]>([0, 200]);
  const [gridView, setGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const filteredProducts = useMemo(() => {
    let result = ALL_PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });

    switch (sortBy) {
      case 'price-asc': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'newest': result = [...result].filter((p) => p.badge === 'New').concat(result.filter((p) => p.badge !== 'New')); break;
    }
    return result;
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ─── NAVBAR ─── */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: NAVY, boxShadow: '0 2px 24px rgba(0,44,62,0.3)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1, justifyContent: 'space-between', minHeight: { xs: 64, md: 72 } }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.06em', color: '#fff', cursor: 'pointer' }}>
                Bin<Box component="span" sx={{ color: ACCENT }}>Azeem</Box>
              </Typography>
            </Link>

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
                      color: item.label === 'Products' ? ACCENT : 'rgba(255,255,255,0.8)',
                      fontWeight: item.label === 'Products' ? 700 : 500,
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setAuthModal('login')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderColor: 'rgba(255,255,255,0.3)', color: '#fff', textTransform: 'none', fontWeight: 500, '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'transparent' } }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAuthModal('signup')}
                sx={{ textTransform: 'none', fontWeight: 700, px: 2.5, boxShadow: '0 4px 14px rgba(247,68,78,0.4)', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(247,68,78,0.5)' } }}
              >
                Get Started
              </Button>
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'flex', md: 'none' } }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>

          {mobileMenuOpen && (
            <Box sx={{ display: { md: 'none' }, pb: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {['Home', 'Products', 'New Arrivals', 'About'].map((item) => (
                <Button key={item} fullWidth sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none', justifyContent: 'flex-start', px: 2, py: 1.2, '&:hover': { color: ACCENT } }}>
                  {item}
                </Button>
              ))}
            </Box>
          )}
        </Container>
      </AppBar>

      {/* ─── HERO SECTION ─── */}
      <Box sx={{ position: 'relative', height: { xs: 340, md: 480 }, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=600&fit=crop"
          alt="Products hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        {/* Gradient overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${NAVY}ee 0%, ${NAVY}99 45%, ${NAVY}55 70%, transparent 100%)` }} />
        {/* Dot pattern */}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', '&:hover': { color: ACCENT }, transition: 'color 0.2s' }}>
                Home
              </Typography>
            </Link>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>/</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Products</Typography>
          </Box>

          <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.82rem', display: 'block', mb: 1.5 }}>
            ── Our Full Collection
          </Typography>
          <Typography
            sx={{ fontWeight: 900, color: '#fff', fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4.2rem' }, lineHeight: 1.1, mb: 2.5, letterSpacing: '-0.02em' }}
          >
            All Products
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', maxWidth: 520, lineHeight: 1.8, mb: 4 }}>
            {ALL_PRODUCTS.length} carefully curated pieces for every occasion — from everyday essentials to statement fashion.
          </Typography>

          {/* Quick-stats row */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { icon: <LocalShippingIcon sx={{ fontSize: 18 }} />, text: 'Free shipping $50+' },
              { icon: <StarIcon sx={{ fontSize: 18 }} />, text: '4.8 avg rating' },
              { icon: <ShoppingCartIcon sx={{ fontSize: 18 }} />, text: '500+ products' },
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: ACCENT }}>{icon}</Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.87rem', fontWeight: 500 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </Container>

        {/* Bottom fade */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, #fff, transparent)', pointerEvents: 'none' }} />
      </Box>

      {/* ─── FILTER / SEARCH BAR ─── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 72, zIndex: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 2.5, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: '#f5f6f8', borderRadius: '10px', px: 2, py: 1.1,
                border: '1.5px solid transparent',
                flex: { xs: '1 1 100%', sm: '1 1 260px' },
                maxWidth: { sm: 320 },
                transition: 'border-color 0.2s',
                '&:focus-within': { borderColor: ACCENT, bgcolor: '#fff' },
              }}
            >
              <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
              <InputBase
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.9rem', color: NAVY, '& input::placeholder': { color: '#9ca3af' } }}
              />
            </Box>

            {/* Category chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    fontWeight: 600, fontSize: '0.82rem',
                    bgcolor: selectedCategory === cat ? ACCENT : '#f5f6f8',
                    color: selectedCategory === cat ? '#fff' : '#4b5563',
                    border: selectedCategory === cat ? `1.5px solid ${ACCENT}` : '1.5px solid #e5e7eb',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: selectedCategory === cat ? '#e03038' : '#ffe5e6', borderColor: ACCENT, color: selectedCategory === cat ? '#fff' : ACCENT },
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>

            {/* Sort */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                sx={{
                  fontSize: '0.88rem', fontWeight: 600, color: NAVY,
                  bgcolor: '#f5f6f8', borderRadius: '10px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
                }}
              >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-asc">Price: Low → High</MenuItem>
                <MenuItem value="price-desc">Price: High → Low</MenuItem>
                <MenuItem value="rating">Top Rated</MenuItem>
              </Select>
            </FormControl>

            {/* Filter toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<TuneIcon />}
              sx={{ color: showFilters ? ACCENT : '#4b5563', fontWeight: 600, textTransform: 'none', fontSize: '0.88rem', bgcolor: showFilters ? 'rgba(247,68,78,0.08)' : '#f5f6f8', borderRadius: '10px', px: 2.2, py: 1.1, border: showFilters ? `1.5px solid ${ACCENT}` : '1.5px solid #e5e7eb', '&:hover': { bgcolor: 'rgba(247,68,78,0.08)', borderColor: ACCENT, color: ACCENT } }}
            >
              Filters
            </Button>

            {/* Grid toggle */}
            <Box sx={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <IconButton onClick={() => setGridView(true)} size="small" sx={{ borderRadius: 0, px: 1.5, py: 1, bgcolor: gridView ? ACCENT : 'transparent', color: gridView ? '#fff' : '#6b7280', '&:hover': { bgcolor: gridView ? ACCENT : '#f5f6f8' } }}>
                <GridViewIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton onClick={() => setGridView(false)} size="small" sx={{ borderRadius: 0, px: 1.5, py: 1, bgcolor: !gridView ? ACCENT : 'transparent', color: !gridView ? '#fff' : '#6b7280', '&:hover': { bgcolor: !gridView ? ACCENT : '#f5f6f8' } }}>
                <ViewListIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Expanded price filter panel */}
          {showFilters && (
            <Box sx={{ py: 3, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 240, maxWidth: 380 }}>
                <Typography sx={{ fontWeight: 700, color: NAVY, mb: 1.5, fontSize: '0.88rem' }}>
                  Price Range: ${priceRange[0]} – ${priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, v) => setPriceRange(v as number[])}
                  min={0} max={200} step={5}
                  sx={{ color: ACCENT, '& .MuiSlider-thumb': { bgcolor: ACCENT }, '& .MuiSlider-track': { bgcolor: ACCENT } }}
                />
              </Box>
              <Button onClick={() => { setPriceRange([0, 200]); setSelectedCategory('All'); setSearchQuery(''); setSortBy('featured'); }} sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { color: ACCENT } }}>
                Reset all filters
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* ─── RESULTS COUNT ─── */}
      <Box sx={{ bgcolor: '#fafbfc', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 1.8 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#6b7280', fontSize: '0.88rem', fontWeight: 500 }}>
              Showing <Box component="span" sx={{ color: NAVY, fontWeight: 700 }}>{filteredProducts.length}</Box> of {ALL_PRODUCTS.length} products
              {selectedCategory !== 'All' && (
                <> in <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>{selectedCategory}</Box></>
              )}
            </Typography>
            {wishlist.length > 0 && (
              <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>
                <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>{wishlist.length}</Box> in wishlist
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* ─── PRODUCTS GRID ─── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 8 }, minHeight: 600 }}>
        <Container maxWidth="xl">
          {filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔍</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: NAVY, mb: 1 }}>No products found</Typography>
              <Typography sx={{ color: '#6b7280', mb: 3 }}>Try adjusting your search or filters</Typography>
              <Button variant="contained" color="primary" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setPriceRange([0, 200]); }} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Clear Filters
              </Button>
            </Box>
          ) : gridView ? (
            /* Grid view */
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 } }}>
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  elevation={0}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  sx={{
                    border: '1.5px solid rgba(0,0,0,0.07)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.28s, box-shadow 0.28s, border-color 0.28s',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 50px rgba(0,44,62,0.13)', borderColor: 'rgba(247,68,78,0.25)' },
                  }}
                >
                  {/* Image */}
                  <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 220, sm: 280, md: 300 } }}>
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.name}
                      sx={{ height: '100%', objectFit: 'cover', transition: 'transform 0.45s', ...(hoveredProduct === product.id && { transform: 'scale(1.08)' }) }}
                    />
                    {/* Badge */}
                    {product.badge && (
                      <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: BADGE_COLORS[product.badge], color: '#fff', px: 1.3, py: 0.4, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        {product.badge}
                      </Box>
                    )}
                    {/* Wishlist */}
                    <IconButton
                      size="small"
                      onClick={() => toggleWishlist(product.id)}
                      sx={{
                        position: 'absolute', top: 10, right: 10,
                        bgcolor: '#fff', width: 36, height: 36,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        opacity: hoveredProduct === product.id || wishlist.includes(product.id) ? 1 : 0,
                        transform: hoveredProduct === product.id || wishlist.includes(product.id) ? 'scale(1)' : 'scale(0.7)',
                        transition: 'opacity 0.22s, transform 0.22s',
                        '&:hover': { bgcolor: wishlist.includes(product.id) ? '#fee2e2' : ACCENT, color: wishlist.includes(product.id) ? ACCENT : '#fff' },
                        color: wishlist.includes(product.id) ? ACCENT : '#9ca3af',
                      }}
                    >
                      <FavoriteIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ pb: 0.5, pt: 2, px: 2.5 }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {product.category}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 0.4 }}>
                      <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.92rem', flex: 1, mr: 1, lineHeight: 1.4 }}>
                        {product.name}
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '1.05rem', flexShrink: 0 }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                    </Box>
                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{product.rating}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>({product.reviews})</Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 2.5, pb: 2.5, pt: 1.5 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                      startIcon={<ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
                      sx={{
                        fontWeight: 700, textTransform: 'none', py: 1.15, fontSize: '0.85rem', borderRadius: '8px',
                        opacity: hoveredProduct === product.id ? 1 : 0,
                        transform: hoveredProduct === product.id ? 'translateY(0)' : 'translateY(8px)',
                        transition: 'opacity 0.22s, transform 0.22s',
                        boxShadow: '0 4px 12px rgba(247,68,78,0.35)',
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          ) : (
            /* List view */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  elevation={0}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  sx={{
                    border: '1.5px solid rgba(0,0,0,0.07)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.28s, border-color 0.28s',
                    '&:hover': { boxShadow: '0 8px 32px rgba(0,44,62,0.1)', borderColor: 'rgba(247,68,78,0.25)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <Box sx={{ position: 'relative', width: { xs: 130, sm: 200 }, height: { xs: 120, sm: 160 }, flexShrink: 0, overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={product.image}
                        alt={product.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', ...(hoveredProduct === product.id && { transform: 'scale(1.06)' }) }}
                      />
                      {product.badge && (
                        <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: BADGE_COLORS[product.badge], color: '#fff', px: 1, py: 0.3, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                          {product.badge}
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, px: { xs: 2, sm: 3 }, py: 2 }}>
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {product.category}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: { xs: '0.95rem', sm: '1.1rem' }, mt: 0.4, mb: 0.8 }}>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{product.rating}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>({product.reviews} reviews)</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ px: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5, flexShrink: 0 }}>
                      <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ShoppingCartIcon sx={{ fontSize: '0.9rem' }} />}
                        sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', borderRadius: '8px', px: 2, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(247,68,78,0.3)' }}
                      >
                        Add to Cart
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => toggleWishlist(product.id)}
                        sx={{ color: wishlist.includes(product.id) ? ACCENT : '#d1d5db', '&:hover': { color: ACCENT } }}
                      >
                        <FavoriteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
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

      <AuthModals mode={authModal} onClose={() => setAuthModal(null)} onSwitch={(to) => setAuthModal(to)} />
    </ThemeProvider>
  );
}
