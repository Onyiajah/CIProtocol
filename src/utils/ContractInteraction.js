import { BrowserProvider, Contract, getDefaultProvider, parseUnits, ethers } from '@coti-io/coti-ethers';
import { Network } from "@coti-io/coti-ethers";
import { YOUR_CONTRACT_ABI } from './ContractABI.js';

const CONTRACT_ADDRESS = "0x678C32C4eAD53d9f1bBFcA03553980830715A561";
const ONBOARD_CONTRACT_ADDRESS = "0x536A67f0cc46513E7d27a370ed1aF9FDcC7A5095";

const cotiTestnet = {
  chainId: 7082400, // Decimal number for BrowserProvider compatibility
  chainName: 'COTI Testnet',
  rpcUrls: ['https://testnet.coti.io/rpc'], // Updated RPC URL
  nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
  blockExplorerUrls: ['https://testnet.cotiscan.io']
};
let provider;
let signer;
let cotiWillContract;

export async function switchToCotiTestnet() {
  console.log("Attempting to switch to Chain ID:", cotiTestnet.chainId);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${cotiTestnet.chainId.toString(16)}` }], // Hex for MetaMask
    });
    console.log("Switched to COTI Testnet successfully");
  } catch (switchError) {
    console.error("Network switch error:", switchError);
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [cotiTestnet],
        });
        console.log("COTI Testnet added successfully");
      } catch (addError) {
        console.error("Failed to add COTI Testnet:", addError);
        throw new Error(`Failed to add network: ${addError.message}`);
      }
    } else {
      throw switchError;
    }
  }
}

export async function onboardUser(signer) {
  try {
    console.log("Signer object:", signer);
    if (typeof signer.getWallet === 'function') {
      const wallet = await signer.getWallet();
      if (!wallet.getUserOnboardInfo()?.aesKey) {
        wallet.enableAutoOnboard();
        await wallet.generateOrRecoverAes(ONBOARD_CONTRACT_ADDRESS);
        console.log('User onboarded:', wallet.getUserOnboardInfo());
      }
      return wallet;
    } else {
      console.warn("signer.getWallet is not available. Skipping onboarding.");
      return signer; // Fallback to signer if getWallet is unsupported
    }
  } catch (error) {
    console.error('Onboarding error:', error);
    throw new Error('Failed to onboard user.');
  }
}

export async function initializeWeb3() {
  try {
    if (window.ethereum) {
      await switchToCotiTestnet();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected accounts:", accounts);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts connected. Please approve MetaMask access.");
      }
      const minimalNetwork = { chainId: cotiTestnet.chainId, name: cotiTestnet.chainName };
      console.log("Initializing BrowserProvider with network:", minimalNetwork);
      provider = new BrowserProvider(window.ethereum, minimalNetwork);
      const network = await provider.getNetwork();
      console.log("Connected network Chain ID:", network.chainId);
      if (BigInt(network.chainId) !== BigInt(7082400)) {
        console.warn(`Connected to Chain ID ${network.chainId} instead of 7082400. Verify with COTI support.`);
      }
      signer = await provider.getSigner();
      console.log("Signer initialized:", signer);
      const wallet = await onboardUser(signer);
      if (!YOUR_CONTRACT_ABI || !Array.isArray(YOUR_CONTRACT_ABI)) {
        throw new Error("Invalid or missing CONTRACT_ABI. Check ContractABI.js.");
      }
      cotiWillContract = new Contract(CONTRACT_ADDRESS, YOUR_CONTRACT_ABI, wallet);
      cotiWillContract = cotiWillContract.connect(signer); // Explicitly connect with signer
      console.log("Contract initialized at:", CONTRACT_ADDRESS);
      return await wallet.getAddress();
    } else {
      console.warn("No browser wallet detected. Using default provider.");
      provider = getDefaultProvider(Network.from("coti-testnet"));
      cotiWillContract = new Contract(CONTRACT_ADDRESS, YOUR_CONTRACT_ABI, provider);
      return null;
    }
  } catch (error) {
    console.error("Error initializing Web3:", error);
    throw new Error(`Failed to connect to blockchain: ${error.message || ""}`);
  }
}

export async function createWill(inheritors, releaseTime) {
  if (!signer || !cotiWillContract || !cotiWillContract.runner) {
    console.error("Signer:", signer, "Contract:", cotiWillContract);
    throw new Error("Wallet not connected. Please connect your wallet.");
  }
  console.log("Contract runner provider isSigner:", cotiWillContract.runner.provider.isSigner); // Debug log
  console.log("Inheritors (original):", inheritors, "Release Time:", releaseTime); // Debug input
  // Scale percentages to 0-100 range
  const scaledInheritors = inheritors.map(inheritor => ({
    ...inheritor,
    percentage: Number(inheritor.percentage) / 100 // Convert from basis points (10000) to percentage (100)
  }));
  console.log("Inheritors (scaled):", scaledInheritors); // Debug scaled input
  try {
    const totalPercentage = scaledInheritors.reduce((sum, inheritor) => sum + Number(inheritor.percentage), 0);
    console.log("Calculated total percentage:", totalPercentage); // Debug log
    if (totalPercentage !== 100) {
      throw new Error(`Inheritor percentages must sum to 100%. Got ${totalPercentage}`);
    }
    if (!scaledInheritors.every(inheritor => ethers.isAddress(inheritor.wallet))) {
      throw new Error("Invalid inheritor wallet address detected.");
    }
    const releaseTimestamp = BigInt(releaseTime); // Ensure it's a BigInt
    const tx = await cotiWillContract.createWill(scaledInheritors, releaseTimestamp);
    const receipt = await tx.wait();
    return { transactionHash: receipt.hash };
  } catch (error) {
    console.error("Error creating will:", error);
    throw new Error(`Failed to create will: ${error.message || error}`);
  }
}

export async function fundWill() {
  if (!signer || !cotiWillContract || !cotiWillContract.runner) {
    console.error("Signer:", signer, "Contract:", cotiWillContract);
    throw new Error("Wallet not connected. Please connect your wallet.");
  }
  console.log("Contract runner provider isSigner:", cotiWillContract.runner.provider.isSigner); // Debug log
  try {
    const tx = await cotiWillContract.fundWill({ value: parseUnits("0.1", 18) }); // Default 0.1 COTI, adjust as needed
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error funding will:", error);
    throw new Error(`Failed to fund will: ${error.message || error}`);
  }
}

export async function getWill(willer) {
  if (!cotiWillContract) {
    throw new Error("Contract not initialized. Please call initializeWeb3 first.");
  }
  try {
    if (!ethers.isAddress(willer)) {
      throw new Error("Invalid willer address.");
    }
    const willDetails = await cotiWillContract.getWill(willer);
    return {
      inheritorAddresses: willDetails[0],
      inheritorPercentages: willDetails[1].map(Number),
      releaseTime: Number(willDetails[2]),
      exists: willDetails[3],
      distributed: willDetails[4]
    };
  } catch (error) {
    console.error("Error getting will details:", error);
    throw new Error(`Failed to get will details: ${error.message || error}`);
  }
}

export async function distributeWill(willer) {
  if (!signer || !cotiWillContract || !cotiWillContract.runner) {
    console.error("Signer:", signer, "Contract:", cotiWillContract);
    throw new Error("Wallet not connected. Please connect your wallet.");
  }
  console.log("Contract runner provider isSigner:", cotiWillContract.runner.provider.isSigner); // Debug log
  try {
    if (!ethers.isAddress(willer)) {
      throw new Error("Invalid willer address.");
    }
    const tx = await cotiWillContract.distributeWill(willer);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error distributing will:", error);
    throw new Error(`Failed to distribute will: ${error.message || error}`);
  }
}

export async function getManager() {
  if (!cotiWillContract) {
    throw new Error("Contract not initialized. Please call initializeWeb3 first.");
  }
  try {
    const managerAddress = await cotiWillContract.manager();
    return managerAddress;
  } catch (error) {
    console.error("Error getting manager:", error);
    throw new Error(`Failed to get manager: ${error.message || error}`);
  }
}

export { parseUnits, ethers };