import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
import { Usofnem, UsofnemResolve } from '../config';
import UsofnemAbi from '../src/contracts/Usofnem.json';
import UsofnemReverseAbi from '../src/contracts/UsofnemReverse.json';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { networks } from '../src/utils/networks';
import { amber } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import {
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
	Grid,
	Button,
	Stack
} from '@mui/material';
import Faq from '../src/components/Faq';
import Footer from '../src/components/Footer';
import NotConnected from '../src/components/NotConnected';
import ItemClaimed from '../src/components/ItemClaimed';

const ColorButton = styled(Button)(({ theme }) => ({
	color: theme.palette.getContrastText(amber[500]),
	backgroundColor: amber[500],
	alignItems: 'center',
	'&:hover': {
		backgroundColor: amber[700],
	},
}));

const Claimed = () => {

	const [currentAccount, setCurrentAccount] = useState('');
	// Add some state data propertie
	const [network, setNetwork] = useState('');
	const [mints, setMints] = useState([]);
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

	const switchToBNBChain = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the BNB Chain
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x38' }], // Check networks.js for hexadecimal network ids
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
									chainId: '0x38',
									chainName: 'BSC Mainnet',
									rpcUrls: ['https://rpc.ankr.com/bsc'],
									nativeCurrency: {
										name: "BSC Mainnet",
										symbol: "BNB",
										decimals: 18
									},
									blockExplorerUrls: ["https://bscscan.com"]
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

	const switchToPolygonChain = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Polygon Chain
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x89' }], // Check networks.js for hexadecimal network ids
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
									chainId: '0x89',
									chainName: 'Polygon',
									rpcUrls: ['https://rpc.ankr.com/polygon'],
									nativeCurrency: {
										name: "Polygon",
										symbol: "MATIC",
										decimals: 18
									},
									blockExplorerUrls: ["https://polygonscan.com"]
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

	const switchToEthereum = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Polygon Chain
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x1' }], // Check networks.js for hexadecimal network ids
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
									chainId: '0x1',
									chainName: 'Ethereum',
									rpcUrls: ['https://rpc.ankr.com/eth'],
									nativeCurrency: {
										name: "Ethereum",
										symbol: "ETH",
										decimals: 18
									},
									blockExplorerUrls: ["https://etherscan.io"]
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
					const nameid = await contract.username(name);
					const record = await contract.tokenURI(nameid);
					const data = Buffer.from(record.substring(29), 'base64');
					const result = JSON.parse(data.toString());
					console.log(result);
					return {
						id: names.indexOf(name),
						nem: name,
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
		if (network === 'BSC Mainnet' || network === 'Polygon' || network === 'Ethereum') {
			fetchMints();
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

	// Add this render function next to your other render functions
	const renderMints = () => {
		// If not on BSC Mainnet, Ethereum or Polygon, render "Please connect to BSC Mainnet, Ethereum or Polygon"
		if (network !== 'BSC Mainnet' && network !== 'Polygon' && network !== 'Ethereum') {
            return (
                <Box sx={{ pt: 8, pb: 6 }}>
                    <Container maxWidth="sm">
                    <Typography variant="body1" align="center" color="text.secondary" paragraph>
						Please Login to BNBCHAIN, ETHEREUM or POLYGON Network if you want to claim or view claimed domain on this platform.
						</Typography>
						<Stack sx={{ pt: 4 }} direction="row" spacing={2} justifyContent="center">
						<ColorButton align="center" variant="contained" onClick={switchToBNBChain}>
							Login with BNBCHAIN
						</ColorButton>
                        <ColorButton align="center" variant="contained" onClick={switchToEthereum}>
							Login With ETHEREUM
						</ColorButton>
						<ColorButton align="center" variant="contained" onClick={switchToPolygonChain}>
							Login With POLYGON
						</ColorButton>
						</Stack>
                    </Container>
                </Box>
            );
        }
		if (mints.length > 0) {
			return (
				<>
					<ItemClaimed />
					<Box sx={{ flexGrow: 1 }}>
						<Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
							{mints.map((mint, index) => {
								return (
									<Grid item xs={12} md={6} key={index}>
										<CardActionArea component="a" href={'/' + mint.nem}>
											<Card sx={{ display: 'flex' }}>
												<CardContent sx={{ flex: '1', objectFit: 'contain' }}>
													<Typography component="h2" variant="h5">
														@{mint.name}
													</Typography>
													<Typography variant="subtitle1" color="text.secondary">
														#ID-{mint.id}
													</Typography>
													<Typography variant="body2" paragraph>
														{mint.desc.substring(0, 45)}...
													</Typography>
												</CardContent>

												<CardMedia sx={{ width: 100, objectFit: 'contain' }}
													component="img"
													image={mint.avatar}
													alt={mint.name} />
											</Card>
										</CardActionArea>
									</Grid>);
							})}
						</Grid>
					</Box>
				</>
			);
		}
	};

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
						avatar={<Avatar alt="Network logo" src={network.includes("BSC Mainnet") ? '/bsc-logo.svg' : network.includes("Polygon") ? '/polygon-logo.svg' : network.includes("Ethereum") ? '/ethlogo.png' : '/ethlogo.png'} />}
						label={currentAccount ? (<Typography variant="body1"> {resolved ? (<>{resolved}</>
						) : (<> {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </>)} {' '} </Typography>) : (<Typography variant="body1"> Not connected </Typography>)}
						variant="outlined"
					/>
				</Toolbar>
            </AppBar>
			<Container sx={{ mt: 5 }}>
				{!currentAccount && renderNotConnectedContainer()}
			</Container>
			<Container sx={{ mt: 3 }}>
				{currentAccount && renderMints()}
			</Container>
			<Toaster />
			<Container sx={{ mt: 3, mb: 5 }}>
				<Faq />
			</Container>
			<Footer />
		</>
	);
}

export default Claimed;
