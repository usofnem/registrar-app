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

const myAccount = () => {
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
	const [tld, setTld] = useState('');
	const [avatar, setAvatar] = useState('');
	const [description, setDesc] = useState('');
	const [socialmedia, setSocmed] = useState('');
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

	const userRecord = async () => {
		if (!tld, !avatar, !description, !socialmedia || !username) { return }
		console.log("Updating domain", username, "with record", tld, avatar, description, socialmedia);

		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(Usofnem, UsofnemAbi.abi, signer);


				let tx = await contract.setAllRecords(username, tld, avatar, description, socialmedia);
				// Wait for the transaction to be mined 
				await tx.wait();
				console.log("Domain Recorded! https://testnet.bscscan.com/tx/" + tx.hash);
				toast('Domain Recorded!',
					{
						icon: '👏',
						style: {
							borderRadius: '10px',
							background: '#333',
							color: '#fff',
						},
					}
				);

				setUsername('');
				setTld('');
				setAvatar('');
				setDesc('');
				setSocmed('');
			}
		} catch (error) {
			console.log(error);
		}
	}

	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (network === 'BSC Testnet') {
			userRecord();
		} else {
			router.push('/record');
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

	// Form to enter username and data
	const renderRecordForm = () => {
		// The rest of the function remains the same
		return (

			<Box sx={{ width: '100%' }}>
				<Image width="100vw" height="10" layout="responsive" src="/header-cz.svg" alt="CZ Friends" />
				<Box sx={{ display: 'inline', alignItems: 'center', '& > :not(style)': { p: 1, mt: 1 }, }}>
					<TextField fullWidth
						value={username}
						required
						helperText="Username can't be changed! Tips: Remove TLD from your name and write again username without TLD (Only write username that you have from the previous registration.)"
						onChange={e => setUsername(e.target.value)}
					/>
					<FormControl fullWidth>
						<Select
							value={tld}
							onChange={e => setTld(e.target.value)}
						>
							<MenuItem value={'.com'}>.com</MenuItem>
							<MenuItem value={'.io'}>.io</MenuItem>
							<MenuItem value={'.wtf'}>.wtf</MenuItem>
							<MenuItem value={'.og'}>.og</MenuItem>
							<MenuItem value={'.town'}>.town</MenuItem>
							<MenuItem value={'.xyz'}>.xyz</MenuItem>
						</Select>
						<FormHelperText>Your Favorite TLD! This trait atribute for your name! Tell us the TLD you want if it's not available here.</FormHelperText>
					</FormControl>
					<TextField fullWidth
						value={avatar}
						helperText="Your Favorite Avatar URL for your Name! (Example: https://avatars.dicebear.com/api/open-peeps/awesome-image.png)"
						onChange={e => setAvatar(e.target.value)}
						>
					</TextField>
					<TextField fullWidth
						value={description}
						helperText="Just write Description about you and this name!"
						onChange={e => setDesc(e.target.value)}
					/>
					<TextField fullWidth
						value={socialmedia}
						helperText="Just write Username for your social media account without @symbol!"
						onChange={e => setSocmed(e.target.value)}
					/>

					{(
						<Stack spacing={2} direction="row">
							<ColorButton sx={{ width: '100%', mt: 4, mb: 4 }} variant="contained" onClick={userRecord}>
								Update Record
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
				{currentAccount && renderRecordForm()}
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

export default myAccount;