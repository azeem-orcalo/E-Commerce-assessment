'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  ordersApi,
  cartApi,
  offersApi,
  extractApiError,
  getStoredUser,
  type CartItem,
  type Offer,
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

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: NAVY,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: ACCENT },
  },
};

// ── Inner form (needs Stripe context) ──────────────────────────────────────────
function CheckoutForm({
  items,
  cartTotal,
  activeOffer,
  onSuccess,
}: {
  items: CartItem[];
  cartTotal: number;
  activeOffer: Offer | null;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetCartState } = useCart();

  const discountPercent = activeOffer ? Number(activeOffer.discountPercent) : 0;
  const discountAmount = activeOffer
    ? parseFloat((cartTotal * discountPercent / 100).toFixed(2))
    : 0;
  const grandTotal = activeOffer
    ? parseFloat((cartTotal - discountAmount).toFixed(2))
    : cartTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { data } = await ordersApi.checkout({ paymentMethod });

      if (paymentMethod === 'CARD') {
        // Mock mode: backend returned a placeholder secret — no real Stripe call needed.
        if (data.clientSecret !== 'mock_client_secret') {
          if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please try again.');
            setSubmitting(false);
            return;
          }
          if (!data.clientSecret) {
            setError('No client secret returned from server.');
            setSubmitting(false);
            return;
          }

          const cardElement = elements.getElement(CardElement);
          if (!cardElement) {
            setError('Card element not found.');
            setSubmitting(false);
            return;
          }

          const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: { card: cardElement },
          });

          if (stripeError) {
            setError(stripeError.message ?? 'Payment failed. Please try again.');
            setSubmitting(false);
            return;
          }
        }
      }

      resetCartState();
      onSuccess(data.orderId);
    } catch (err) {
      setError(extractApiError(err));
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 380px' }, gap: 3 }}>
        {/* ── Left: Payment Method ── */}
        <Box>
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: NAVY, mb: 2 }}>
              Payment Method
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <FormLabel sx={{ display: 'none' }}>Payment Method</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'CARD')}
              >
                {/* COD Option */}
                <Paper
                  elevation={0}
                  sx={{
                    border: `2px solid ${paymentMethod === 'COD' ? ACCENT : '#e5e7eb'}`,
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: ACCENT },
                  }}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <FormControlLabel
                    value="COD"
                    control={<Radio sx={{ color: ACCENT, '&.Mui-checked': { color: ACCENT } }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocalShippingIcon sx={{ color: paymentMethod === 'COD' ? ACCENT : '#9ca3af' }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: NAVY }}>
                            Cash on Delivery
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Pay when your order arrives
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>

                {/* CARD Option */}
                <Paper
                  elevation={0}
                  sx={{
                    border: `2px solid ${paymentMethod === 'CARD' ? ACCENT : '#e5e7eb'}`,
                    borderRadius: 2,
                    p: 2,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: ACCENT },
                  }}
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <FormControlLabel
                    value="CARD"
                    control={<Radio sx={{ color: ACCENT, '&.Mui-checked': { color: ACCENT } }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CreditCardIcon sx={{ color: paymentMethod === 'CARD' ? ACCENT : '#9ca3af' }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: NAVY }}>
                            Pay with Card
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Secure payment via Stripe
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />

                  {paymentMethod === 'CARD' && (
                    <Box
                      sx={{
                        mt: 2,
                        ml: 4.5,
                        p: 2,
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        bgcolor: '#fafafa',
                      }}
                    >
                      {stripe ? (
                        <>
                          <CardElement options={CARD_ELEMENT_OPTIONS} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
                            <LockIcon sx={{ fontSize: 13, color: '#6b7280' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Your card details are encrypted and processed securely by Stripe
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LockIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: NAVY, display: 'block' }}>
                              Test Mode — No real charge will be made
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Card payment is simulated for testing purposes
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </RadioGroup>
            </FormControl>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* ── Right: Order Summary ── */}
        <Box>
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: NAVY, mb: 2 }}>
              Order Summary
            </Typography>

            {/* Active offer banner */}
            {activeOffer && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  mb: 2,
                }}
              >
                <LocalOfferIcon sx={{ fontSize: 16, color: '#ea580c' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#c2410c', display: 'block' }}>
                    {activeOffer.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9a3412' }}>
                    {discountPercent}% off applied automatically
                  </Typography>
                </Box>
                <Chip
                  label={`-${discountPercent}%`}
                  size="small"
                  sx={{ bgcolor: '#ea580c', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}
                />
              </Box>
            )}

            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={item.product.imageUrl ?? PLACEHOLDER_IMG}
                    alt={item.product.name}
                    variant="rounded"
                    sx={{ width: 52, height: 52, border: '1px solid #f0f0f0' }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: NAVY }} noWrap>
                      {item.product.name}
                    </Typography>
                    {item.chosenSize && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Size: {item.chosenSize}
                        {item.chosenColor ? ` · ${item.chosenColor}` : ''}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: NAVY, whiteSpace: 'nowrap' }}>
                    £{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    // strike through original price when a discount is active
                    textDecoration: activeOffer ? 'line-through' : 'none',
                    color: activeOffer ? 'text.secondary' : 'inherit',
                  }}
                >
                  £{cartTotal.toFixed(2)}
                </Typography>
              </Box>

              {activeOffer && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>
                    Discount ({discountPercent}% off)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                    -£{discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Shipping</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>Free</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: NAVY }}>Total</Typography>
                {activeOffer && (
                  <Typography variant="caption" sx={{ color: '#16a34a' }}>
                    You save £{discountAmount.toFixed(2)}!
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: ACCENT }}>
                  £{grandTotal.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              sx={{
                bgcolor: ACCENT,
                '&:hover': { bgcolor: '#d93540' },
                fontWeight: 700,
                borderRadius: 2,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              {submitting ? (
                <CircularProgress size={22} sx={{ color: '#fff' }} />
              ) : paymentMethod === 'CARD' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon sx={{ fontSize: 18 }} />
                  Pay £{grandTotal.toFixed(2)}
                </Box>
              ) : (
                `Place Order · £${grandTotal.toFixed(2)}`
              )}
            </Button>

            {paymentMethod === 'COD' && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 1 }}
              >
                You&apos;ll pay when your order is delivered
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

// ── Page wrapper ───────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/');
      return;
    }

    Promise.all([
      cartApi.get(),
      offersApi.active().catch(() => ({ data: [] as Offer[] })),
    ])
      .then(([cartRes, offersRes]) => {
        const cartItems = cartRes.data.items ?? [];
        setItems(cartItems);
        const total = cartItems.reduce(
          (sum, item) => sum + item.quantity * parseFloat(item.product.price),
          0,
        );
        setCartTotal(total);

        const offers: Offer[] = Array.isArray(offersRes.data) ? offersRes.data : [];
        setActiveOffer(offers.length > 0 ? offers[0] : null);
      })
      .catch(() => {
        router.replace('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSuccess = (orderId: string) => {
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (items.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" sx={{ color: NAVY, fontWeight: 700 }}>Your cart is empty</Typography>
          <Button
            variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#d93540' }, borderRadius: 2, textTransform: 'none' }}
            onClick={() => router.push('/products')}
          >
            Continue Shopping
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  const discountPercent = activeOffer ? Number(activeOffer.discountPercent) : 0;
  const discountAmount = activeOffer
    ? parseFloat((cartTotal * discountPercent / 100).toFixed(2))
    : 0;
  const grandTotal = activeOffer
    ? parseFloat((cartTotal - discountAmount).toFixed(2))
    : cartTotal;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
        {/* Header */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', py: 2 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant="h5"
                sx={{ color: ACCENT, cursor: 'pointer', fontWeight: 800, letterSpacing: '-0.5px' }}
                onClick={() => router.push('/')}
              >
                BOLT
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Secure Checkout
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, mb: 1 }}>
            Checkout
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {items.length} item{items.length !== 1 ? 's' : ''} · £{grandTotal.toFixed(2)}
            {activeOffer && (
              <Typography component="span" variant="body2" sx={{ color: '#16a34a', ml: 0.5 }}>
                (after {discountPercent}% sale discount)
              </Typography>
            )}
          </Typography>

          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm items={items} cartTotal={cartTotal} activeOffer={activeOffer} onSuccess={handleSuccess} />
            </Elements>
          ) : (
            <CheckoutForm items={items} cartTotal={cartTotal} activeOffer={activeOffer} onSuccess={handleSuccess} />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
