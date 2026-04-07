import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, CircularProgress } from '@mui/material';
import AppLayout from '../components/AppLayout';
import PredictionCard from '../components/PredictionCard';
import { predictions as predictionsApi } from '../utils/api';

const PredictionsPage = () => {
  const [predictionsList, setPredictionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictionsApi
      .getAll()
      .then((res) => setPredictionsList(res.data))
      .catch((err) => console.error('Failed to load predictions:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h1" sx={{ mb: 0.5 }}>
          AI Predictions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Financial projections generated from your assets and life events.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : predictionsList.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No predictions generated yet. Navigate to Assets or Life Events to run a projection.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {predictionsList.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p._id}>
                <PredictionCard prediction={p} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </AppLayout>
  );
};

export default PredictionsPage;
