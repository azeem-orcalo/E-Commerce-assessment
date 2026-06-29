'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
  Divider,
  InputBase,
  Select,
  MenuItem,
  FormControl,
  Slider,
  CircularProgress,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import StarIcon from '@mui/icons-material/Star';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import {
  authApi,
  productsApi,
  categoriesApi,
  setAccessToken,
  getStoredUser,
  setStoredUser,
  type ApiProduct,
  type Category,
  type ProductsMeta,
  type ProductsQueryParams,
} from '@/lib/api';
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
const PLACEHOLDER_IMG = 'https://placehold.co/800x900/f5f6f8/9ca3af?text=No+Image';

const SORT_MAP: Record<string, ProductsQueryParams['sortBy']> = {
  featured: 'featured',
  newest: 'newest',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  rating: 'best_seller',
};

export default function ProductsPage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<number[]>([0, 200]);
  const [gridView, setGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { favorites, toggle: toggleFavorite, isFavorite, syncFromApi, clear: clearFavorites } = useFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [pendingFavorite, setPendingFavorite] = useState<ApiProduct | null>(null);
  const { openCart, addItem, refreshCart, resetCartState } = useCart();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ProductsMeta>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<number[]>([0, 200]);

  // Rehydrate auth from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Debounce price range
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedPriceRange(priceRange); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [priceRange]);

  // Fetch categories once on mount
  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Fetch products when any filter/page changes
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ProductsQueryParams = {
        page,
        limit,
        sortBy: SORT_MAP[sortBy] ?? 'featured',
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (debouncedPriceRange[0] > 0) params.minPrice = debouncedPriceRange[0];
      if (debouncedPriceRange[1] < 200) params.maxPrice = debouncedPriceRange[1];

      const res = await productsApi.list(params);
      setProducts(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, debouncedSearch, selectedCategoryId, debouncedPriceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // If not logged in, gate favorite behind login modal
  const handleFavoriteClick = (product: ApiProduct) => {
    if (!currentUser) {
      setPendingFavorite(product);
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
    if (pendingFavorite) {
      toggleFavorite(pendingFavorite);
      setPendingFavorite(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredUser(null);
    clearFavorites();
    resetCartState();
    setAccessToken(null);
    authApi.logout().catch(() => {});
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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPriceRange([0, 200]);
    setSelectedCategoryId('');
    setSearchQuery('');
    setSortBy('featured');
    setLimit(12);
    setPage(1);
    setShowFavoritesOnly(false);
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name ?? '';

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

      {/* ─── HERO SECTION ─── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 420, md: 560 },
          pb: { xs: '80px', md: '100px' },
          display: 'flex',
          alignItems: 'center',
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800&h=700&fit=crop&q=85"
          alt="Fashion store"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', display: 'block' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(0,44,62,0.93) 0%, rgba(0,44,62,0.80) 42%, rgba(0,44,62,0.48) 72%, rgba(0,44,62,0.18) 100%)` }} />
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 7, md: 9 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3.5 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: ACCENT } }}>
                Home
              </Typography>
            </Link>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.83rem' }}>/</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem', fontWeight: 600 }}>Products</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            <Typography variant="overline" sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.78rem' }}>
              Our Full Collection
            </Typography>
          </Box>

          <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: { xs: '2.6rem', sm: '3.4rem', md: '5rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mb: 2.5 }}>
            All<br />
            <Box component="span" sx={{ color: ACCENT }}>Products</Box>
          </Typography>

          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.97rem', md: '1.08rem' }, maxWidth: 460, lineHeight: 1.85, mb: 5 }}>
            {meta.total > 0 ? `${meta.total} ` : ''}Carefully curated pieces — from everyday essentials to statement fashion. Filter, search, and find exactly what you need.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              { icon: <LocalShippingIcon sx={{ fontSize: 16 }} />, text: 'Free shipping $50+' },
              { icon: <StarIcon sx={{ fontSize: 16 }} />, text: '4.8 avg rating' },
              { icon: <ShoppingCartIcon sx={{ fontSize: 16 }} />, text: '500+ products' },
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', px: 2.2, py: 0.9, backdropFilter: 'blur(8px)' }}>
                <Box sx={{ color: ACCENT, display: 'flex' }}>{icon}</Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.83rem', fontWeight: 600 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
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
              {/* Favorites filter chip */}
              <Chip
                icon={<FavoriteIcon sx={{ fontSize: '14px !important', color: showFavoritesOnly ? '#fff' : ACCENT }} />}
                label={favorites.length > 0 ? `Favorites (${favorites.length})` : 'Favorites'}
                onClick={() => setShowFavoritesOnly((v) => !v)}
                sx={{
                  fontWeight: 700, fontSize: '0.82rem',
                  bgcolor: showFavoritesOnly ? ACCENT : '#fff0f0',
                  color: showFavoritesOnly ? '#fff' : ACCENT,
                  border: `1.5px solid ${ACCENT}`,
                  transition: 'all 0.18s',
                  '& .MuiChip-icon': { ml: 0.8 },
                  '&:hover': { bgcolor: showFavoritesOnly ? '#e03038' : '#fee2e2' },
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="All"
                onClick={() => { handleCategorySelect(''); setShowFavoritesOnly(false); }}
                sx={{
                  fontWeight: 600, fontSize: '0.82rem',
                  bgcolor: !showFavoritesOnly && selectedCategoryId === '' ? ACCENT : '#f5f6f8',
                  color: !showFavoritesOnly && selectedCategoryId === '' ? '#fff' : '#4b5563',
                  border: !showFavoritesOnly && selectedCategoryId === '' ? `1.5px solid ${ACCENT}` : '1.5px solid #e5e7eb',
                  transition: 'all 0.18s',
                  '&:hover': { bgcolor: !showFavoritesOnly && selectedCategoryId === '' ? '#e03038' : '#ffe5e6', borderColor: ACCENT, color: !showFavoritesOnly && selectedCategoryId === '' ? '#fff' : ACCENT },
                  cursor: 'pointer',
                }}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  onClick={() => handleCategorySelect(cat.id)}
                  sx={{
                    fontWeight: 600, fontSize: '0.82rem',
                    bgcolor: selectedCategoryId === cat.id ? ACCENT : '#f5f6f8',
                    color: selectedCategoryId === cat.id ? '#fff' : '#4b5563',
                    border: selectedCategoryId === cat.id ? `1.5px solid ${ACCENT}` : '1.5px solid #e5e7eb',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: selectedCategoryId === cat.id ? '#e03038' : '#ffe5e6', borderColor: ACCENT, color: selectedCategoryId === cat.id ? '#fff' : ACCENT },
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>

            {/* Sort */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
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
                <MenuItem value="rating">Best Sellers</MenuItem>
              </Select>
            </FormControl>

            {/* Per-page selector */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={limit}
                onChange={(e) => handleLimitChange(e.target.value as number)}
                displayEmpty
                sx={{
                  fontSize: '0.88rem', fontWeight: 600, color: NAVY,
                  bgcolor: '#f5f6f8', borderRadius: '10px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
                }}
              >
                {[12, 24, 48].map((n) => (
                  <MenuItem key={n} value={n}>{n} / page</MenuItem>
                ))}
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
              <Button onClick={handleResetFilters} sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', '&:hover': { color: ACCENT } }}>
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
              {showFavoritesOnly ? (
                <>
                  <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>{favorites.length}</Box> favorited item{favorites.length !== 1 ? 's' : ''}
                </>
              ) : loading ? (
                'Loading…'
              ) : (
                <>
                  Showing{' '}
                  <Box component="span" sx={{ color: NAVY, fontWeight: 700 }}>
                    {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)}
                  </Box>{' '}
                  of {meta.total} products
                  {selectedCategoryId && (
                    <> in <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>{selectedCategoryName}</Box></>
                  )}
                </>
              )}
            </Typography>
            {favorites.length > 0 && !showFavoritesOnly && (
              <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', '&:hover': { color: ACCENT } }} onClick={() => setShowFavoritesOnly(true)}>
                <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>{favorites.length}</Box> ❤ saved
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* ─── PRODUCTS GRID ─── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 8 }, minHeight: 600 }}>
        <Container maxWidth="xl">
          {showFavoritesOnly ? (
            /* ─── FAVORITES VIEW ─── */
            favorites.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 14 }}>
                <Typography sx={{ fontSize: '3.5rem', mb: 2 }}>💔</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: NAVY, mb: 1.5 }}>No favorites yet</Typography>
                <Typography sx={{ color: '#6b7280', mb: 4, maxWidth: 340, mx: 'auto', lineHeight: 1.7 }}>
                  Click the ❤ on any product to save it here. Your wishlist persists across sessions.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setShowFavoritesOnly(false)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 4, py: 1.4 }}>
                  Browse Products
                </Button>
              </Box>
            ) : gridView ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 } }}>
                {favorites.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      elevation={0}
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      sx={{
                        border: '1.5px solid rgba(247,68,78,0.2)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.28s, box-shadow 0.28s, border-color 0.28s',
                        '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 50px rgba(0,44,62,0.13)', borderColor: 'rgba(247,68,78,0.5)' },
                      }}
                    >
                      <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 220, sm: 280, md: 300 } }}>
                        <CardMedia
                          component="img"
                          image={product.imageUrl ?? PLACEHOLDER_IMG}
                          alt={product.name}
                          sx={{ height: '100%', objectFit: 'cover', transition: 'transform 0.45s', ...(hoveredProduct === product.id && { transform: 'scale(1.08)' }) }}
                        />
                        {product.stock > 0 && product.stock <= 5 && (
                          <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#f59e0b', color: '#fff', px: 1.3, py: 0.4, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Low Stock
                          </Box>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => { e.preventDefault(); handleFavoriteClick(product); }}
                          sx={{
                            position: 'absolute', top: 10, right: 10,
                            bgcolor: '#fff', width: 36, height: 36,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                            color: ACCENT,
                            '&:hover': { bgcolor: '#fee2e2', color: ACCENT },
                          }}
                        >
                          <FavoriteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Box>
                      <CardContent sx={{ pb: 0.5, pt: 2, px: 2.5 }}>
                        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {product.category.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 0.4 }}>
                          <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.92rem', flex: 1, mr: 1, lineHeight: 1.4 }}>
                            {product.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '1.05rem', flexShrink: 0 }}>
                            ${parseFloat(product.price).toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600, mt: 0.8 }}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 1.5 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          disabled={product.stock === 0}
                          onClick={(e) => handleAddToCart(e, product)}
                          startIcon={<ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
                          sx={{ fontWeight: 700, textTransform: 'none', py: 1.15, fontSize: '0.85rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(247,68,78,0.35)' }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Link>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {favorites.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    <Card elevation={0} onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}
                      sx={{ border: '1.5px solid rgba(247,68,78,0.2)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.28s, border-color 0.28s', '&:hover': { boxShadow: '0 8px 32px rgba(0,44,62,0.1)', borderColor: 'rgba(247,68,78,0.5)' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative', width: { xs: 130, sm: 200 }, height: { xs: 120, sm: 160 }, flexShrink: 0, overflow: 'hidden' }}>
                          <CardMedia component="img" image={product.imageUrl ?? PLACEHOLDER_IMG} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', ...(hoveredProduct === product.id && { transform: 'scale(1.06)' }) }} />
                        </Box>
                        <Box sx={{ flex: 1, px: { xs: 2, sm: 3 }, py: 2 }}>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{product.category.name}</Typography>
                          <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: { xs: '0.95rem', sm: '1.1rem' }, mt: 0.4, mb: 0.8 }}>{product.name}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</Typography>
                        </Box>
                        <Box sx={{ px: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5, flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>${parseFloat(product.price).toFixed(2)}</Typography>
                          <Button variant="contained" color="primary" size="small" disabled={product.stock === 0} onClick={(e) => handleAddToCart(e, product)} startIcon={<ShoppingCartIcon sx={{ fontSize: '0.9rem' }} />} sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', borderRadius: '8px', px: 2, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(247,68,78,0.3)' }}>
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                          <IconButton size="small" onClick={(e) => { e.preventDefault(); handleFavoriteClick(product); }} sx={{ color: ACCENT, '&:hover': { color: '#e03038' } }}>
                            <FavoriteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  </Link>
                ))}
              </Box>
            )
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress sx={{ color: ACCENT }} size={48} />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔍</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: NAVY, mb: 1 }}>No products found</Typography>
              <Typography sx={{ color: '#6b7280', mb: 3 }}>Try adjusting your search or filters</Typography>
              <Button variant="contained" color="primary" onClick={handleResetFilters} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Clear Filters
              </Button>
            </Box>
          ) : gridView ? (
            /* Grid view */
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 } }}>
              {products.map((product) => (
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
                      transition: 'transform 0.28s, box-shadow 0.28s, border-color 0.28s',
                      '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 50px rgba(0,44,62,0.13)', borderColor: 'rgba(247,68,78,0.25)' },
                    }}
                  >
                    {/* Image */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 220, sm: 280, md: 300 } }}>
                      <CardMedia
                        component="img"
                        image={product.imageUrl ?? PLACEHOLDER_IMG}
                        alt={product.name}
                        sx={{ height: '100%', objectFit: 'cover', transition: 'transform 0.45s', ...(hoveredProduct === product.id && { transform: 'scale(1.08)' }) }}
                      />
                      {/* Low stock badge */}
                      {product.stock > 0 && product.stock <= 5 && (
                        <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#f59e0b', color: '#fff', px: 1.3, py: 0.4, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                          Low Stock
                        </Box>
                      )}
                      {/* Wishlist */}
                      <IconButton
                        size="small"
                        onClick={(e) => { e.preventDefault(); handleFavoriteClick(product); }}
                        sx={{
                          position: 'absolute', top: 10, right: 10,
                          bgcolor: '#fff', width: 36, height: 36,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                          opacity: hoveredProduct === product.id || isFavorite(product.id) ? 1 : 0,
                          transform: hoveredProduct === product.id || isFavorite(product.id) ? 'scale(1)' : 'scale(0.7)',
                          transition: 'opacity 0.22s, transform 0.22s',
                          '&:hover': { bgcolor: isFavorite(product.id) ? '#fee2e2' : ACCENT, color: isFavorite(product.id) ? ACCENT : '#fff' },
                          color: isFavorite(product.id) ? ACCENT : '#9ca3af',
                        }}
                      >
                        <FavoriteIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ pb: 0.5, pt: 2, px: 2.5 }}>
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {product.category.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 0.4 }}>
                        <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.92rem', flex: 1, mr: 1, lineHeight: 1.4 }}>
                          {product.name}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '1.05rem', flexShrink: 0 }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600, mt: 0.8 }}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ px: 2.5, pb: 2.5, pt: 1.5 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        fullWidth
                        disabled={product.stock === 0}
                        onClick={(e) => handleAddToCart(e, product)}
                        startIcon={<ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
                        sx={{
                          fontWeight: 700, textTransform: 'none', py: 1.15, fontSize: '0.85rem', borderRadius: '8px',
                          opacity: hoveredProduct === product.id ? 1 : 0,
                          transform: hoveredProduct === product.id ? 'translateY(0)' : 'translateY(8px)',
                          transition: 'opacity 0.22s, transform 0.22s',
                          boxShadow: '0 4px 12px rgba(247,68,78,0.35)',
                        }}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </Card>
                </Link>
              ))}
            </Box>
          ) : (
            /* List view */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {products.map((product) => (
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
                      transition: 'box-shadow 0.28s, border-color 0.28s',
                      '&:hover': { boxShadow: '0 8px 32px rgba(0,44,62,0.1)', borderColor: 'rgba(247,68,78,0.25)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <Box sx={{ position: 'relative', width: { xs: 130, sm: 200 }, height: { xs: 120, sm: 160 }, flexShrink: 0, overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          image={product.imageUrl ?? PLACEHOLDER_IMG}
                          alt={product.name}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', ...(hoveredProduct === product.id && { transform: 'scale(1.06)' }) }}
                        />
                        {product.stock > 0 && product.stock <= 5 && (
                          <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#f59e0b', color: '#fff', px: 1, py: 0.3, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            Low Stock
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, px: { xs: 2, sm: 3 }, py: 2 }}>
                        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {product.category.name}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: { xs: '0.95rem', sm: '1.1rem' }, mt: 0.4, mb: 0.8 }}>
                          {product.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7280', mb: 0.5 }} noWrap>
                          {product.description.slice(0, 100)}…
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Typography>
                      </Box>
                      <Box sx={{ px: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5, flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={product.stock === 0}
                          onClick={(e) => handleAddToCart(e, product)}
                          startIcon={<ShoppingCartIcon sx={{ fontSize: '0.9rem' }} />}
                          sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', borderRadius: '8px', px: 2, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(247,68,78,0.3)' }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.preventDefault(); handleFavoriteClick(product); }}
                          sx={{ color: isFavorite(product.id) ? ACCENT : '#d1d5db', '&:hover': { color: ACCENT } }}
                        >
                          <FavoriteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Link>
              ))}
            </Box>
          )}

          {/* ─── PAGINATION ─── */}
          {!loading && !showFavoritesOnly && meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 6 }}>
              <IconButton
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                sx={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', '&:not(:disabled):hover': { borderColor: ACCENT, color: ACCENT } }}
              >
                <ChevronLeftIcon />
              </IconButton>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <Typography key={`e-${idx}`} sx={{ color: '#9ca3af', px: 0.5 }}>…</Typography>
                  ) : (
                    <Button
                      key={p}
                      onClick={() => setPage(p as number)}
                      variant={page === p ? 'contained' : 'outlined'}
                      size="small"
                      sx={{
                        minWidth: 40, height: 40, borderRadius: '10px', fontWeight: 700,
                        ...(page === p
                          ? { bgcolor: ACCENT, borderColor: ACCENT, '&:hover': { bgcolor: '#e03038' } }
                          : { borderColor: '#e5e7eb', color: NAVY, '&:hover': { borderColor: ACCENT, color: ACCENT } }),
                      }}
                    >
                      {p}
                    </Button>
                  )
                )}

              <IconButton
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                sx={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', '&:not(:disabled):hover': { borderColor: ACCENT, color: ACCENT } }}
              >
                <ChevronRightIcon />
              </IconButton>
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

      <AuthModals
        mode={authModal}
        onClose={() => { setAuthModal(null); setPendingFavorite(null); }}
        onSwitch={(to) => setAuthModal(to)}
        onSuccess={handleAuthSuccess}
      />
    </ThemeProvider>
  );
}
