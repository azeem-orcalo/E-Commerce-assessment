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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
  Tooltip,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import { api, ApiProduct, Category, extractApiError } from '@/lib/api';

const ACCENT = '#f7444e';
const NAVY   = '#002c3e';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUrl: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  imageUrl: '',
};

function FormField({
  label, name, value, onChange, multiline, rows, type, helperText,
}: {
  label: string;
  name: keyof ProductForm;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  rows?: number;
  type?: string;
  helperText?: string;
}) {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      size="small"
      multiline={multiline}
      rows={rows}
      type={type}
      helperText={helperText}
      sx={fieldSx}
    />
  );
}

export default function AdminProductsPage() {
  const [products, setProducts]   = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal]         = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiProduct | null>(null);
  const [form, setForm]             = useState<ProductForm>(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products', {
        params: { search: search || undefined, page: page + 1, limit: rowsPerPage },
      });
      const raw = data?.data ?? data;
      setProducts(Array.isArray(raw) ? raw : raw?.data ?? []);
      setTotal(data?.meta?.total ?? 0);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(Array.isArray(data) ? data : data?.data ?? []);
    }).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (product: ApiProduct) => {
    setEditTarget(product);
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      stock:       String(product.stock),
      categoryId:  product.categoryId,
      imageUrl:    product.imageUrl ?? '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.stock || !form.categoryId) {
      setFormError('Name, description, price, stock, and category are required.');
      return;
    }
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (isNaN(price) || price < 0) { setFormError('Invalid price.'); return; }
    if (isNaN(stock) || stock < 0) { setFormError('Invalid stock.'); return; }

    const payload: Record<string, unknown> = {
      name:        form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      categoryId:  form.categoryId,
      ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
    };

    setSaving(true);
    try {
      if (editTarget) {
        await api.patch(`/products/${editTarget.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (e) {
      setFormError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (e) {
      setError(extractApiError(e));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const stockColor = (s: number) => (s === 0 ? '#ef4444' : s < 5 ? '#f59e0b' : '#10b981');

  return (
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: NAVY, lineHeight: 1 }}>
            Products
          </Typography>
          <Typography sx={{ color: '#6b7280', mt: 0.5, fontSize: '0.9rem' }}>
            Manage your product catalogue, pricing, and inventory.
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
          Add Product
        </Button>
      </Box>

      {/* Search bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search products by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          size="small"
          sx={{ ...fieldSx, width: { xs: '100%', sm: 360 } }}
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
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.8, px: 2.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j} sx={{ px: 2.5 }}><Skeleton height={32} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{ '&:hover': { bgcolor: 'rgba(0,44,62,0.025)' }, transition: 'background 0.15s' }}
                  >
                    {/* Image */}
                    <TableCell sx={{ px: 2.5, py: 1.5 }}>
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                        />
                      ) : (
                        <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon fontSize="small" sx={{ color: '#d1d5db' }} />
                        </Box>
                      )}
                    </TableCell>

                    {/* Name */}
                    <TableCell sx={{ px: 2.5, py: 1.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: NAVY, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.2, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.description}
                      </Typography>
                    </TableCell>

                    {/* Category */}
                    <TableCell sx={{ px: 2.5, py: 1.5 }}>
                      <Chip
                        label={product.category?.name ?? '—'}
                        size="small"
                        sx={{ bgcolor: 'rgba(0,44,62,0.08)', color: NAVY, fontWeight: 600, fontSize: '0.72rem' }}
                      />
                    </TableCell>

                    {/* Price */}
                    <TableCell sx={{ px: 2.5, py: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, color: ACCENT, fontSize: '0.88rem' }}>
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* Stock */}
                    <TableCell sx={{ px: 2.5, py: 1.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: stockColor(product.stock) }}>
                        {product.stock}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ px: 2.5, py: 1.5 }}>
                      <Chip
                        label={product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Low Stock' : 'In Stock'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          bgcolor: product.stock === 0 ? '#fef2f2' : product.stock < 5 ? '#fffbeb' : '#f0fdf4',
                          color:   product.stock === 0 ? '#ef4444' : product.stock < 5 ? '#f59e0b' : '#16a34a',
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ px: 2.5, py: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit product">
                          <IconButton size="small" onClick={() => openEdit(product)} sx={{ color: '#6b7280', '&:hover': { color: NAVY, bgcolor: 'rgba(0,44,62,0.07)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete product">
                          <IconButton size="small" onClick={() => setDeleteTarget(product)} sx={{ color: '#6b7280', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              }
              {!loading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#9ca3af' }}>
                    No products found. Try a different search or add one.
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
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Per page:"
          sx={{ borderTop: '1px solid rgba(0,0,0,0.07)', '.MuiTablePagination-toolbar': { px: 2.5 } }}
        />
      </Paper>

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: NAVY, pb: 1 }}>
          {editTarget ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
          {formError && <Alert severity="error" sx={{ borderRadius: '8px' }}>{formError}</Alert>}

          <FormField label="Product Name *" name="name" value={form.name} onChange={handleFormChange} />
          <FormField label="Description *" name="description" value={form.description} onChange={handleFormChange} multiline rows={3} />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormField label="Price ($) *" name="price" value={form.price} onChange={handleFormChange} type="number" />
            <FormField label="Stock *" name="stock" value={form.stock} onChange={handleFormChange} type="number" />
          </Box>

          <FormControl size="small" fullWidth sx={fieldSx}>
            <InputLabel>Category *</InputLabel>
            <Select
              value={form.categoryId}
              label="Category *"
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              sx={{ borderRadius: '8px' }}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormField
            label="Image URL"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleFormChange}
            helperText="Paste a publicly accessible image URL"
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
            {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444' }}>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#374151', fontSize: '0.9rem' }}>
            Are you sure you want to delete{' '}
            <Box component="span" sx={{ fontWeight: 700, color: NAVY }}>{deleteTarget?.name}</Box>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#6b7280', fontWeight: 600 }}>
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
