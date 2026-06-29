'use client';

import { useCart } from '@/lib/CartContext';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';

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
const PLACEHOLDER_IMG = 'https://placehold.co/100x100/f5f6f8/9ca3af?text=?';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    itemCount,
    total,
    loading,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const handleBrowse = () => {
    closeCart();
    router.push('/products');
  };

  return (
    <ThemeProvider theme={theme}>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={closeCart}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 420 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            bgcolor: NAVY,
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShoppingBagIcon sx={{ color: ACCENT, fontSize: 22 }} />
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '0.02em',
              }}
            >
              Your Cart
            </Typography>
            {itemCount > 0 && (
              <Box
                sx={{
                  bgcolor: ACCENT,
                  color: '#fff',
                  borderRadius: '999px',
                  px: 1.2,
                  lineHeight: '22px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  minWidth: 22,
                  textAlign: 'center',
                }}
              >
                {itemCount}
              </Box>
            )}
          </Box>
          <IconButton
            onClick={closeCart}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                bgcolor: '#f5f6f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 40, color: '#d1d5db' }} />
            </Box>
            <Typography
              sx={{ fontWeight: 800, color: NAVY, fontSize: '1.1rem', mb: 1 }}
            >
              Your cart is empty
            </Typography>
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: '0.88rem',
                textAlign: 'center',
                mb: 4,
                lineHeight: 1.75,
                maxWidth: 280,
              }}
            >
              Add some products to get started with your shopping
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBrowse}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.3,
                borderRadius: '10px',
                boxShadow: '0 6px 18px rgba(247,68,78,0.38)',
              }}
            >
              Browse Products
            </Button>
          </Box>
        ) : (
          <>
            {/* ── Items list ── */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2.5,
                py: 1.5,
                position: 'relative',
              }}
            >
              {loading && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.65)',
                    zIndex: 10,
                    borderRadius: '4px',
                  }}
                >
                  <CircularProgress size={30} sx={{ color: ACCENT }} />
                </Box>
              )}

              {items.map((item, idx) => (
                <Box key={item.id}>
                  <Box sx={{ display: 'flex', gap: 2, py: 2.2 }}>
                    {/* Product image */}
                    <Box
                      sx={{
                        width: 88,
                        height: 88,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid rgba(0,0,0,0.07)',
                        bgcolor: '#f5f6f8',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.imageUrl ?? PLACEHOLDER_IMG}
                        alt={item.product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Box>

                    {/* Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 0.4,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: NAVY,
                            fontSize: '0.9rem',
                            lineHeight: 1.35,
                            mr: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.product.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeItem(item.id)}
                          disabled={loading}
                          sx={{
                            flexShrink: 0,
                            mt: -0.5,
                            mr: -0.5,
                            color: '#d1d5db',
                            '&:hover': { color: ACCENT, bgcolor: '#fff0f0' },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Box>

                      <Typography
                        sx={{ color: '#9ca3af', fontSize: '0.73rem', mb: 0.9 }}
                      >
                        {item.product.category.name}
                      </Typography>

                      {/* Variant badges */}
                      {(item.chosenColor || item.chosenSize) && (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.8,
                            mb: 1.2,
                            flexWrap: 'wrap',
                          }}
                        >
                          {item.chosenColor && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.6,
                                bgcolor: '#f5f6f8',
                                borderRadius: '5px',
                                px: 1,
                                py: 0.35,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: '#4b5563',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: item.chosenColor,
                                  border: '1px solid rgba(0,0,0,0.12)',
                                  flexShrink: 0,
                                }}
                              />
                              {item.chosenColor}
                            </Box>
                          )}
                          {item.chosenSize && (
                            <Box
                              sx={{
                                bgcolor: '#f5f6f8',
                                borderRadius: '5px',
                                px: 1,
                                py: 0.35,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: '#4b5563',
                              }}
                            >
                              {item.chosenSize}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Quantity + line price */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={loading}
                            sx={{
                              borderRadius: 0,
                              px: 0.9,
                              py: 0.6,
                              color: '#4b5563',
                              '&:hover': { bgcolor: '#f5f6f8', color: NAVY },
                              '&:disabled': { color: '#d1d5db' },
                            }}
                          >
                            <RemoveIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          <Typography
                            sx={{
                              minWidth: 28,
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              color: NAVY,
                              userSelect: 'none',
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={loading || item.quantity >= item.product.stock}
                            sx={{
                              borderRadius: 0,
                              px: 0.9,
                              py: 0.6,
                              color: '#4b5563',
                              '&:hover': { bgcolor: '#f5f6f8', color: NAVY },
                              '&:disabled': { color: '#d1d5db' },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: ACCENT,
                            fontSize: '1rem',
                          }}
                        >
                          ${(item.quantity * parseFloat(item.product.price)).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {idx < items.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                  )}
                </Box>
              ))}
            </Box>

            {/* ── Sticky footer ── */}
            <Box
              sx={{
                flexShrink: 0,
                borderTop: '1px solid rgba(0,0,0,0.08)',
                px: 2.5,
                pt: 2.5,
                pb: 3,
                bgcolor: '#fafafa',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.7,
                }}
              >
                <Typography sx={{ color: '#6b7280', fontSize: '0.88rem', fontWeight: 500 }}>
                  Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                </Typography>
                <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.9rem' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
              <Typography sx={{ color: '#9ca3af', fontSize: '0.78rem', mb: 2 }}>
                Shipping &amp; taxes calculated at checkout
              </Typography>

              <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)', mb: 2 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: '1.05rem' }}>
                  Total
                </Typography>
                <Typography sx={{ fontWeight: 900, color: ACCENT, fontSize: '1.4rem' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCheckout}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 1.7,
                  fontSize: '1rem',
                  borderRadius: '12px',
                  mb: 1.5,
                  boxShadow: '0 6px 20px rgba(247,68,78,0.42)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 10px 28px rgba(247,68,78,0.56)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Checkout
              </Button>

              <Button
                fullWidth
                onClick={closeCart}
                sx={{
                  textTransform: 'none',
                  color: '#6b7280',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  '&:hover': { color: NAVY },
                }}
              >
                Continue Shopping
              </Button>
            </Box>
          </>
        )}
      </Drawer>
    </ThemeProvider>
  );
}
