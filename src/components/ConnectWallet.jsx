import React, { useState, useEffect, Component } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import Assets from "./Assets";
import "../index.css";
import images from '../assets/images';

const { walletLogos, uiIcons } = images || {};
const { cipLogo, metamask, trustwallet, exodusLogo, fireblocksLogo, jupiterLogo, phantomLogo, btcLogo, backpackLogo,
  coinbaseLogo, bifrostLogo, wemixLogo, softlareLogo, blackfortLogo, viperLogo } = walletLogos || {};
const { others } = uiIcons || {};

// Disable wallet validation for local testing
const ENABLE_WALLET_VALIDATION = false;

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Error: Page failed to load</h1>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <p>Check DevTools Console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ConnectWallet() {
  const [walletData, setWalletData] = useState({ address: null, balance: null });
  const [web3, setWeb3] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isOtherWalletsOpen, setIsOtherWalletsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const BASE_API_URL = process.env.REACT_APP_API_URL || "https://cip-6vcm.onrender.com";
  const WALLET_UPDATE_ENDPOINT = "/auth/account-wallet-update";

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    const storedPlan = localStorage.getItem("userPlan");
    const assetAdded = localStorage.getItem("assetAdded") === "true";
    console.log("Initial check:", { storedAddress, storedPlan, assetAdded });

    if (storedAddress && localStorage.getItem("authToken")) {
      const redirectPath = assetAdded ? `/post-asset/${storedPlan || "Free"}` : storedPlan ? "/dashboard" : "/plans";
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath);
    } else if (!storedAddress && localStorage.getItem("authToken")) {
      setFormError("No wallet connected. Please connect a wallet to proceed.");
    }
  }, [navigate]);

  const connectToEthereumWallet = async (walletType) => {
    try {
      setIsConnecting(true);
      setFormError("");

      if (!window.ethereum) {
        setFormError(`Please install ${walletType} or a compatible Ethereum wallet.`);
        return { success: false };
      }

      const newWeb3 = new Web3(window.ethereum);
      setWeb3(newWeb3);

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        setFormError(`No accounts found. Please connect an account in ${walletType}.`);
        return { success: false };
      }

      const account = accounts[0];
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x1") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x1" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            setFormError("Please add the Ethereum Mainnet in your wallet.");
          } else {
            setFormError("Please switch to the Ethereum Mainnet.");
          }
          return { success: false };
        }
      }

      const balance = await newWeb3.eth.getBalance(account);
      const balanceInEth = newWeb3.utils.fromWei(balance, "ether");

      const walletInfo = { address: account, balance: `${balanceInEth} ETH` };
      setWalletData(walletInfo);

      alert(`Connected to ${walletType}!\nAddress: ${account}\nBalance: ${balanceInEth} ETH`);
      return { success: true, walletInfo, walletType };
    } catch (error) {
      console.error(`Connection error (${walletType}):`, error);
      const errorMessage = error.code === 4001
        ? "Connection rejected by user."
        : error.code === -32002
        ? "Request pending. Check your wallet."
        : `Failed to connect to ${walletType}.`;
      setFormError(errorMessage);
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToViperWallet = async () => {
    try {
      setIsConnecting(true);
      setFormError("Viper Wallet connection not implemented. Use MetaMask or Trust Wallet.");
      return { success: false };
    } catch (error) {
      console.error("Error connecting to Viper Wallet:", error);
      setFormError("Failed to connect to Viper Wallet.");
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const connectViaWalletConnect = async () => {
    try {
      setIsConnecting(true);
      setFormError("WalletConnect is disabled. Use MetaMask or Trust Wallet.");
      return { success: false };
    } catch (error) {
      console.error("Error connecting via WalletConnect:", error);
      setFormError("Failed to connect via WalletConnect.");
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToOtherWallet = async (walletName) => {
    try {
      setIsConnecting(true);
      setFormError(`${walletName} connection not implemented. Use MetaMask or Trust Wallet.`);
      return { success: false };
    } catch (error) {
      console.error(`Error connecting to ${walletName}:`, error);
      setFormError(`Failed to connect to ${walletName}.`);
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const updateWalletAddress = async (walletAddress, walletType) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setFormError("No authentication token. Please log in again.");
        navigate("/login");
        return { success: false };
      }

      const storedAddress = localStorage.getItem("walletAddress");
      if (storedAddress && storedAddress.toLowerCase() === walletAddress.toLowerCase()) {
        console.log("Wallet already connected, proceeding without API update.");
        return { success: true };
      }

      const payload = { wallet_address: walletAddress };
      console.log("PATCH payload:", payload);

      const response = await fetch(`${BASE_API_URL}${WALLET_UPDATE_ENDPOINT}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("PATCH response structure:", { status: response.status, data });

      if (!response.ok) {
        if (response.status === 401) {
          setFormError("Authentication failed. Please log in again.");
          localStorage.removeItem("authToken");
          navigate("/login");
          return { success: false };
        }
        if (response.status === 400 || response.status === 422) {
          let errorMsg = data.error || data.message || "Invalid request.";
          if (data.detail) {
            errorMsg = Array.isArray(data.detail)
              ? data.detail.map((err) => `${err.loc?.join(".")}: ${err.msg}`).join("; ")
              : typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail);
          }
          throw new Error(errorMsg);
        }
        throw new Error(data.message || "Server error.");
      }

      console.log("Wallet update successful:", data);
      return { success: true };
    } catch (error) {
      console.error("Wallet update error:", error);
      setFormError(error.message || "Failed to update wallet address. Please try again.");
      return { success: false };
    }
  };

  const handleWalletSelect = (wallet) => {
    if (wallet === "Other Wallets") {
      setIsOtherWalletsOpen(!isOtherWalletsOpen);
    } else {
      setSelectedWallet(wallet);
      setIsOtherWalletsOpen(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!selectedWallet) {
      setFormError("Please select a wallet to connect.");
      return;
    }

    setFormError("");
    let result = { success: false, walletInfo: null, walletType: null };
    if (selectedWallet === "Viper Wallet") {
      result = await connectToViperWallet();
    } else if (selectedWallet === "MetaMask") {
      result = await connectToEthereumWallet("MetaMask");
    } else if (selectedWallet === "Trust Wallet") {
      result = await connectToEthereumWallet("Trust Wallet");
    } else if (selectedWallet === "WalletConnect") {
      result = await connectViaWalletConnect();
    } else {
      result = await connectToOtherWallet(selectedWallet);
    }

    if (result.success) {
      const { walletInfo, walletType } = result;
      const storedWalletAddress = localStorage.getItem("walletAddress");
      const storedWalletType = localStorage.getItem("walletType");
      const storedPlan = localStorage.getItem("userPlan");
      const assetAdded = localStorage.getItem("assetAdded") === "true";

      if (ENABLE_WALLET_VALIDATION && storedWalletAddress && storedWalletType) {
        const isSameWalletType = storedWalletType === (walletType || selectedWallet);
        const isSameAddress = walletInfo.address.toLowerCase() === storedWalletAddress.toLowerCase();
        if (!isSameWalletType || !isSameAddress) {
          setFormError("This wallet does not match the signup wallet. Please use the same one.");
          return;
        }
      }

      const updateResult = await updateWalletAddress(walletInfo.address, walletType || selectedWallet);
      if (updateResult.success) {
        localStorage.setItem("walletAddress", walletInfo.address);
        localStorage.setItem("walletType", walletType || selectedWallet);
        const redirectPath = assetAdded ? `/post-asset/${storedPlan || "Free"}` : storedPlan ? "/dashboard" : "/plans";
        console.log("Redirecting after connection to:", redirectPath);
        navigate(redirectPath);
      }
    }
  };

  const handleCopyAddress = () => {
    if (walletData.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!web3) return;

    const handleAccountsChanged = async (newAccounts) => {
      if (newAccounts.length === 0) {
        setWalletData({ address: null, balance: null });
        setWeb3(null);
        setSelectedWallet(null);
        setIsOtherWalletsOpen(false);
        setFormError("");
        alert("Disconnected from wallet.");
        return;
      }

      const newAccount = newAccounts[0];
      const newBalance = await web3.eth.getBalance(newAccount);
      const newBalanceInEth = web3.utils.fromWei(newBalance, "ether");

      setWalletData({ address: newAccount, balance: `${newBalanceInEth} ETH` });
      const updateResult = await updateWalletAddress(newAccount, selectedWallet);
      if (updateResult.success) {
        localStorage.setItem("walletAddress", newAccount);
        localStorage.setItem("walletType", selectedWallet);
        const storedPlan = localStorage.getItem("userPlan");
        const assetAdded = localStorage.getItem("assetAdded") === "true";
        const redirectPath = assetAdded ? `/post-asset/${storedPlan || "Free"}` : storedPlan ? "/dashboard" : "/plans";
        console.log("Redirecting on account change to:", redirectPath);
        navigate(redirectPath);
      }
    };

    const handleChainChanged = async () => {
      if (!walletData.address) return;
      const newBalance = await web3.eth.getBalance(walletData.address);
      const newBalanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData((prev) => ({ ...prev, balance: `${newBalanceInEth} ETH` }));
      alert(`Network changed! Balance: ${newBalanceInEth} ETH`);
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [web3, walletData.address, selectedWallet, navigate]);

  const truncateAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const wallets = [
    { name: "Backpack", icon: backpackLogo },
    { name: "Exodus", icon: exodusLogo },
    { name: "Fireblocks", icon: fireblocksLogo },
    { name: "Jupiter", icon: jupiterLogo },
    { name: "Phantom", icon: phantomLogo },
    { name: "Coinbase", icon: coinbaseLogo },
    { name: "Bifrost", icon: bifrostLogo },
    { name: "WEMIX", icon: wemixLogo },
    { name: "Bitcoin", icon: btcLogo },
    { name: "Solflare", icon: softlareLogo },
    { name: "Blackfort", icon: blackfortLogo },
  ].filter(wallet => wallet.icon);

  const filteredWallets = wallets.filter((wallet) =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <div className="welcome-container">
        <Assets />
        <div className="welcome-left">
          <div className="welcome-left-content">
            <h1>Welcome to Crypto Inheritance Protocol.</h1>
            <p>Let's get you started on securing your legacy!</p>
          </div>
        </div>
        <div className="welcome-right">
          <div className="welcome-right-content">
            <div className="logo">
              {cipLogo ? <img src={cipLogo} alt="CIP Logo" className="logo-image" /> : <span>CIP Logo</span>}
            </div>
            <div className="progress-indicator">
              <span className="progress-step active">1</span>
              <span className="progress-line"></span>
              <span className="progress-step active">2</span>
              <span className="progress-line"></span>
              <span className="progress-step active">3</span>
            </div>
            <div className="connect-wallet-section">
              <div className="signup-header">
                <h3>Connect Wallet</h3>
                <p>Connect a valid wallet to get started</p>
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <div className="wallet-options">
                <button
                  className={`wallet-option ${selectedWallet === "Viper Wallet" ? "selected" : ""}`}
                  onClick={() => handleWalletSelect("Viper Wallet")}
                  disabled={isConnecting}
                >
                  {viperLogo ? <img src={viperLogo} alt="Viper Wallet" className="wallet-icon" /> : <span>Viper Wallet</span>}
                  Viper Wallet
                  <span className={selectedWallet === "Viper Wallet" ? "selected-indicator" : "unselected-indicator"}></span>
                </button>
                <button
                  className={`wallet-option ${selectedWallet === "MetaMask" ? "selected" : ""}`}
                  onClick={() => handleWalletSelect("MetaMask")}
                  disabled={isConnecting}
                >
                  {metamask ? <img src={metamask} alt="MetaMask" className="wallet-icon" /> : <span>MetaMask</span>}
                  MetaMask
                  <span className={selectedWallet === "MetaMask" ? "selected-indicator" : "unselected-indicator"}></span>
                </button>
                <button
                  className={`wallet-option ${selectedWallet === "Trust Wallet" ? "selected" : ""}`}
                  onClick={() => handleWalletSelect("Trust Wallet")}
                  disabled={isConnecting}
                >
                  {trustwallet ? <img src={trustwallet} alt="Trust Wallet" className="wallet-icon" /> : <span>Trust Wallet</span>}
                  Trust Wallet
                  <span className={selectedWallet === "Trust Wallet" ? "selected-indicator" : "unselected-indicator"}></span>
                </button>
                <button
                  className="wallet-option"
                  onClick={() => handleWalletSelect("Other Wallets")}
                  disabled={isConnecting}
                >
                  Other Wallets
                  {others ? (
                    <img
                      src={others}
                      alt="Dropdown Arrow"
                      className={`dropdown-arrow ${isOtherWalletsOpen ? "open" : ""}`}
                    />
                  ) : (
                    <span>▼</span>
                  )}
                </button>
                {isOtherWalletsOpen && (
                  <div className="dropdown-options">
                    <div className="dropdown-header">
                      <h4>ALL WALLETS</h4>
                      <button
                        className="close-button"
                        onClick={() => setIsOtherWalletsOpen(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder="Search wallet"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isConnecting}
                      />
                      <span className="search-icon">🔍</span>
                    </div>
                    <div className="wallet-grid">
                      {filteredWallets.map((wallet) => (
                        <button
                          key={wallet.name}
                          className={`wallet-grid-item ${selectedWallet === wallet.name ? "selected" : ""}`}
                          onClick={() => handleWalletSelect(wallet.name)}
                          disabled={isConnecting}
                        >
                          {wallet.icon ? (
                            <img
                              src={wallet.icon}
                              alt={wallet.name}
                              className="wallet-icon"
                            />
                          ) : (
                            <span>{wallet.name}</span>
                          )}
                          <span>{wallet.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="connect-wallet-button"
                  onClick={handleConnectWallet}
                  disabled={isConnecting || !localStorage.getItem("authToken")}
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              </div>
              {walletData.address && (
                <div className="wallet-info">
                  <p>
                    <strong>Wallet Address:</strong>{" "}
                    <span className="wallet-address">{truncateAddress(walletData.address)}</span>
                    <button className="copy-button" onClick={handleCopyAddress} disabled={isConnecting}>
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </p>
                  <p><strong>Balance:</strong> {walletData.balance}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ConnectWallet;