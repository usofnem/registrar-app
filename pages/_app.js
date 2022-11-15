import './styles/styles.css';
import React from 'react';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from '../src/components/Navigation';

const darkTheme = createTheme({
  typography: {
    fontFamily: 'monospace'
  },
  palette: {
    mode: 'dark',
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Your identity across web3, one name for all your crypto addresses, and your decentralised website."
        />
        <title>Usofnem Registrar | Use Of Name for Anything Across Web3</title>
      </Head>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Component {...pageProps} />
        <Navigation />
      </ThemeProvider>
    </>
  )
}

export default MyApp