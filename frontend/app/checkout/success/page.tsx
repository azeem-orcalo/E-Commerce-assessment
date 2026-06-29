'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { ordersApi, type Order } from '@/lib/api';

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

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.replace('/');
      return;
    }
    ordersApi.getOne(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: ACCENT }} />
      </Box>
    );
  }

  if (!order) return null;

  const isCOD = order.paymentMethod === 'COD';
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
    0,
  );

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* Success Banner */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 72, color: '#22c55e', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, mb: 1 }}>
          Order Confirmed!
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {isCOD
            ? 'Your order has been placed. Pay on delivery.'
            : 'Payment received. Your order is being processed.'}
        </Typography>
      </Box>

      {/* Order Details Card */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        {/* Order Meta */}
        <Box sx={{ bgcolor: '#f9fafb', px: 3, py: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Order ID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: NAVY, fontFamily: 'monospace' }}>
                #{order.id.slice(0, 8).toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Status
              </Typography>
              <Chip
                label={order.status}
                color={STATUS_COLORS[order.status] ?? 'default'}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Payment
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: isCOD ? '#d97706' : '#2563eb' }}>
                {isCOD ? 'Cash on Delivery' : 'Paid by Card'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Items */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: NAVY, mb: 1.5 }}>
            Items Ordered
          </Typography>
          <Stack spacing={1.5}>
            {order.items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={item.product.imageUrl ?? PLACEHOLDER_IMG}
                  alt={item.product.name}
                  variant="rounded"
                  sx={{ width: 48, height: 48, border: '1px solid #f0f0f0' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: NAVY }} noWrap>
                    {item.product.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Qty: {item.quantity} · £{Number(item.priceAtPurchase).toFixed(2)} each
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}>
                  £{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Totals */}
        <Box sx={{ px: 3, py: 2 }}>
          <Stack spacing={0.75}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
              <Typography variant="body2">£{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Shipping</Typography>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>Free</Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 700, color: NAVY }}>Total</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: ACCENT }}>
              £{Number(order.totalAmount).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Info Banner for COD */}
      {isCOD && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #fde68a',
            bgcolor: '#fffbeb',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <LocalShippingIcon sx={{ color: '#d97706', mt: 0.25 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400e' }}>
              Cash on Delivery
            </Typography>
            <Typography variant="caption" sx={{ color: '#92400e' }}>
              Please have the exact amount ready when your order arrives. Our delivery partner will collect payment at your door.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Actions */}
      <Stack spacing={1.5}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<ReceiptLongIcon />}
          onClick={() => router.push('/orders')}
          sx={{
            bgcolor: NAVY,
            '&:hover': { bgcolor: '#001a24' },
            fontWeight: 700,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          View My Orders
        </Button>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={() => router.push('/products')}
          sx={{
            borderColor: ACCENT,
            color: ACCENT,
            '&:hover': { borderColor: '#d93540', bgcolor: '#fff5f5' },
            fontWeight: 700,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Continue Shopping
        </Button>
      </Stack>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
        {/* Header */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', py: 2 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h5"
              sx={{ color: ACCENT, fontWeight: 800, letterSpacing: '-0.5px', textAlign: 'center' }}
            >
              BOLT
            </Typography>
          </Container>
        </Box>

        <Suspense
          fallback={
            <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: ACCENT }} />
            </Box>
          }
        >
          <SuccessContent />
        </Suspense>
      </Box>
    </ThemeProvider>
  );
}
