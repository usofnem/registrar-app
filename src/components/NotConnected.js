import React from 'react';
import {
    Box,
    Container,
    Typography,
    Stack
} from '@mui/material';

export default function NotConnected({ children }) {
    return (
        <Box sx={{ pt: 8, pb: 6 }}>
            <Container maxWidth="sm">
                <Typography
                    component="h1"
                    variant="h2"
                    align="center"
                    color="text.primary"
                    gutterBottom
                >
                    Us0fnem for Anything
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" paragraph>
                    The ultimate goal of this project is to develop publication media with asset/content ownership in NFT. Content can be traded on the marketplace and advertisers can claim to place ads in the content. Claim your name today!
                </Typography>
                <Stack
                    sx={{ pt: 4 }}
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                >
                    {children}
                </Stack>
            </Container>
        </Box>
    );
}