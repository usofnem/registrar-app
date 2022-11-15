import {
    Box,
    Typography,
    Stack,
    Link
} from "@mui/material";
import {
    Telegram,
    Twitter,
    GitHub
} from "@mui/icons-material";

export default function Footer() {
    return (
        <Box component="footer" sx={{ py: 5 }}>
            <Stack
                direction="row"
                justifyContent="center"
                spacing={4}
                sx={{ mb: 5 }}
            >
                <Link
                    sx={{ textDecoration: "none" }}
                    href="https://t.me/usofnem"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Telegram fontSize="large" htmlColor="#1769aa" />
                </Link>
                <Link
                    sx={{ textDecoration: "none" }}
                    href="https://twitter.com/usofnem"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Twitter fontSize="large" htmlColor="#1769aa" />
                </Link>
                <Link
                    sx={{ textDecoration: "none" }}
                    href="https://github.com/usofnem"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <GitHub fontSize="large" htmlColor="#1769aa" />
                </Link>
            </Stack>
            <Typography variant="body2" align="center">
                Build with ❤ by Binance User
            </Typography>
        </Box>
    );
}