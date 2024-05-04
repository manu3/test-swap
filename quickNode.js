import { Web3 } from "web3";
import { private_key_format,providerRpcUrlTestnet,uniswapSepholiaTestnetRouterContractAddress, uniswapv2TestnetSepholia_abi,linkabi, linkTokenBaseSpolia, ethTestnet, wethAbi, wethTestnet } from './configTestnet.js';

// Configuration for QuickNode endpoint and user's private key
const QUICKNODE_ENDPOINT = providerRpcUrlTestnet;
const PRIVATE_KEY = private_key_format;
// Setting up the provider and signer to connect to the Ethereum network via QuickNode
const web3 = new Web3(QUICKNODE_ENDPOINT);


//const uniswapRouter= Web3.utils.toChecksum(uniswapSepholiaTestnetRouterContractAddress);
//console.log("checksum uniswaprouter:",uniswapRouter)


const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

//console.log("contract initialized:",contract);

const linkTestnet = Web3.utils.toChecksumAddress(linkTokenBaseSpolia);
const ethSepolia = Web3.utils.toChecksumAddress(ethTestnet);
const wethSepolia = Web3.utils.toChecksumAddress(wethTestnet);

const wethSepoliaContract = new web3.eth.Contract(wethAbi,wethSepolia,account.address/*, {
  from: account.address, // default from address
  gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
}*/);

const linkSepoliaContract = new web3.eth.Contract(linkabi,linkTestnet,account.address/*, {
  from: account.address, // default from address
  gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
}*/);
linkSepoliaContract.methods.balanceOf(account.address).call().then(function (result){
  const balanceInLink = web3.utils.fromWei(result, "ether");
  console.log("printing result:",balanceInLink,"LINK");
})
// const contractWithSigner = contract.connect(signer);
wethSepoliaContract.methods.balanceOf(account.address).call().then(function (result){
  const balanceInWeth = web3.utils.fromWei(result, "ether");
  console.log("printing result:",balanceInWeth,"WETH");
})

// Instantiating the contract object for interacting with the WETH contract
const contract = new web3.eth.Contract(uniswapv2TestnetSepholia_abi,"0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008", {
  from: account.address, // default from address
  gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
});





//method to read wallet
async function readAccount() {
  console.log("Reading the balance...");

  const balanceInWei = await web3.eth.getBalance(account.address);
  console.log("Account balance in Wei:", balanceInWei);
  const balanceInEther = web3.utils.fromWei(balanceInWei, "ether");
  console.log("Wallet balance:"+ balanceInEther +"ETH");
}


//swap eth por weth tokens in base sepolia testnet
async function swapETHForExactTokens(wallet,amountInWei,private_key_format) {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    console.log("Precio mínimo de gas:", gasPrice);
    console.log("wallet:", wallet);
    const ethSepolia = Web3.utils.toChecksumAddress("0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43");
    const linkSepolia = Web3.utils.toChecksumAddress("0xE4aB69C077896252FAFBD49EFD26B5D171A32410");
    const wethSepolia = Web3.utils.toChecksumAddress("0x4200000000000000000000000000000000000006");
    const contractAddr = Web3.utils.toChecksumAddress("0x1689E7B1F10000AE47eBfE339a4f69dECd19F602");
    const path= [linkSepolia,wethSepolia];
    const contract = new web3.eth.Contract(uniswapv2TestnetSepholia_abi, contractAddr);
    const z=contract.methods.WETH(wallet).encodeABI();
    console.log("zzzzzzzzzzzzzzzzz:",z);

    const signedTx = await web3.eth.accounts.signTransaction({
      from: wallet,
      to: contractAddr,
      value: amountInWei,
      data: contract.methods.swapExactETHForTokens(0, path, wallet, Date.now() + 1000 * 60 * 10).encodeABI(),
      gasPrice: gasPrice,
      gas: 300000 // Ajusta el límite de gas según sea necesario
    }, private_key_format);
    
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Transacción blockHash:", txReceipt.blockHash);
    console.log("Transacción Hash:", txReceipt.transactionHash);
    
  } catch (error) {
      console.error("Error al aprobar el intercambio:", error);
  }
}                   

(async () => {
  // First, read the contract to get the initial state
  await readAccount();
  //await readTokensInWallet();
  const wallet = Web3.utils.toChecksumAddress(account.address);
  const contractAddr = Web3.utils.toChecksumAddress("0x1689E7B1F10000AE47eBfE339a4f69dECd19F602");
  console.log(wallet)
  var amountInEth = 0.0012;
  var amountInWei = web3.utils.toWei(amountInEth.toString(), 'ether');
  console.log("amountInWei:", amountInWei);
 
  await   swapETHForExactTokens(wallet,amountInWei,private_key_format);

})().catch(console.error);