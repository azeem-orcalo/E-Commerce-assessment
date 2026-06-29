'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { getStoredUser, setAccessToken, setStoredUser, api } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';
const SIDEBAR_W = 260;

const theme = createTheme({
  palette: {
    primary: { main: ACCENT, contrastText: '#fff' },
    secondary: { main: NAVY, contrastText: '#fff' },
  },
  typography: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Products', href: '/admin/products', icon: <InventoryIcon fontSize="small" /> },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingBagIcon fontSize="small" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || stored.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    setUser(stored);
    setChecking(false);
  }, [router]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* noop */ }
    setAccessToken(null);
    setStoredUser(null);
    router.replace('/');
  };

  if (checking) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f4f6f8' }}>
          <Typography sx={{ color: NAVY, fontWeight: 600 }}>Verifying access…</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>

        {/* ── Sidebar ── */}
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_W,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_W,
              boxSizing: 'border-box',
              bgcolor: NAVY,
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0,44,62,0.18)',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* Brand */}
          <Box sx={{ px: 3, py: 3.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.05em', color: '#fff', lineHeight: 1 }}>
                Bin<Box component="span" sx={{ color: ACCENT }}>Azeem</Box>
              </Typography>
            </Link>
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', mt: 0.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Admin Panel
            </Typography>
          </Box>

          {/* Nav */}
          <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    sx={{
                      borderRadius: '10px',
                      py: 1.2,
                      px: 2,
                      bgcolor: active ? 'rgba(247,68,78,0.18)' : 'transparent',
                      color: active ? ACCENT : 'rgba(255,255,255,0.65)',
                      '&:hover': {
                        bgcolor: active ? 'rgba(247,68,78,0.22)' : 'rgba(255,255,255,0.07)',
                        color: active ? ACCENT : '#fff',
                      },
                      transition: 'all 0.18s',
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: active ? 700 : 500 }}
                    />
                    {active && (
                      <Box sx={{ width: 4, height: 24, bgcolor: ACCENT, borderRadius: 2, ml: 1 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Storefront link */}
          <Box sx={{ px: 1.5, pb: 1 }}>
            <ListItemButton
              component={Link}
              href="/"
              sx={{
                borderRadius: '10px', py: 1.2, px: 2,
                color: 'rgba(255,255,255,0.45)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                <StorefrontIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="View Storefront" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500 }} />
            </ListItemButton>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 1.5 }} />

          {/* User strip */}
          <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: ACCENT, fontSize: '0.85rem', fontWeight: 700 }}>
              {user?.firstName?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography sx={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton onClick={handleLogout} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: ACCENT } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Drawer>

        {/* ── Main content ── */}
        <Box component="main" sx={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
