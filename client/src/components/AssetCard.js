import React, { useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from '../utils/money';
import { predictions } from '../utils/api';

const TYPE_LABELS = {
  home_system: 'Home System',
  appliance:   'Appliance',
  vehicle:     'Vehicle',
  electronics: 'Electronics',
  real_estate: 'Real Estate',
  investment:  'Investment Account',
  business:    'Business / Equipment',
  other:       'Other',
};

const CONDITION_COLORS = {
  excellent: 'success',
  good:      'info',
  fair:      'warning',
  poor:      'error',
};

function WarrantyLine({ warrantyExpiryDate, warrantyLengthYears, theme }) {
  const hasExpiry = Boolean(warrantyExpiryDate);
  const hasLength = warrantyLengthYears != null;

  if (!hasExpiry && !hasLength) return null;

  let expiryColor = 'text.secondary';
  let expiryLabel = null;

  if (hasExpiry) {
    const expiry = new Date(warrantyExpiryDate);
    const now    = new Date();
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      expiryColor = theme.palette.error.main;
      expiryLabel = `Expired ${expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
    } else if (daysLeft <= 90) {
      expiryColor = theme.palette.warning.main;
      expiryLabel = `Expires ${expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} (${daysLeft}d)`;
    } else {
      expiryLabel = `Expires ${expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
    }
  }

  return (
    <Box sx={{ mt: 0.5 }}>
      <Typography variant="caption" color="text.secondary" component="span">
        Warranty:{' '}
      </Typography>
      {hasLength && (
        <Typography variant="caption" color="text.secondary" component="span">
          {warrantyLengthYears} yr{warrantyLengthYears !== 1 ? 's' : ''}
          {hasExpiry ? ' · ' : ''}
        </Typography>
      )}
      {expiryLabel && (
        <Typography variant="caption" sx={{ color: expiryColor }} component="span">
          {expiryLabel}
        </Typography>
      )}
    </Box>
  );
}

const AssetCard = ({ asset, currency = 'USD', onEdit, onDelete, onPredictSuccess, onPredictError }) => {
  const theme = useTheme();
  const [predicting, setPredicting] = useState(false);

  const handlePredict = async () => {
    setPredicting(true);
    try {
      await predictions.generateForAsset(asset._id);
      if (onPredictSuccess) onPredictSuccess();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to generate prediction.';
      if (onPredictError) onPredictError(message);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '14px',
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Name + type chip row */}
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {asset.name}
            </Typography>
            <Chip
              label={TYPE_LABELS[asset.type] || asset.type}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ flexShrink: 0 }}
            />
            {asset.condition && (
              <Chip
                label={asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                size="small"
                color={CONDITION_COLORS[asset.condition] || 'default'}
                sx={{ flexShrink: 0 }}
              />
            )}
          </Stack>

          {/* Brand */}
          {asset.brand && (
            <Typography variant="body2" color="text.secondary">
              {asset.brand}
            </Typography>
          )}

          {/* Purchase info */}
          {(asset.purchaseYear || asset.purchasePrice != null) && (
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
              {asset.purchaseYear && (
                <Typography variant="body2" color="text.secondary">
                  Purchased: <strong>{asset.purchaseYear}</strong>
                </Typography>
              )}
              {asset.purchasePrice != null && (
                <Typography variant="body2" color="text.secondary">
                  Price: <strong>{formatMoney(asset.purchasePrice, currency)}</strong>
                </Typography>
              )}
            </Stack>
          )}

          {/* Warranty */}
          <WarrantyLine
            warrantyExpiryDate={asset.warrantyExpiryDate}
            warrantyLengthYears={asset.warrantyLengthYears}
            theme={theme}
          />

          {/* Financial summary */}
          {(asset.estimatedCurrentValue != null ||
            asset.annualOwnershipCost != null ||
            asset.generatesIncome ||
            asset.expectedReplacementYear != null ||
            asset.notes) && (
            <Box sx={{ mt: 0.5 }}>
              {asset.estimatedCurrentValue != null && (
                <Typography variant="body2" color="text.secondary">
                  {'Est. value: '}
                  <strong>{formatMoney(asset.estimatedCurrentValue, currency)}</strong>
                  {asset.depreciationModel === 'appreciating'
                    ? ' · appreciating'
                    : asset.depreciationModel !== 'none' && asset.annualDepreciationRate != null
                    ? ` · depreciates ~${asset.annualDepreciationRate}%/yr`
                    : null}
                </Typography>
              )}
              {asset.annualOwnershipCost != null && (
                <Typography variant="body2" color="text.secondary">
                  {'Annual cost: '}
                  <strong>{formatMoney(asset.annualOwnershipCost, currency)}/yr</strong>
                </Typography>
              )}
              {asset.generatesIncome && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                  {asset.monthlyIncomeAmount != null && (
                    <Typography variant="body2" color="text.secondary">
                      Generates <strong>{formatMoney(asset.monthlyIncomeAmount, currency)}/mo</strong>
                    </Typography>
                  )}
                  <Chip label="Income" size="small" color="success" variant="outlined" />
                </Stack>
              )}
              {asset.expectedReplacementYear != null && (
                <Typography variant="body2" color="text.secondary">
                  Replace by: <strong>{asset.expectedReplacementYear}</strong>
                </Typography>
              )}
              {asset.notes && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {asset.notes}
                </Typography>
              )}
            </Box>
          )}

          {/* Vehicle-specific */}
          {asset.type === 'vehicle' && (asset.make || asset.vehicleModel || asset.mileage != null) && (
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {(asset.make || asset.vehicleModel) && (
                <Typography variant="body2" color="text.secondary">
                  {[asset.make, asset.vehicleModel].filter(Boolean).join(' ')}
                </Typography>
              )}
              {asset.mileage != null && (
                <Typography variant="body2" color="text.secondary">
                  {asset.mileage.toLocaleString()} mi
                </Typography>
              )}
            </Stack>
          )}

          {/* Home-system-specific */}
          {asset.type === 'home_system' && (asset.subtype || asset.materialType) && (
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {asset.subtype && (
                <Typography variant="body2" color="text.secondary">
                  {asset.subtype}
                </Typography>
              )}
              {asset.materialType && (
                <Typography variant="body2" color="text.secondary">
                  Material: {asset.materialType}
                </Typography>
              )}
            </Stack>
          )}
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Consult AI Advisor">
            <span>
              <IconButton size="small" color="primary" onClick={handlePredict} disabled={predicting}>
                {predicting
                  ? <CircularProgress size={18} color="inherit" />
                  : <AutoAwesomeIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(asset)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(asset._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AssetCard;
