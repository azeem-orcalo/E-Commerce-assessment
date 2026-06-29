'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import { type AuthUser } from '@/components/AuthModals';
import { useCart } from '@/lib/CartContext';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

const NAV_ITEMS = [
  { label: 'Home',         href: '/' },
  { label: 'Products',     href: '/products' },
  { label: 'New Arrivals', href: '/products?sort=newest' },
  { label: 'Offers',       href: '/offers' },
  { label: 'About',        href: '/about' },
  { label: 'My Orders',    href: '/orders' },
];

interface NavbarProps {
  currentUser: AuthUser | null;
  onSignIn: () => void;
  onSignUp: () => void;
  onLogout: () => void;
}

export default function Navbar({ currentUser, onSignIn, onSignUp, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    const [path, query] = href.split('?');
    const pathMatches = path === '/' ? pathname === '/' : pathname.startsWith(path);
    if (!pathMatches) return false;
    if (query) {
      const params = new URLSearchParams(query);
      return [...params.entries()].every(([k, v]) => searchParams.get(k) === v);
    }
    return !NAV_ITEMS.some(({ href: h }) => {
      const [p, q] = h.split('?');
      if (!q) return false;
      const pMatches = p === '/' ? pathname === '/' : pathname.startsWith(p);
      if (!pMatches) return false;
      const params = new URLSearchParams(q);
      return [...params.entries()].every(([k, v]) => searchParams.get(k) === v);
    });
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.label !== 'My Orders' || !!currentUser,
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: NAVY, boxShadow: '0 2px 24px rgba(0,44,62,0.3)' }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1, justifyContent: 'space-between', minHeight: { xs: 64, md: 72 } }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: '0.06em', color: '#fff', cursor: 'pointer' }}
            >
              Bin<Box component="span" sx={{ color: ACCENT }}>Azeem</Box>
            </Typography>
          </Link>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {visibleItems.map((item) => (
              <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                <Button
                  sx={{
                    color: isActive(item.href) ? ACCENT : 'rgba(255,255,255,0.8)',
                    fontWeight: isActive(item.href) ? 700 : 500,
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

          {/* Right: cart + auth */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={openCart}
              aria-label="Open cart"
              sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: ACCENT } }}
            >
              <Badge
                badgeContent={itemCount > 0 ? itemCount : undefined}
                color="primary"
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: ACCENT,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    minWidth: 18,
                    height: 18,
                    padding: '0 4px',
                  },
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            {currentUser ? (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: ACCENT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1 }}>
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  {currentUser.firstName}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={onLogout}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'rgba(255,255,255,0.75)',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.88rem',
                    '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: 'transparent' },
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={onSignIn}
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
                  onClick={onSignUp}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    boxShadow: '0 4px 14px rgba(247,68,78,0.4)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(247,68,78,0.5)' },
                  }}
                >
                  Get Started
                </Button>
              </>
            )}

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
          <Box
            sx={{ display: { md: 'none' }, pb: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {visibleItems.map((item) => (
              <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                <Button
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    color: isActive(item.href) ? ACCENT : 'rgba(255,255,255,0.8)',
                    fontWeight: isActive(item.href) ? 700 : 400,
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.2,
                    '&:hover': { color: ACCENT },
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <Box sx={{ px: 2, pt: 1 }}>
              {currentUser ? (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', textTransform: 'none' }}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', textTransform: 'none' }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Container>
    </AppBar>
  );
}
