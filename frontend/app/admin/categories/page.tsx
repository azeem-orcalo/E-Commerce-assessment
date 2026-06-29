'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Skeleton,
  Tooltip,
  InputAdornment,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { categoriesApi, type Category, extractApiError } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY   = '#002c3e';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');

  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState<Category | null>(null);
  const [name, setName]               = useState('');
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await categoriesApi.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditTarget(null);
    setName('');
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setName(cat.name);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) { setFormError('Category name is required.'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await categoriesApi.update(editTarget.id, trimmed);
      } else {
        await categoriesApi.create(trimmed);
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (e) {
      setFormError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await categoriesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchCategories();
    } catch (e) {
      setDeleteError(extractApiError(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: NAVY, lineHeight: 1 }}>
            Categories
          </Typography>
          <Typography sx={{ color: '#6b7280', mt: 0.5, fontSize: '0.9rem' }}>
            Manage product categories used across the store.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            bgcolor: ACCENT, fontWeight: 700, px: 3, py: 1.2, borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(247,68,78,0.35)',
            '&:hover': { bgcolor: '#e03344', boxShadow: '0 6px 20px rgba(247,68,78,0.45)' },
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ ...fieldSx, width: { xs: '100%', sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                {['Category Name', 'ID', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.8, px: 2.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1, 2, 3].map((j) => (
                      <TableCell key={j} sx={{ px: 2.5 }}><Skeleton height={32} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : filtered.map((cat) => (
                  <TableRow
                    key={cat.id}
                    sx={{ '&:hover': { bgcolor: 'rgba(0,44,62,0.025)' }, transition: 'background 0.15s' }}
                  >
                    <TableCell sx={{ px: 2.5, py: 1.8 }}>
                      <Chip
                        label={cat.name}
                        size="small"
                        sx={{ bgcolor: 'rgba(0,44,62,0.08)', color: NAVY, fontWeight: 700, fontSize: '0.82rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 2.5, py: 1.8 }}>
                      <Typography sx={{ fontSize: '0.73rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                        {cat.id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: 2.5, py: 1.8 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit category">
                          <IconButton size="small" onClick={() => openEdit(cat)} sx={{ color: '#6b7280', '&:hover': { color: NAVY, bgcolor: 'rgba(0,44,62,0.07)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete category">
                          <IconButton size="small" onClick={() => setDeleteTarget(cat)} sx={{ color: '#6b7280', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              }
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'center', py: 6, color: '#9ca3af' }}>
                    {search ? 'No categories match your search.' : 'No categories yet. Add one above.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && (
          <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              {filtered.length} of {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: NAVY, pb: 1 }}>
          {editTarget ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{formError}</Alert>}
          <TextField
            label="Category Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            fullWidth
            size="small"
            autoFocus
            sx={fieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#6b7280', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: ACCENT, fontWeight: 700, px: 3, borderRadius: '8px', '&:hover': { bgcolor: '#e03344' } }}
          >
            {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444' }}>Delete Category?</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{deleteError}</Alert>
          )}
          <Typography sx={{ color: '#374151', fontSize: '0.9rem' }}>
            Are you sure you want to delete{' '}
            <Box component="span" sx={{ fontWeight: 700, color: NAVY }}>{deleteTarget?.name}</Box>?{' '}
            Categories with active products cannot be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => { setDeleteTarget(null); setDeleteError(null); }} sx={{ color: '#6b7280', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ bgcolor: '#ef4444', fontWeight: 700, px: 3, borderRadius: '8px', '&:hover': { bgcolor: '#dc2626' } }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
