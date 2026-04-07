import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from '../utils/money';

function confidenceColor(confidence, theme) {
  switch (confidence) {
    case 'high':   return theme.palette.success.main;
    case 'medium': return theme.palette.info.main;
    case 'low':    return theme.palette.warning.main;
    default:       return theme.palette.text.secondary;
  }
}

const PredictionCard = ({ prediction }) => {
  const theme = useTheme();
  const { title, summary, projectedCost, confidence } = prediction;
  const chipColor = confidenceColor(confidence, theme);

  return (
    <Card elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h3" sx={{ flex: 1, mr: 1 }}>
            {title}
          </Typography>
          <Chip
            label={confidence}
            size="small"
            sx={{
              backgroundColor: chipColor,
              color: theme.palette.getContrastText(chipColor),
              fontWeight: 600,
              textTransform: 'capitalize',
              flexShrink: 0,
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {summary}
        </Typography>
        <Typography variant="h3" color="primary.main">
          {formatMoney(projectedCost)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
