import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { getAssets, createAsset, updateAsset, deleteAsset } from '../utils/api';
import AppLayout from '../components/AppLayout';
import AssetCard from '../components/AssetCard';
import AssetForm from '../components/AssetForm';

const TYPE_LABELS = {
  home_system: 'Home Systems',
  appliance:   'Appliances',
  vehicle:     'Vehicles',
  electronics: 'Electronics',
  real_estate: 'Real Estate',
  investment:  'Investment Accounts',
  business:    'Business / Equipment',
  other:       'Other',
};

const TYPE_ORDER = ['home_system', 'appliance', 'vehicle', 'electronics', 'real_estate', 'investment', 'business', 'other'];

export default function AssetsPage() {
  const navigate = useNavigate();
  const [assets, setAssets]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState(0); // 0 = All

  const [formOpen, setFormOpen]         = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success', action: null });
  const openSnack  = (message, severity = 'success', action = null) => setSnack({ open: true, message, severity, action });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const handlePredictSuccess = () => {
    openSnack(
      'Prediction generated!',
      'success',
      <Button size="small" color="inherit" onClick={() => navigate('/predictions')}>View</Button>,
    );
  };

  const handlePredictError = (message) => {
    openSnack(message, 'error');
  };

  const currency = 'USD';

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch {
      openSnack('Failed to load assets.', 'error');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Derive which type tabs to show (only types with at least 1 asset)
  const presentTypes = TYPE_ORDER.filter((t) => assets.some((a) => a.type === t));
  const showTypeTabs = presentTypes.length >= 2;

  // Tab index 0 = All; index 1..N = presentTypes
  const tabTypes = showTypeTabs ? ['all', ...presentTypes] : ['all'];

  const displayedAssets =
    activeTab === 0 || !showTypeTabs
      ? assets
      : assets.filter((a) => a.type === tabTypes[activeTab]);

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (asset) => {
    setEditingAsset(asset);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingAsset(null);
  };

  const handleSave = async (payload) => {
    try {
      if (editingAsset) {
        const updated = await updateAsset(editingAsset._id, payload);
        setAssets((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
        openSnack('Asset updated.');
      } else {
        const created = await createAsset(payload);
        setAssets((prev) => [created, ...prev]);
        openSnack('Asset added.');
      }
      handleCloseForm();
    } catch (err) {
      openSnack(err?.response?.data?.message || 'Failed to save asset.', 'error');
      throw err; // keep dialog open on error
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset? This cannot be undone.')) return;
    try {
      await deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a._id !== id));
      openSnack('Asset deleted.');
    } catch {
      openSnack('Failed to delete asset.', 'error');
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h2">Asset Inventory</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track your home systems, appliances, vehicles, and more.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: '10px', flexShrink: 0 }}
          >
            Add Asset
          </Button>
        </Stack>

        {/* Loading bar */}
        {loading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

        {/* Type tabs (only when ≥2 types are present) */}
        {!loading && showTypeTabs && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab label={`All (${assets.length})`} />
            {presentTypes.map((t) => (
              <Tab key={t} label={`${TYPE_LABELS[t]} (${assets.filter((a) => a.type === t).length})`} />
            ))}
          </Tabs>
        )}

        {/* Content */}
        {!loading && displayedAssets.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '14px',
              textAlign: 'center',
              background: 'rgba(247, 249, 252, 0.9)',
              mt: showTypeTabs ? 0 : 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {assets.length === 0
                ? 'No assets yet. Add your first asset to get started.'
                : 'No assets in this category.'}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5} sx={{ mt: showTypeTabs ? 0 : 2 }}>
            {displayedAssets.map((asset) => (
              <AssetCard
                key={asset._id}
                asset={asset}
                currency={currency}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onPredictSuccess={handlePredictSuccess}
                onPredictError={handlePredictError}
              />
            ))}
          </Stack>
        )}

      </Container>

      {/* Add / Edit Dialog */}
      <AssetForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        asset={editingAsset}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={snack.action ? 6000 : 4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled" action={snack.action} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
