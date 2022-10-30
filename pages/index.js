import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { ethers } from "ethers";
import UsofnemAbi from '../src/contracts/Usofnem.json';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { networks } from '../src/utils/networks';
import { amber } from '@mui/material/colors';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {
	useMediaQuery,
	CssBaseline,
	Button,
	Container,
	AppBar,
	Toolbar,
	Box,
	Typography,
	Chip,
	Avatar,
	TextField,
	Stack,
	MenuItem,
	Select,
	FormControl,
	FormHelperText
} from '@mui/material';
import Faq from '../src/components/Faq';
import Footer from '../src/components/Footer';
import Navigation from '../src/components/Navigation';

const ColorButton = styled(Button)(({ theme }) => ({
	color: theme.palette.getContrastText(amber[500]),
	backgroundColor: amber[500],
	alignItems: 'center',
	'&:hover': {
		backgroundColor: amber[700],
	},
}));


// Add the name you will be minting
const Usofnem = '0x7ddfcE4733F87097D775a911FD7BF43a6BDbBD5E';

const App = () => {
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
	const [username, setUsername] = useState('');
	const [category, setCategory] = useState('');
	const [network, setNetwork] = useState('');
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

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x61' }], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: '0x61',
									chainName: 'BSC Testnet',
									rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
									nativeCurrency: {
										name: "BSC Testnet",
										symbol: "BNB",
										decimals: 18
									},
									blockExplorerUrls: ["https://testnet.bscscan.com"]
								},
							],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
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

	const userRegister = async () => {
		// Don't run if the field is empty
		if (!username, !category ) { return }
		// Alert the user if the domain is too short
		if (username.length < 1) {
			alert('Domain must be at least 1 characters long');
			toast('Domain must be at least 1 characters long',
				{
					icon: '👏',
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				}
			);
			return;
		}
		// Calculate price based on length of username (change this to match your contract)
		const price = username.length === 1 ? '0.002' : username.length === 2 ? '0.002' : username.length === 3 ? '0.002' : username.length === 4 ? '0.002' : username.length === 5 ? '0.0015' : username.length === 6 ? '0.0015' : username.length === 7 ? '0.0015' : username.length === 8 ? '0.001' : '0.0005';
		console.log("Minting domain", username, "with price", price);
		toast('Minting domain', username, 'with price', price,
			{
				icon: '👏',
				style: {
					borderRadius: '10px',
					background: '#333',
					color: '#fff',
				},
			}
		);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(Usofnem, UsofnemAbi.abi, signer);

				console.log("Going to pop wallet now to pay gas...")
				toast('Going to pop wallet to pay gas...!',
					{
						icon: '💲',
						style: {
							borderRadius: '10px',
							background: '#333',
							color: '#fff',
						},
					}
				);
				let tx = await contract.register(username, category, { value: ethers.utils.parseEther(price) });
				// Wait for the transaction to be mined
				const receipt = await tx.wait();

				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Domain minted! https://testnet.bscscan.com/tx/" + tx.hash);
					toast('Success! Please wait ...!',
						{
							icon: '👏',
							style: {
								borderRadius: '10px',
								background: '#333',
								color: '#fff',
							},
						}
					);

					// Open Claimed page after 2 seconds
					setTimeout(() => {
						router.push('/claimed');
					}, 2000);

					setUsername('');
					setCategory('');
				}
				else {
					alert("Transaction failed! Please try again");
					toast('Transaction failed! Please try again',
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
		}
		catch (error) {
			console.log(error);
		}
	}

	// Render Methods
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);

	// Form to enter username and data
	const renderRegisterForm = () => {
		// If not on BSC Testnet, render "Please connect to BSC Testnet"
		if (network !== 'BSC Testnet') {
			return (
				<div className="connect-wallet-container">
					<button className='cta-button mint-button' onClick={switchNetwork}>Switch to BSC Testnet</button>
				</div>
			);
		}

		// The rest of the function remains the same
		return (

			<Box sx={{ width: '100%' }}>
				<Image width="100vw" height="10" layout="responsive" src="/header-cz.svg" alt="CZ Friends" />
				<Box sx={{ display: 'inline', alignItems: 'center', '& > :not(style)': { p: 1, mt: 1 }, }}>
					<TextField fullWidth
						value={username}
						helperText="Just write Username! We support all character (emoji, number or whatever you want)"
						onChange={e => setUsername(e.target.value)}
					/>
					<FormControl fullWidth>
					<Select
						value={category}
						onChange={e => setCategory(e.target.value)}
					>
						<MenuItem value={'Letter'}>Letter</MenuItem>
						<MenuItem value={'Number'}>Number</MenuItem>
                        <MenuItem value={'Emoji'}>Emoji</MenuItem>
                        <MenuItem value={'Kaomoji'}>Kaomoji</MenuItem>
						<MenuItem value={'Symbol'}>Symbol</MenuItem>
                        <MenuItem value={'Special Character'}>Special Character</MenuItem>
					</Select>
					<FormHelperText>Your category of name! (This trait atribute of Domain name) Letter (abc/ABC), Number (123), Emoji (❤☢🔶), Kaomoji (⊙ˍ⊙), Symbol (௹¥฿), Special Charaacter (_&#*)</FormHelperText>
					</FormControl>

					{(
							<Stack spacing={2} direction="row">
								<ColorButton sx={{ width: '100%', mt: 4, mb: 4 }} variant="contained" onClick={userRegister}>
									Register
								</ColorButton>
							</Stack>
					)}
				</Box>
			</Box>

		);
	}

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
								<Image width="130" height="24" src="/usofnem.svg" alt="Usofnem Registrar" />
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
				{currentAccount && renderRegisterForm()}
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

export default App;