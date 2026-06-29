'use client';

import { useEffect, useState } from 'react';
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
  Chip,
  Avatar,
  Paper,
  Stack,
  CircularProgress,
  Divider,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Navbar from '@/components/Navbar';
import AuthModals, { type AuthUser } from '@/components/AuthModals';
import {
  ordersApi,
  authApi,
  setAccessToken,
  setStoredUser,
  getStoredUser,
  extractApiError,
  type Order,
} from '@/lib/api';
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
const PLACEHOLDER_IMG = 'https://placehold.co/80x80/f5f6f8/9ca3af?text=No+Image';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7' },
  PROCESSING: { label: 'Processing', color: '#1e40af', bg: '#dbeafe' },
  SHIPPED:    { label: 'Shipped',    color: '#5b21b6', bg: '#ede9fe' },
  DELIVERED:  { label: 'Delivered',  color: '#065f46', bg: '#d1fae5' },
  CANCELLED:  { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { refreshCart, resetCartState } = useCart();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/');
      return;
    }
    setCurrentUser(user);
    ordersApi
      .list()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredUser(null);
    resetCartState();
    setAccessToken(null);
    authApi.logout().catch(() => {});
    router.push('/');
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    setStoredUser(user);
    await refreshCart();
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
          minHeight: { xs: 340, md: 460 },
          pb: { xs: '60px', md: '90px' },
          display: 'flex',
          alignItems: 'center',
          clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1800&h=700&fit=crop&q=85"
          alt="My Orders"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(0,44,62,0.97) 0%, rgba(0,44,62,0.88) 45%, rgba(0,44,62,0.62) 75%, rgba(0,44,62,0.28) 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 9 } }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3.5 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.83rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  '&:hover': { color: ACCENT },
                }}
              >
                Home
              </Typography>
            </Link>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.83rem' }}>/</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem', fontWeight: 600 }}>
              My Orders
            </Typography>
          </Box>

          {/* Eyebrow */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 3, bgcolor: ACCENT, borderRadius: 2 }} />
            <Typography
              variant="overline"
              sx={{ color: ACCENT, fontWeight: 700, letterSpacing: '0.22em', fontSize: '0.78rem' }}
            >
              Order History
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            sx={{
              fontWeight: 900,
              color: '#fff',
              fontSize: { xs: '2.8rem', sm: '3.6rem', md: '5.2rem' },
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              mb: 2.5,
            }}
          >
            My<br />
            <Box component="span" sx={{ color: ACCENT }}>Orders</Box>
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.65)',
              maxWidth: 500,
              lineHeight: 1.85,
              fontSize: '1.02rem',
              mb: 4,
            }}
          >
            {currentUser ? `Welcome back, ${currentUser.firstName}! ` : ''}
            Track your purchases, check delivery status, and review your complete order history below.
          </Typography>

          {/* Stats — only shown once orders loaded */}
          {!loading && orders.length > 0 && (
            <Box sx={{ display: 'flex', gap: { xs: 4, md: 6 } }}>
              {[
                [String(orders.length), 'Total Orders'],
                [String(orders.filter((o) => o.status === 'DELIVERED').length), 'Delivered'],
                [
                  String(
                    orders.filter(
                      (o) =>
                        o.status === 'PENDING' ||
                        o.status === 'PROCESSING' ||
                        o.status === 'SHIPPED',
                    ).length,
                  ),
                  'In Progress',
                ],
              ].map(([num, label]) => (
                <Box key={label}>
                  <Typography
                    sx={{ fontWeight: 900, fontSize: '1.75rem', color: '#fff', lineHeight: 1 }}
                  >
                    {num}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                      mt: 0.4,
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* ─── ORDERS LIST ─── */}
      <Box sx={{ bgcolor: '#f8f9fb', py: { xs: 6, md: 9 }, minHeight: '45vh' }}>
        <Container maxWidth="xl">
          {loading ? (
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 14 }}
            >
              <CircularProgress sx={{ color: ACCENT }} size={48} />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography
                variant="h6"
                sx={{ color: '#ef4444', fontWeight: 700, mb: 2 }}
              >
                {error}
              </Typography>
              <Button
                variant="outlined"
                sx={{ borderColor: ACCENT, color: ACCENT }}
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Box>
          ) : orders.length === 0 ? (
            /* ── Empty state ── */
            <Box sx={{ textAlign: 'center', py: 14 }}>
              <Box
                sx={{
                  width: 104,
                  height: 104,
                  borderRadius: '50%',
                  bgcolor: 'rgba(247,68,78,0.09)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                }}
              >
                <ReceiptLongIcon sx={{ fontSize: 52, color: ACCENT }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: NAVY, mb: 1.5 }}>
                No orders yet
              </Typography>
              <Typography
                sx={{
                  color: '#6b7280',
                  mb: 5,
                  maxWidth: 380,
                  mx: 'auto',
                  lineHeight: 1.75,
                }}
              >
                Looks like you haven&apos;t placed any orders yet. Browse our collection and find
                something you love!
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
                    px: 6,
                    py: 1.6,
                    borderRadius: 2,
                    boxShadow: '0 6px 20px rgba(247,68,78,0.35)',
                  }}
                >
                  Start Shopping
                </Button>
              </Link>
            </Box>
          ) : (
            /* ── Orders stack ── */
            <Stack spacing={3}>
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const statusCfg =
                  STATUS_CONFIG[order.status] ?? {
                    label: order.status,
                    color: '#374151',
                    bg: '#f3f4f6',
                  };
                const previewItems = order.items.slice(0, 4);
                const moreCount = order.items.length - previewItems.length;

                return (
                  <Paper
                    key={order.id}
                    elevation={0}
                    sx={{
                      border: '1.5px solid rgba(0,0,0,0.07)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      bgcolor: '#fff',
                      transition: 'box-shadow 0.25s, border-color 0.25s',
                      '&:hover': {
                        boxShadow: '0 8px 32px rgba(0,44,62,0.1)',
                        borderColor: 'rgba(247,68,78,0.2)',
                      },
                    }}
                  >
                    {/* Header row — click to expand */}
                    <Box
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.id)
                      }
                      sx={{
                        px: { xs: 2.5, md: 3.5 },
                        py: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {/* Left: icon + order id + date */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: '10px',
                            bgcolor: 'rgba(247,68,78,0.09)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ReceiptLongIcon sx={{ color: ACCENT, fontSize: 22 }} />
                        </Box>
                        <Box>
                          <Typography
                            sx={{ fontWeight: 700, color: NAVY, fontSize: '0.96rem' }}
                          >
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: status + total + chevron */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Chip
                          label={statusCfg.label}
                          size="small"
                          sx={{
                            bgcolor: statusCfg.bg,
                            color: statusCfg.color,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: `1px solid ${statusCfg.color}33`,
                          }}
                        />

                        <Box
                          sx={{
                            textAlign: 'right',
                            display: { xs: 'none', sm: 'block' },
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                            {order.paymentMethod === 'COD'
                              ? 'Cash on Delivery'
                              : 'Paid by Card'}
                          </Typography>
                          <Typography
                            sx={{ fontWeight: 800, color: ACCENT, fontSize: '1.05rem' }}
                          >
                            £{Number(order.totalAmount).toFixed(2)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.25s',
                          }}
                        >
                          <ExpandMoreIcon sx={{ color: '#9ca3af' }} />
                        </Box>
                      </Box>
                    </Box>

                    {/* Thumbnails strip */}
                    <Box
                      sx={{
                        px: { xs: 2.5, md: 3.5 },
                        py: 2,
                        bgcolor: '#fafafa',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {previewItems.map((item) => (
                          <Avatar
                            key={item.id}
                            src={item.product.imageUrl ?? PLACEHOLDER_IMG}
                            alt={item.product.name}
                            variant="rounded"
                            sx={{
                              width: 48,
                              height: 48,
                              border: '2px solid #fff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.09)',
                            }}
                          />
                        ))}
                        {moreCount > 0 && (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '6px',
                              bgcolor: NAVY,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              sx={{ color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}
                            >
                              +{moreCount}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </Typography>

                      {/* Total for mobile */}
                      <Box sx={{ ml: 'auto', display: { xs: 'block', sm: 'none' } }}>
                        <Typography
                          sx={{ fontWeight: 800, color: ACCENT, fontSize: '1rem' }}
                        >
                          £{Number(order.totalAmount).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <Box
                        sx={{
                          px: { xs: 2.5, md: 3.5 },
                          py: 3,
                          bgcolor: '#fff',
                          borderTop: '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: NAVY, mb: 2.5 }}
                        >
                          Items Ordered
                        </Typography>

                        <Stack spacing={2}>
                          {order.items.map((item) => (
                            <Box
                              key={item.id}
                              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                            >
                              <Avatar
                                src={item.product.imageUrl ?? PLACEHOLDER_IMG}
                                alt={item.product.name}
                                variant="rounded"
                                sx={{ width: 60, height: 60, border: '1px solid #f0f0f0' }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: NAVY }}
                                  noWrap
                                >
                                  {item.product.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                  Qty: {item.quantity} · £
                                  {Number(item.priceAtPurchase).toFixed(2)} each
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}
                              >
                                £
                                {(
                                  Number(item.priceAtPurchase) * item.quantity
                                ).toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        {/* Footer: payment / shipping / total */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            flexWrap: 'wrap',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 5 }}>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: '#6b7280', display: 'block', mb: 0.3 }}
                              >
                                Payment
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color:
                                    order.paymentMethod === 'COD' ? '#d97706' : '#2563eb',
                                }}
                              >
                                {order.paymentMethod === 'COD'
                                  ? 'Cash on Delivery'
                                  : 'Paid by Card'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: '#6b7280', display: 'block', mb: 0.3 }}
                              >
                                Shipping
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: '#059669' }}
                              >
                                Free
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: '#6b7280', display: 'block', mb: 0.3 }}
                            >
                              Order Total
                            </Typography>
                            <Typography
                              sx={{ fontWeight: 900, fontSize: '1.3rem', color: ACCENT }}
                            >
                              £{Number(order.totalAmount).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Shipping status banner */}
                        {(order.status === 'SHIPPED' || order.status === 'PROCESSING') && (
                          <Box
                            sx={{
                              mt: 3,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: '#ede9fe',
                              border: '1px solid #c4b5fd',
                              display: 'flex',
                              gap: 1.5,
                              alignItems: 'center',
                            }}
                          >
                            <LocalShippingIcon sx={{ color: '#7c3aed', flexShrink: 0 }} />
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: '#5b21b6' }}
                              >
                                {order.status === 'SHIPPED'
                                  ? 'Your order is on its way!'
                                  : 'Your order is being prepared'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#5b21b6' }}>
                                {order.status === 'SHIPPED'
                                  ? 'Expected delivery within 2–3 business days.'
                                  : "We're getting your items ready for shipment."}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}

          {/* Continue shopping CTA */}
          {!loading && orders.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 7 }}>
              <Link href="/products" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: NAVY,
                    color: NAVY,
                    px: 7,
                    py: 1.8,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: NAVY,
                      color: '#fff',
                      borderColor: NAVY,
                      transform: 'scale(1.03)',
                    },
                  }}
                >
                  Continue Shopping
                </Button>
              </Link>
            </Box>
          )}
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
