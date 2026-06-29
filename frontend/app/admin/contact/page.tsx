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
  Chip,
  Alert,
  Skeleton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Collapse,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { contactApi, extractApiError, type ContactQuery, type ContactStatus } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

const STATUS_META: Record<ContactStatus, { label: string; bg: string; color: string }> = {
  UNREAD:   { label: 'Unread',   bg: '#fef2f2', color: '#ef4444' },
  READ:     { label: 'Read',     bg: '#eff6ff', color: '#3b82f6' },
  RESOLVED: { label: 'Resolved', bg: '#f0fdf4', color: '#10b981' },
};

function StatusChip({ status }: { status: ContactStatus }) {
  const meta = STATUS_META[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: '0.72rem', minWidth: 72 }}
    />
  );
}

function QueryRow({ query, onStatusChange }: { query: ContactQuery; onStatusChange: (id: string, status: ContactStatus) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const markAs = async (status: ContactStatus) => {
    setUpdating(true);
    await onStatusChange(query.id, status);
    setUpdating(false);
  };

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          bgcolor: query.status === 'UNREAD' ? 'rgba(247,68,78,0.04)' : 'inherit',
          '& td': { borderBottom: open ? 'none' : undefined },
        }}
        onClick={() => setOpen((p) => !p)}
      >
        <TableCell sx={{ width: 36, pl: 1 }}>
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontWeight: query.status === 'UNREAD' ? 700 : 500, fontSize: '0.88rem', color: NAVY }}>
            {query.name}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>{query.email}</Typography>
        </TableCell>
        <TableCell sx={{ maxWidth: 260 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: NAVY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {query.subject}
          </Typography>
        </TableCell>
        <TableCell>
          <StatusChip status={query.status} />
        </TableCell>
        <TableCell sx={{ color: '#6b7280', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          {new Date(query.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {query.status !== 'READ' && query.status !== 'RESOLVED' && (
              <Tooltip title="Mark as Read">
                <IconButton size="small" disabled={updating} onClick={() => markAs('READ')} sx={{ color: '#3b82f6' }}>
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {query.status !== 'RESOLVED' && (
              <Tooltip title="Mark as Resolved">
                <IconButton size="small" disabled={updating} onClick={() => markAs('RESOLVED')} sx={{ color: '#10b981' }}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>

      {/* Expanded message */}
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, bgcolor: '#f8fafc', borderBottom: open ? '1px solid #e5e7eb' : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 3 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Message
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: NAVY, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {query.message}
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                {query.status !== 'READ' && query.status !== 'RESOLVED' && (
                  <Button size="small" variant="outlined" disabled={updating} onClick={() => markAs('READ')}
                    sx={{ borderColor: '#3b82f6', color: '#3b82f6', borderRadius: 1.5, fontWeight: 600, fontSize: '0.78rem' }}>
                    Mark Read
                  </Button>
                )}
                {query.status !== 'RESOLVED' && (
                  <Button size="small" variant="outlined" disabled={updating} onClick={() => markAs('RESOLVED')}
                    sx={{ borderColor: '#10b981', color: '#10b981', borderRadius: 1.5, fontWeight: 600, fontSize: '0.78rem' }}>
                    Mark Resolved
                  </Button>
                )}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function AdminContactPage() {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'ALL'>('ALL');

  const load = useCallback(async () => {
    try {
      const res = await contactApi.list();
      setQueries(res.data);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: ContactStatus) => {
    try {
      await contactApi.updateStatus(id, status);
      setQueries((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    } catch {
      /* silently ignore; row stays as-is */
    }
  };

  const filtered = queries.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return q.name.toLowerCase().includes(s) || q.email.toLowerCase().includes(s) || q.subject.toLowerCase().includes(s);
    }
    return true;
  });

  const unreadCount = queries.filter((q) => q.status === 'UNREAD').length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: NAVY }}>
            Contact Queries
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              sx={{ bgcolor: ACCENT, color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
            />
          )}
        </Box>
        <Typography sx={{ color: '#6b7280', fontSize: '0.9rem' }}>
          Messages submitted via the Contact Us form.
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name, email, subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9ca3af', fontSize: 18 }} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContactStatus | 'ALL')}
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="UNREAD">Unread</MenuItem>
            <MenuItem value="READ">Read</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ width: 36 }} />
                <TableCell sx={{ fontWeight: 700, color: NAVY, fontSize: '0.8rem', py: 1.8 }}>Sender</TableCell>
                <TableCell sx={{ fontWeight: 700, color: NAVY, fontSize: '0.8rem' }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700, color: NAVY, fontSize: '0.8rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: NAVY, fontSize: '0.8rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: NAVY, fontSize: '0.8rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#9ca3af' }}>
                    {queries.length === 0 ? 'No contact queries yet.' : 'No results match your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((q) => (
                  <QueryRow key={q.id} query={q} onStatusChange={handleStatusChange} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && filtered.length > 0 && (
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #e5e7eb' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              Showing {filtered.length} of {queries.length} {queries.length === 1 ? 'query' : 'queries'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
