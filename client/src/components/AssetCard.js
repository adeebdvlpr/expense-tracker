import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from '../utils/money';

const TYPE_LABELS = {
  home_system: 'Home System',
  appliance:   'Appliance',
  vehicle:     'Vehicle',
  electronics: 'Electronics',
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

const AssetCard = ({ asset, currency = 'USD', onEdit, onDelete }) => {
  const theme = useTheme();

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
