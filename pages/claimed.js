import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
import UsofnemAbi from '../src/contracts/Usofnem.json';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { networks } from '../src/utils/networks';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
	useMediaQuery,
	CssBaseline,
	Container,
	Card,
	CardActionArea,
	CardMedia,
	CardContent,
	AppBar,
	Toolbar,
	Box,
	Typography,
	Chip,
	Avatar,
	Grid
} from '@mui/material';
import Faq from '../src/components/Faq';
import Footer from '../src/components/Footer';
import Navigation from '../src/components/Navigation';


// Add the name you will be minting
const Usofnem = '0x7ddfcE4733F87097D775a911FD7BF43a6BDbBD5E';

const Claimed = () => {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const theme = useMemo(
		() =>
			createTheme({
				typography: {
					fontFamily: 'monospace'
				},
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light',
				},
			}),
		[prefersDarkMode],
	);
	const [currentAccount, setCurrentAccount] = useState('');
	// Add some state data propertie
	const [network, setNetwork] = useState('');
	const [mints, setMints] = useState([]);
	const router = useRouter();

	// Implement your connectWallet method here
	async function connectWallet() {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			// Fancy method to request access to account.
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });

			// Boom! This should print out public address once we authorize Metamask.
			console.log("Connected", accounts[0]);
			toast('Connected!',
				{
					icon: '👏',
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				}
			);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
			toast('NotConnected!',
				{
					icon: '❌',
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				}
			);
		}
	}

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			toast('Found an authorized account:', account,
				{
					icon: '👏',
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				}
			);
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
			toast('No authorized account found',
				{
					icon: '❌',
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				}
			);
		}

		// This is the new part, we check the user's network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged);

		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	};

	// Add this function anywhere in your component (maybe after the mint function)
	const fetchMints = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(Usofnem, UsofnemAbi.abi, signer);

				// Get all the names from our contract
				const names = await contract.getAllNames();
				// For each name, get the record
				const armySquad = await Promise.all(names.map(async (name) => {
					const owner = await contract.username(name);
					const record = await contract.tokenURI(owner);
					const data = Buffer.from(record.substring(29), 'base64');
					const result = JSON.parse(data.toString());
					console.log(result);
					return {
						id: names.indexOf(name),
						name: result.name,
						desc: result.description,
						avatar: result.image,
						attribute: result.attributes,

					};
				}));

				console.log("MINTS FETCHED ", armySquad);
				setMints(armySquad);
			}
		} catch (error) {
			console.log(error);
		}
	}

	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (network === 'BSC Testnet') {
			fetchMints();
		} else {
			router.push('/claimed');
		}
	}, [currentAccount, network]);

	// Render Methods
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);

	// Add this render function next to your other render functions
	const renderMints = () => {
		if (mints.length > 0) {
			return (
				<Box sx={{ flexGrow: 1 }}>
					<Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
						{mints.map((mint, index) => {
							return (
								<Grid item xs={2} sm={4} md={4} key={index}>
									<Card sx={{ maxWidth: 345 }}>
										<CardActionArea>
											<CardMedia sx={{ maxHeight: 300 }}
												component="img"
												image={mint.avatar}
												alt={mint.name}
											/>
											<CardContent>
												<Typography gutterBottom variant="body1" component="div">
													{mint.name}
												</Typography>
											</CardContent>
										</CardActionArea>
									</Card>
								</Grid>)
						})}
					</Grid>
				</Box>
			);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box>
				<AppBar position="static">
					<Container>
						<Toolbar>
							<Typography variant="body1" sx={{ flexGrow: 1, mt: 1 }}>
								<a href="/" target="_blank">
								<Image width="130" height="24" src="/usofnem.svg" alt="Usofnem Registrar" />
								</a>
							</Typography>
							<Chip
								avatar={<Avatar alt="Network logo" src={network.includes("BSC Testnet") ? '/bsc-logo.svg' : '/ethlogo.png'} />}
								label={currentAccount ? <Typography variant="body1"> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </Typography> : <Typography variant="body1"> Not connected </Typography>}
								variant="outlined"
							/>
						</Toolbar>
					</Container>
				</AppBar>
			</Box>
			<Container sx={{ mt: 5 }}>
				{!currentAccount && renderNotConnectedContainer()}
			</Container>
			<Container sx={{ mt: 3 }}>
				{mints && renderMints()}
			</Container>
			<Toaster />
			<Container sx={{ mt: 3, mb: 5 }}>
				<Faq />
			</Container>
			<Footer />
			<Navigation/>
		</ThemeProvider>
	);
}

export default Claimed;