'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f59e0b',
  PROCESSING: '#3b82f6',
  SHIPPED:    '#8b5cf6',
  DELIVERED:  '#10b981',
  CANCELLED:  '#ef4444',
};

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeStock: number;
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; imageUrl: string | null; description: string; price: number; unitsSold: number }[];
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  loading: boolean;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 200,
        border: '1.5px solid rgba(0,0,0,0.07)',
        borderRadius: '16px',
        bgcolor: '#fff',
        overflow: 'visible',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 36px rgba(0,44,62,0.1)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </Box>
          <Chip label="+Live" size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700 }} />
        </Box>
        {loading ? (
          <>
            <Skeleton width="60%" height={36} />
            <Skeleton width="40%" height={20} sx={{ mt: 0.5 }} />
          </>
        ) : (
          <>
            <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: NAVY, lineHeight: 1 }}>{value}</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#6b7280', mt: 0.6, fontWeight: 500 }}>{label}</Typography>
            {sub && <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af', mt: 0.3 }}>{sub}</Typography>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', px: 2, py: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: NAVY }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: ACCENT, fontWeight: 600 }}>{payload[0].value} orders</Typography>
      </Box>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/dashboard/stats');
        const raw = data?.data ?? data;
        setStats({
          totalRevenue:  raw.totalRevenue   ?? raw.totalSales   ?? 0,
          totalOrders:   raw.totalOrders    ?? 0,
          activeStock:   raw.activeStock    ?? raw.totalProducts ?? 0,
          ordersByStatus: raw.ordersByStatus ?? raw.ordersCountByStatus ?? [],
          topProducts:   raw.topProducts    ?? [],
        });
      } catch {
        setError('Failed to load dashboard stats. Make sure the backend is running.');
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          activeStock: 0,
          ordersByStatus: [
            { status: 'PENDING', count: 0 },
            { status: 'PROCESSING', count: 0 },
            { status: 'SHIPPED', count: 0 },
            { status: 'DELIVERED', count: 0 },
            { status: 'CANCELLED', count: 0 },
          ],
          topProducts: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pieData = (stats?.ordersByStatus ?? []).filter((s) => s.count > 0);
  const barData = stats?.ordersByStatus ?? [];

  return (
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: NAVY, lineHeight: 1 }}>
          Dashboard
        </Typography>
        <Typography sx={{ color: '#6b7280', mt: 0.5, fontSize: '0.9rem' }}>
          Welcome back — here's what's happening in your store today.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>
      )}

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mb: 4 }}>
        <StatCard
          loading={loading}
          icon={<AttachMoneyIcon />}
          label="Total Sales Revenue"
          value={`$${Number(stats?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="All completed orders"
          color={ACCENT}
        />
        <StatCard
          loading={loading}
          icon={<ShoppingBagIcon />}
          label="Total Orders"
          value={String(stats?.totalOrders ?? 0)}
          sub="Across all statuses"
          color="#3b82f6"
        />
        <StatCard
          loading={loading}
          icon={<InventoryIcon />}
          label="Active Products"
          value={String(stats?.activeStock ?? 0)}
          sub="In catalogue"
          color="#10b981"
        />
      </Box>

      {/* Charts row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 3, mb: 4 }}>

        {/* Bar chart */}
        <Card elevation={0} sx={{ border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '16px', bgcolor: '#fff' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: NAVY }}>Orders by Status</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', mt: 0.3 }}>Distribution across the order lifecycle</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981' }}>
                <TrendingUpIcon fontSize="small" />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>Live</Typography>
              </Box>
            </Box>

            {loading ? (
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '8px' }} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
                    tickFormatter={(v) => v.charAt(0) + v.slice(1).toLowerCase()}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,44,62,0.04)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
                    {barData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? ACCENT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card elevation={0} sx={{ border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '16px', bgcolor: '#fff' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: NAVY, mb: 0.5 }}>Status Breakdown</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', mb: 3 }}>Proportional view</Typography>

            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
            ) : pieData.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, color: '#d1d5db' }}>
                <Typography sx={{ fontSize: '0.85rem' }}>No order data yet</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="count"
                    nameKey="status"
                    paddingAngle={3}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? ACCENT} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name: string) => [val, name.charAt(0) + name.slice(1).toLowerCase()]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => value.charAt(0) + value.slice(1).toLowerCase()}
                    wrapperStyle={{ fontSize: '0.78rem', paddingTop: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Top Products */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: NAVY, mb: 0.5 }}>Top Selling Products</Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', mb: 3 }}>Ranked by total units sold</Typography>

        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2.5 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} elevation={0} sx={{ border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <Skeleton variant="rectangular" sx={{ width: '100%', height: 160, display: 'block' }} />
                <CardContent sx={{ p: 2 }}>
                  <Skeleton width="80%" height={20} />
                  <Skeleton width="60%" height={16} sx={{ mt: 0.5 }} />
                  <Skeleton width="40%" height={16} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (stats?.topProducts ?? []).length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: '#d1d5db', border: '1.5px dashed rgba(0,0,0,0.1)', borderRadius: '16px' }}>
            <Typography sx={{ fontSize: '0.85rem' }}>No sales data yet</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2.5 }}>
            {(stats?.topProducts ?? []).slice(0, 5).map((p, i) => (
              <Card
                key={p.name}
                elevation={0}
                sx={{
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  borderRadius: '16px',
                  bgcolor: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 36px rgba(0,44,62,0.1)' },
                }}
              >
                {/* Rank badge */}
                <Box sx={{
                  position: 'absolute', top: 10, left: 10, zIndex: 1,
                  width: 28, height: 28, borderRadius: '50%',
                  bgcolor: i === 0 ? ACCENT : NAVY,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff' }}>#{i + 1}</Typography>
                </Box>

                {/* Image container — fixed height, full card width */}
                <Box sx={{ width: '100%', height: 160, overflow: 'hidden', flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={p.imageUrl || `https://placehold.co/400x160/f3f4f6/9ca3af?text=${encodeURIComponent(p.name)}`}
                    alt={p.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>

                <CardContent sx={{ p: 2, pb: '12px !important', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: NAVY, lineHeight: 1.3, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4, mb: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: ACCENT }}>
                      ${p.price.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${p.unitsSold} sold`}
                      size="small"
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        height: 22,
                        bgcolor: i === 0 ? `${ACCENT}18` : 'rgba(0,44,62,0.08)',
                        color: i === 0 ? ACCENT : NAVY,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
