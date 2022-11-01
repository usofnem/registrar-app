import React from 'react';
import { CssBaseline, Paper, Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ArticleOutlined, GraphicEqOutlined, VerifiedOutlined, FenceOutlined } from '@mui/icons-material';

export default function Navigation() {

    return (
        <Box sx={{ pb: 7 }}>
            <CssBaseline />
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation showLabels={true}>
                    <BottomNavigationAction
                        label="Home"
                        href="/"
                        icon={<FenceOutlined />}
                    />
                    <BottomNavigationAction
                        label="Claimed"
                        href="/claimed"
                        icon={<VerifiedOutlined />}
                    />
                    <BottomNavigationAction
                        label="Record"
                        href="/record"
                        icon={<GraphicEqOutlined />}
                    />
                    <BottomNavigationAction label="Reverse" href="/reverse" icon={<ArticleOutlined />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
}