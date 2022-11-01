import React from 'react';
import {
    Box,
    Container,
    Typography
} from '@mui/material';

export default function ItemReverse() {
    return (
        <Box sx={{ pb: 6 }}>
            <Container maxWidth="sm">
                <Typography variant="body1" align="center" color="text.secondary" paragraph>
                Reverse record is a asserting ownership of an address and only the owner of an address can configure a reverse record. No additional fees are charged but you need to pay a gas fee for the network. Keep in mind that there is only one wallet address for one domain name.
                </Typography>
            </Container>
        </Box>
    );
}