import React, { useState } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';

function Dashboard() {
  const [documents, setDocuments] = useState([]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper style={{ padding: 20, marginTop: 20 }}>
            <Typography variant="h4">Tax Filing Dashboard</Typography>
            {/* Add dashboard content here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;