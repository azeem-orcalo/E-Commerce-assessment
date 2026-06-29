'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Alert,
  Skeleton,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { api, extractApiError } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY   = '#002c3e';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_LIFECYCLE: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_META: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  PENDING:    { label: 'Pending',    bg: '#fffbeb', color: '#f59e0b' },
  PROCESSING: { label: 'Processing', bg: '#eff6ff', color: '#3b82f6' },
  SHIPPED:    { label: 'Shipped',    bg: '#f5f3ff', color: '#8b5cf6' },
  DELIVERED:  { label: 'Delivered',  bg: '#f0fdf4', color: '#10b981' },
  CANCELLED:  { label: 'Cancelled',  bg: '#fef2f2', color: '#ef4444' },
};

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: string;
  product?: { name: string; imageUrl?: string | null };
}

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  user?: { firstName?: string; lastName?: string; email?: string; name?: string };
  items?: OrderItem[];
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: '0.72rem', minWidth: 80 }}
    />
  );
}

function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    await onStatusChange(order.id, newStatus);
    setUpdating(false);
  };

  const userName = order.user
    ? (order.user.name ?? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim())
    : 'Unknown Customer';

  return (
    <>
      <TableRow
        sx={{
          '&:hover': { bgcolor: 'rgba(0,44,62,0.025)' },
          transition: 'background 0.15s',
          ...(open && { bgcolor: 'rgba(0,44,62,0.02)' }),
        }}
      >
        {/* Expand toggle */}
        <TableCell sx={{ px: 1.5, py: 1.5, width: 40 }}>
          <Tooltip title={open ? 'Collapse' : 'View items'}>
            <IconButton size="small" onClick={() => setOpen((p) => !p)} sx={{ color: '#9ca3af' }}>
              {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* Order ID */}
        <TableCell sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6b7280', bgcolor: '#f3f4f6', px: 1, py: 0.3, borderRadius: '4px', display: 'inline-block' }}>
            #{order.id.slice(0, 8).toUpperCase()}
          </Typography>
        </TableCell>

        {/* Customer */}
        <TableCell sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: NAVY }}>{userName}</Typography>
          {order.user?.email && (
            <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.1 }}>{order.user.email}</Typography>
          )}
        </TableCell>

        {/* Date */}
        <TableCell sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', color: '#374151' }}>
            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af' }}>
            {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </TableCell>

        {/* Items count */}
        <TableCell sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>
            {order.items?.length ?? '—'} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
          </Typography>
        </TableCell>

        {/* Total */}
        <TableCell sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, color: ACCENT, fontSize: '0.92rem' }}>
            ${parseFloat(order.totalAmount).toFixed(2)}
          </Typography>
        </TableCell>

        {/* Status */}
        <TableCell sx={{ px: 2, py: 1.5 }}>
          <StatusBadge status={order.status} />
        </TableCell>

        {/* Status Update */}
        <TableCell sx={{ px: 2, py: 1.5, minWidth: 160 }}>
          <FormControl size="small" fullWidth disabled={updating}>
            <Select
              value={order.status}
              onChange={(e) => handleChange(e.target.value as OrderStatus)}
              sx={{
                fontSize: '0.82rem',
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.15)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: NAVY },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
                bgcolor: '#fff',
              }}
            >
              {STATUS_LIFECYCLE.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: '0.82rem', fontWeight: s === order.status ? 700 : 400 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_META[s]?.color ?? '#9ca3af', flexShrink: 0 }} />
                    {STATUS_META[s]?.label ?? s}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
      </TableRow>

      {/* Expandable order items */}
      <TableRow>
        <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ bgcolor: '#fafbfc', px: 5, py: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                Order Items
              </Typography>
              {(order.items ?? []).length === 0 ? (
                <Typography sx={{ fontSize: '0.82rem', color: '#9ca3af' }}>No item details available.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(order.items ?? []).map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.product?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: '#e5e7eb' }} />
                      )}
                      <Typography sx={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: NAVY }}>
                        {item.product?.name ?? item.productId.slice(0, 8)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>
                        × {item.quantity}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: ACCENT, minWidth: 70, textAlign: 'right' }}>
                        ${(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(0);
  const [rowsPerPage]           = useState(10);
  const [total, setTotal]       = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/orders', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          ...(statusFilter && { status: statusFilter }),
        },
      });
      const raw = data?.data ?? data;
      setOrders(Array.isArray(raw) ? raw : raw?.data ?? []);
      setTotal(data?.meta?.total ?? 0);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (e) {
      setError(extractApiError(e));
    }
  };

  return (
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: NAVY, lineHeight: 1 }}>
          Orders
        </Typography>
        <Typography sx={{ color: '#6b7280', mt: 0.5, fontSize: '0.9rem' }}>
          View and manage all customer orders. Update statuses through the lifecycle.
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6b7280' }}>
          <FilterListIcon fontSize="small" />
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Filter by status:</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={statusFilter}
            displayEmpty
            onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(0); }}
            sx={{
              fontSize: '0.82rem', borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.15)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
              bgcolor: '#fff',
            }}
          >
            <MenuItem value=""><em>All Statuses</em></MenuItem>
            {STATUS_LIFECYCLE.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.82rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_META[s]?.color }} />
                  {STATUS_META[s]?.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {statusFilter && (
          <Chip
            label={`Filtered: ${STATUS_META[statusFilter]?.label}`}
            size="small"
            onDelete={() => setStatusFilter('')}
            sx={{ bgcolor: STATUS_META[statusFilter]?.bg, color: STATUS_META[statusFilter]?.color, fontWeight: 700, fontSize: '0.72rem' }}
          />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                <TableCell sx={{ width: 40, px: 1.5 }} />
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Update Status'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.8, px: 2 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j} sx={{ px: 2 }}><Skeleton height={36} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : orders.map((order) => (
                  <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))
              }
              {!loading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                    {statusFilter ? `No ${STATUS_META[statusFilter]?.label.toLowerCase()} orders found.` : 'No orders yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPageOptions={[10]}
          sx={{ borderTop: '1px solid rgba(0,0,0,0.07)', '.MuiTablePagination-toolbar': { px: 2.5 } }}
        />
      </Paper>
    </Box>
  );
}
