'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Skeleton,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { suggestionsApi, type ApiProduct } from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import { useFavorites } from '@/lib/useFavorites';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';
const PLACEHOLDER_IMG = 'https://placehold.co/600x700/f5f6f8/9ca3af?text=No+Image';

interface Props {
  /** Pass the logged-in user's id to fetch personalised suggestions.
   *  Pass null/undefined to show public bestsellers instead. */
  userId?: string | null;
  /** Product id to exclude (current product on detail page). */
  excludeId?: string;
  /** Override section title. */
  title?: string;
  /** Override section subtitle. */
  subtitle?: string;
  /** Callback when user must log in to add to cart / favourite. */
  onLoginRequired?: () => void;
}

export default function SuggestionsRow({
  userId,
  excludeId,
  title,
  subtitle,
  onLoginRequired,
}: Props) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { addItem, openCart } = useCart();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const sectionTitle = title ?? (userId ? 'Recommended for You' : 'Popular Right Now');
  const sectionSub = subtitle ?? (userId
    ? 'Based on your purchase history'
    : 'Top picks from our store');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = userId
        ? await suggestionsApi.forUser(10)
        : await suggestionsApi.popular(10);
      const items = (res.data as ApiProduct[]).filter(
        (p) => !excludeId || p.id !== excludeId,
      ).slice(0, 8);
      setProducts(items);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [userId, excludeId]);

  useEffect(() => { load(); }, [load]);

  const handleAddToCart = async (e: React.MouseEvent, product: ApiProduct) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) { onLoginRequired?.(); return; }
    const result = await addItem({ productId: product.id, quantity: 1 });
    if (result === 'success') openCart();
  };

  const handleFavorite = (e: React.MouseEvent, product: ApiProduct) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) { onLoginRequired?.(); return; }
    toggleFavorite(product);
  };

  // Don't render if nothing to show after loading
  if (!loading && products.length === 0) return null;

  return (
    <Box sx={{ bgcolor: '#f8f9fb', py: { xs: 8, md: 10 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 } }}>

        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 28, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            <Typography
              variant="overline"
              sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.75rem' }}
            >
              {sectionSub}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 900,
              color: NAVY,
              fontSize: { xs: '1.6rem', md: '2.2rem' },
              letterSpacing: '-0.02em',
            }}
          >
            {sectionTitle}
          </Typography>
        </Box>

        {/* Cards — horizontal scroll on mobile, grid on md+ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, md: 3 },
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton variant="rectangular" height={260} sx={{ borderRadius: '12px', mb: 1 }} />
                  <Skeleton width="70%" height={18} sx={{ mb: 0.5 }} />
                  <Skeleton width="40%" height={18} />
                </Box>
              ))
            : products.map((product) => {
                const fav = isFavorite(product.id);
                const hovered = hoveredId === product.id;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      elevation={0}
                      onMouseEnter={() => setHoveredId(product.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      sx={{
                        border: '1.5px solid rgba(0,0,0,0.07)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.28s, box-shadow 0.28s, border-color 0.28s',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 16px 40px rgba(0,44,62,0.12)',
                          borderColor: 'rgba(247,68,78,0.28)',
                        },
                      }}
                    >
                      {/* Image */}
                      <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 200, sm: 250 } }}>
                        <CardMedia
                          component="img"
                          image={product.imageUrl ?? PLACEHOLDER_IMG}
                          alt={product.name}
                          sx={{
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.45s',
                            ...(hovered && { transform: 'scale(1.07)' }),
                          }}
                        />
                        {/* Category badge */}
                        <Box
                          sx={{
                            position: 'absolute', top: 10, right: 10,
                            bgcolor: NAVY, color: '#fff',
                            px: 1.2, py: 0.3,
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {product.category.name}
                        </Box>
                        {/* Favourite */}
                        <IconButton
                          size="small"
                          aria-label={fav ? 'Remove from wishlist' : 'Add to wishlist'}
                          onClick={(e) => handleFavorite(e, product)}
                          sx={{
                            position: 'absolute', top: 8, left: 8,
                            bgcolor: fav ? ACCENT : '#fff',
                            color: fav ? '#fff' : '#374151',
                            width: 32, height: 32,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            opacity: fav || hovered ? 1 : 0,
                            transform: fav || hovered ? 'scale(1)' : 'scale(0.7)',
                            transition: 'opacity 0.2s, transform 0.2s, background-color 0.18s',
                            '&:hover': { bgcolor: ACCENT, color: '#fff' },
                          }}
                        >
                          {fav
                            ? <FavoriteIcon sx={{ fontSize: 15 }} />
                            : <FavoriteBorderIcon sx={{ fontSize: 15 }} />}
                        </IconButton>
                      </Box>

                      {/* Text */}
                      <CardContent sx={{ pb: 0.5, pt: 1.8, px: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.67rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                        >
                          {product.category.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                          <Typography
                            sx={{
                              fontWeight: 700, color: '#1a1a2e', fontSize: '0.88rem',
                              flex: 1, mr: 1,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '0.98rem', flexShrink: 0 }}>
                            ${parseFloat(product.price).toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600, mt: 0.7 }}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Typography>
                      </CardContent>

                      {/* Add to cart — fades up on hover */}
                      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          disabled={product.stock === 0}
                          onClick={(e) => handleAddToCart(e, product)}
                          startIcon={<ShoppingCartIcon sx={{ fontSize: '0.9rem' }} />}
                          sx={{
                            fontWeight: 700,
                            textTransform: 'none',
                            py: 1,
                            fontSize: '0.82rem',
                            borderRadius: '6px',
                            opacity: hovered ? 1 : 0,
                            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                            transition: 'opacity 0.2s, transform 0.2s',
                            boxShadow: '0 4px 12px rgba(247,68,78,0.32)',
                          }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Link>
                );
              })}
        </Box>

        {/* View all link */}
        {!loading && products.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: NAVY,
                  color: NAVY,
                  px: 5,
                  py: 1.4,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': { bgcolor: NAVY, color: '#fff', borderColor: NAVY },
                }}
              >
                Browse All Products
              </Button>
            </Link>
          </Box>
        )}
      </Box>
    </Box>
  );
}
