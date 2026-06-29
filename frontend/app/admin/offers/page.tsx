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
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { api, extractApiError } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY = '#002c3e';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercent: string | number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string;
}

interface OfferForm {
  title: string;
  description: string;
  discountPercent: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl: string;
}

const emptyForm: OfferForm = {
  title: '',
  description: '',
  discountPercent: '',
  startDate: '',
  endDate: '',
  isActive: true,
  imageUrl: '',
};

function toInputDate(iso: string) {
  return iso ? iso.slice(0, 10) : '';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function offerStatus(offer: Offer): { label: string; color: 'success' | 'warning' | 'error' | 'default' } {
  if (!offer.isActive) return { label: 'Inactive', color: 'default' };
  const now = Date.now();
  const start = new Date(offer.startDate).getTime();
  const end = new Date(offer.endDate).getTime();
  if (now < start) return { label: 'Upcoming', color: 'warning' };
  if (now > end)   return { label: 'Expired',  color: 'error' };
  return { label: 'Active', color: 'success' };
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/offers/all');
      const raw = data?.data ?? data;
      setOffers(Array.isArray(raw) ? raw : []);
    } catch {
      setError('Failed to load offers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description,
      discountPercent: String(offer.discountPercent),
      startDate: toInputDate(offer.startDate),
      endDate: toInputDate(offer.endDate),
      isActive: offer.isActive,
      imageUrl: offer.imageUrl ?? '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.discountPercent || !form.startDate || !form.endDate) {
      setFormError('Title, description, discount %, start date and end date are required.');
      return;
    }
    const pct = Number(form.discountPercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      setFormError('Discount percent must be between 1 and 100.');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setFormError('End date must be after start date.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      discountPercent: pct,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
      imageUrl: form.imageUrl.trim() || undefined,
    };

    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await api.patch(`/offers/${editingId}`, payload);
        setSuccess('Offer updated successfully.');
      } else {
        await api.post('/offers', payload);
        setSuccess('Offer created successfully.');
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      setFormError(extractApiError(e) || 'Failed to save offer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/offers/${deleteId}`);
      setSuccess('Offer deleted.');
      setDeleteId(null);
      load();
    } catch (e) {
      setError(extractApiError(e) || 'Failed to delete offer.');
      setDeleteId(null);
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
            Upcoming Offers
          </Typography>
          <Typography sx={{ color: '#6b7280', mt: 0.5, fontSize: '0.9rem' }}>
            Manage promotional offers and discount campaigns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            bgcolor: ACCENT, color: '#fff', fontWeight: 700, borderRadius: '10px', px: 2.5,
            '&:hover': { bgcolor: '#d63035' },
          }}
        >
          New Offer
        </Button>
      </Box>

      {error  && <Alert severity="error"   onClose={() => setError(null)}   sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f9fafb' }}>
                {['Title', 'Discount', 'Valid From', 'Valid To', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(0,0,0,0.06)', py: 1.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      {[1,2,3,4,5,6].map((j) => (
                        <TableCell key={j}><Skeleton height={28} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : offers.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                      <LocalOfferIcon sx={{ fontSize: 40, color: '#e5e7eb', mb: 1 }} />
                      <Typography sx={{ color: '#9ca3af', fontSize: '0.9rem' }}>No offers yet — create one!</Typography>
                    </TableCell>
                  </TableRow>
                )
                : offers.map((offer) => {
                  const { label, color } = offerStatus(offer);
                  return (
                    <TableRow key={offer.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: NAVY }}>{offer.title}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af', mt: 0.3 }} noWrap>{offer.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${Number(offer.discountPercent)}% OFF`}
                          size="small"
                          sx={{ bgcolor: `${ACCENT}12`, color: ACCENT, fontWeight: 800, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.83rem', color: '#374151' }}>{fmtDate(offer.startDate)}</TableCell>
                      <TableCell sx={{ fontSize: '0.83rem', color: '#374151' }}>{fmtDate(offer.endDate)}</TableCell>
                      <TableCell>
                        <Chip label={label} color={color} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(offer)} sx={{ color: NAVY, '&:hover': { color: ACCENT } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(offer.id)} sx={{ color: '#9ca3af', '&:hover': { color: ACCENT } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: NAVY, pb: 1 }}>
          {editingId ? 'Edit Offer' : 'Create Offer'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{formError}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
              size="small"
              sx={fieldSx}
              placeholder="e.g. Eid Special Sale"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              size="small"
              sx={fieldSx}
              placeholder="e.g. 20% off on every product this Eid!"
            />
            <TextField
              label="Discount Percent (%)"
              type="number"
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
              fullWidth
              size="small"
              sx={fieldSx}
              slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }}
              placeholder="e.g. 20"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                fullWidth
                size="small"
                sx={fieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                fullWidth
                size="small"
                sx={fieldSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <TextField
              label="Banner Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              fullWidth
              size="small"
              sx={fieldSx}
              placeholder="https://example.com/banner.jpg"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                />
              }
              label={<Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>Active</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#6b7280', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: ACCENT, fontWeight: 700, borderRadius: '8px', textTransform: 'none', '&:hover': { bgcolor: '#d63035' } }}
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Offer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '14px' } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: NAVY }}>Delete Offer</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Are you sure you want to delete this offer? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: '#6b7280', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ bgcolor: ACCENT, fontWeight: 700, borderRadius: '8px', textTransform: 'none', '&:hover': { bgcolor: '#d63035' } }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
