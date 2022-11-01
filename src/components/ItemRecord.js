import React from 'react';
import {
    Box,
    Container,
    Typography
} from '@mui/material';

export default function ItemClaimed() {
    return (
        <Box sx={{ pb: 6 }}>
            <Container maxWidth="sm">
                <Typography variant="body1" align="center" color="text.secondary" paragraph>
                There is no additional cost, you can change the default description, TLD, Username for social media and Avatar only by paying a gas fee for the network.
                </Typography>
            </Container>
        </Box>
    );
}