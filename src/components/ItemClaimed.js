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
                These are the names that have been claimed, you can change the default description, TLD, Username for social media and Avatar on the record page.
                </Typography>
            </Container>
        </Box>
    );
}