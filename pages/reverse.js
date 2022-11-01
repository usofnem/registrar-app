import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { Usofnem, UsofnemResolve } from '../config';
import UsofnemAbi from '../src/contracts/Usofnem.json';
import UsofnemReverseAbi from '../src/contracts/UsofnemReverse.json';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { networks } from '../src/utils/networks';
import { amber } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import {
	Button,
	Container,
	AppBar,
	Toolbar,
	Box,
	Typography,
	Chip,
	Avatar,
	TextField,
	Stack
} from '@mui/material';
import Faq from '../src/components/Faq';
import Footer from '../src/components/Footer';
import NotConnected from '../src/components/NotConnected';
import ItemReverse from '../src/components/ItemReverse';

const ColorButton = styled(Button)(({ theme }) => ({
	color: theme.palette.getContrastText(amber[500]),
	backgroundColor: amber[500],
	alignItems: 'center',
	'&:hover': {
		backgroundColor: amber[700],
	},
}));

const Reverse = () => {

	const [currentAccount, setCurrentAccount] = useState('');
	// Add some state data propertie
	const [reversed, setReversed] = useState('');
	const [network, setNetwork] = useState('');
	const [resolved, setResolved] = useState('');


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

	const getResolve = async () => {
		if (!currentAccount || !network) { return }

		try {

			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contractReverse = new ethers.Contract(UsofnemResolve, UsofnemReverseAbi.abi, signer);
				const contractUsofnem = new ethers.Contract(Usofnem, UsofnemAbi.abi, signer);

				const resolve = await contractReverse.resolve(currentAccount);
				const withtld = await contractUsofnem.getRecord(resolve, 0);
				console.log(resolve + withtld)

				setResolved(resolve + withtld);

			}


		}
		catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		if (currentAccount || network) {
			getResolve();
		}
	}, [currentAccount, network]);

	const userReverse = async () => {
		if (!reversed) {return}
		console.log("Domain Reversed");

		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(UsofnemResolve, UsofnemReverseAbi.abi, signer);


				let tx = await contract.setReverse(reversed);
				// Wait for the transaction to be mined 
				await tx.wait();
				console.log("Domain Reversed! https://testnet.bscscan.com/tx/" + tx.hash);
				toast('Domain Reversed!',
					{
						icon: '👏',
						style: {
							borderRadius: '10px',
							background: '#333',
							color: '#fff',
						},
					}
				);

				setReversed('');
			}
		} catch (error) {
			console.log(error);
		}
	}

	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (network === 'BSC Testnet') {
			userReverse();
		}
	}, [currentAccount, network]);

	// Render Methods
	const renderNotConnectedContainer = () => (
		<NotConnected>
			<ColorButton align="center" sx={{ width: '70%', mt: 4, mb: 4 }} variant="contained" onClick={connectWallet}>
				Connect Wallet
			</ColorButton>
		</NotConnected>
	);

	// Form to enter username and data
	const renderReverseForm = () => {
		// If not on BSC Testnet, render "Please connect to BSC Testnet"
		if (network !== 'BSC Testnet') {
			return (
				<Box sx={{ pt: 8, pb: 6 }}>
					<Container maxWidth="sm">
						<Typography variant="body1" align="center" color="text.secondary" paragraph>
							Switch to BSC Network if you want to claim or view claimed domain on this platform.
						</Typography>
						<Stack sx={{ pt: 4 }} direction="row" spacing={2} justifyContent="center">
							<ColorButton align="center" sx={{ width: '70%', mt: 4, mb: 4 }} variant="contained" onClick={switchNetwork}>
								Switch Network
							</ColorButton>
						</Stack>
					</Container>
				</Box>
			);
		}
		// The rest of the function remains the same
		return (

			<>
				<ItemReverse />
				<Box sx={{ width: '100%' }}>
					<Image width="100vw" height="10" layout="responsive" src="/header-cz.svg" alt="CZ Friends" />
					<Box sx={{ display: 'inline', alignItems: 'center', '& > :not(style)': { p: 1, mt: 1 }, }}>
						<TextField fullWidth
							value={reversed}
							required
							helperText="Just write the domain/username without the .tld to reverse your domain name! Because .tld will be automatically bound to the domain name.(Note: Make sure only the domain/username you have from the previous registration.)"
							onChange={e => setReversed(e.target.value)} />

						{(
							<Stack spacing={2} direction="row">
								<ColorButton sx={{ width: '100%', mt: 4, mb: 4 }} variant="contained" onClick={userReverse}>
									Reverse
								</ColorButton>
							</Stack>
						)}
					</Box>
				</Box>
			</>

		);
	}

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="body1" sx={{ flexGrow: 1, mt: 1 }}>
						<Image width="130" height="24" src="/usofnem.svg" alt="Usofnem Registrar" />
					</Typography>
					<Chip
						avatar={<Avatar alt="Network logo" src={network.includes("BSC Testnet") ? '/bsc-logo.svg' : '/ethlogo.png'} />}
						label={currentAccount ? (<Typography variant="body1"> {resolved ? (<>{resolved}</>
						) : (<> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </>)} {' '} </Typography>) : (<Typography variant="body1"> Not connected </Typography>)}
						variant="outlined" />
				</Toolbar>
			</AppBar>
			<Container sx={{ mt: 5 }}>
				{!currentAccount && renderNotConnectedContainer()}
			</Container>
			<Container sx={{ mt: 3 }}>
				{currentAccount && renderReverseForm()}
			</Container>
			<Toaster />
			<Container sx={{ mt: 3, mb: 5 }}>
				<Faq />
			</Container>
			<Footer />
		</>
	);
}

export default Reverse;