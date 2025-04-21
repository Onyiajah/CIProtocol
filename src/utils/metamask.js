import { ethers } from "ethers";

export const connectMetaMask = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask to continue!");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);

    if (accounts.length === 0) {
      throw new Error("No accounts found. Please connect an account in MetaMask.");
    }

    const address = accounts[0];
    const signer = await provider.getSigner();

    return { provider, signer, address };
  } catch (error) {
    throw new Error(error.message || "Failed to connect to MetaMask.");
  }
};

export const signMessage = async (signer, message) => {
  try {
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    throw new Error(error.message || "Failed to sign message with MetaMask.");
  }
};