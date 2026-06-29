'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  Tooltip,
  InputAdornment,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Avatar,
  FormControl,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { adminUsersApi, AdminUser, extractApiError } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

function initials(u: AdminUser) {
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
}

function avatarColor(role: string) {
  return role === 'ADMIN' ? ACCENT : NAVY;
}

export default function CustomersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit role state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminUsersApi.list({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
      });
      setUsers(data.data);
      setTotal(data.meta.total);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Auto-dismiss success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const handleStartEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setPendingRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editingId) return;
    setSaving(true);
    setError('');
    try {
      const { data: updated } = await adminUsersApi.update(editingId, { role: pendingRole });
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, role: updated.role } : u)));
      setSuccess('Role updated successfully.');
      setEditingId(null);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await adminUsersApi.delete(deleteTarget.id);
      setSuccess(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: '12px',
            bgcolor: 'rgba(247,68,78,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <PeopleIcon sx={{ color: ACCENT, fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>
            Customers
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
            Manage user accounts and roles
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={`${total} total`}
            sx={{ bgcolor: 'rgba(0,44,62,0.07)', color: NAVY, fontWeight: 700, fontSize: '0.82rem' }}
          />
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>{success}</Alert>}

      {/* Search */}
      <TextField
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        size="small"
        fullWidth
        sx={{
          mb: 3, maxWidth: 400,
          '& .MuiOutlinedInput-root': { borderRadius: '10px' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,44,62,0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Customer', 'Email', 'Location', 'Orders', 'Role', 'Joined', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, borderBottom: '2px solid #e2e8f0' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton height={32} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}
                    >
                      {/* Avatar + name */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{ width: 36, height: 36, bgcolor: avatarColor(user.role), fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            {initials(user)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: NAVY }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>{user.email}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#475569' }}>{user.city || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user._count.orders}
                          size="small"
                          sx={{ bgcolor: 'rgba(0,44,62,0.07)', color: NAVY, fontWeight: 700, minWidth: 36 }}
                        />
                      </TableCell>

                      {/* Role — inline edit */}
                      <TableCell>
                        {editingId === user.id ? (
                          <FormControl size="small">
                            <Select
                              value={pendingRole}
                              onChange={(e) => setPendingRole(e.target.value as 'CUSTOMER' | 'ADMIN')}
                              sx={{ fontSize: '0.82rem', borderRadius: '8px', minWidth: 110 }}
                            >
                              <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
                              <MenuItem value="ADMIN">ADMIN</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              bgcolor: user.role === 'ADMIN' ? 'rgba(247,68,78,0.12)' : 'rgba(0,44,62,0.07)',
                              color: user.role === 'ADMIN' ? ACCENT : NAVY,
                            }}
                          />
                        )}
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.82rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {editingId === user.id ? (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={handleSaveRole}
                                disabled={saving}
                                sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#d93840' }, borderRadius: '8px', fontSize: '0.75rem', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 700 }}
                              >
                                {saving ? 'Saving…' : 'Save'}
                              </Button>
                              <Button
                                size="small"
                                onClick={() => setEditingId(null)}
                                sx={{ borderRadius: '8px', fontSize: '0.75rem', px: 1.5, py: 0.5, textTransform: 'none', color: '#64748b' }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Edit role">
                                <IconButton
                                  size="small"
                                  onClick={() => handleStartEdit(user)}
                                  sx={{ color: '#64748b', '&:hover': { color: NAVY, bgcolor: 'rgba(0,44,62,0.07)' } }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete user">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteTarget(user)}
                                  sx={{ color: '#64748b', '&:hover': { color: ACCENT, bgcolor: 'rgba(247,68,78,0.08)' } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

              {!loading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                    No customers found.
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{ borderTop: '1px solid #e2e8f0' }}
        />
      </Paper>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: NAVY }}>Delete user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>?
            This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{ borderRadius: '8px', textTransform: 'none', color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#d93840' }, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
