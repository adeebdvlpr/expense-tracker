import React from 'react';
import { Container, Typography } from '@mui/material';
import AppLayout from '../components/AppLayout';

const LifeEventsPage = () => {
  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h2">Life Events</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Coming soon.
        </Typography>
      </Container>
    </AppLayout>
  );
};

export default LifeEventsPage;
