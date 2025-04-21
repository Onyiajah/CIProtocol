import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import Assets from "./Assets";
import "../index.css";
import backpacklogo from "../../public/assets/images/backpack-logo.png";
import exoduslogo from "../../public/assets/images/exodus-logo.png";
import fireblockslogo from "../../public/assets/images/fireblocks-logo.png";
import jupiterlogo from "../../public/assets/images/jupiter-logo.png";
import phantomlogo from "../../public/assets/images/phantom-logo.png";
import coinbasewalletlogo from "../../public/assets/images/coinbase-wallet-logo.png";
import bifrostlogo from "../../public/assets/images/bifrost-logo.png";
import wemixlogo from "../../public/assets/images/wemix-logo.png";
import btclogo from "../../public/assets/images/btc-logo.png";
import solflarelogo from "../../public/assets/images/solflare-logo.png";
import blackfortlogo from "../../public/assets/images/blackfort-logo.png";



// Enable wallet validation
const ENABLE_WALLET_VALIDATION = true;

function ConnectWallet() {
  const [walletData, setWalletData] = useState({
    address: null,
    balance: null,
  });
  const [web3, setWeb3] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("COTI");
  const [isOtherWalletsOpen, setIsOtherWalletsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const connectToEthereumWallet = async (walletType) => {
    try {
      setIsConnecting(true);

      if (!window.ethereum) {
        alert(`Please install ${walletType} to continue!`);
        return { success: false };
      }

      const isTrustWallet = walletType === "Trust Wallet" && window.ethereum.isTrust;
      console.log(`Connecting to ${walletType}${isTrustWallet ? " (Trust Wallet detected)" : ""}`);

      const newWeb3 = new Web3(window.ethereum);
      setWeb3(newWeb3);

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length === 0) {
        alert(`No accounts found. Please connect an account in ${walletType}.`);
        return { success: false };
      }

      const account = accounts[0];
      const balance = await newWeb3.eth.getBalance(account);
      const balanceInEth = newWeb3.utils.fromWei(balance, "ether");

      const walletInfo = {
        address: account,
        balance: `${balanceInEth} ETH`,
      };

      setWalletData(walletInfo);

      const message = `Connecting wallet to Crypto Inheritance Protocol via ${walletType} on ${new Date().toISOString()}`;
      const signature = await newWeb3.eth.personal.sign(message, account, "");

      alert(
        `Connected to ${walletType}!\nAddress: ${account}\nBalance: ${balanceInEth} ETH\nSigned Message: ${message}\nSignature: ${signature}`
      );

      console.log("Signed Message:", message);
      console.log("Signature:", signature);
      console.log("Address:", account);

      return { success: true, walletInfo, walletType };
    } catch (error) {
      console.error(`Error connecting to ${walletType}:`, error);
      alert(`Failed to connect to ${walletType}. Please try again.`);
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToCOTI = async () => {
    try {
      setIsConnecting(true);
      alert("Connecting to COTI wallet... (Placeholder implementation)");
      
      const walletInfo = {
        address: "coti1exampleaddress1234567890abcdef",
        balance: "100 COTI",
      };

      setWalletData(walletInfo);

      alert(`Connected to COTI!\nAddress: ${walletInfo.address}\nBalance: ${walletInfo.balance}`);
      return { success: true, walletInfo, walletType: "COTI" };
    } catch (error) {
      console.error("Error connecting to COTI:", error);
      alert("Failed to connect to COTI. Please try again.");
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const connectViaWalletConnect = async () => {
    try {
      setIsConnecting(true);
      alert("WalletConnect is disabled for this test as no projectId is provided. Please use MetaMask or Trust Wallet.");
      return { success: false };
    } catch (error) {
      console.error("Error connecting via WalletConnect:", error);
      alert("Failed to connect via WalletConnect. Please try again.");
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToOtherWallet = async (walletName) => {
    try {
      setIsConnecting(true);
      alert(`${walletName} connection not implemented yet. Please use MetaMask, Trust Wallet, or COTI (placeholder) for this test.`);
      return { success: false };
    } catch (error) {
      console.error(`Error connecting to ${walletName}:`, error);
      alert(`Failed to connect to ${walletName}. Please try again.`);
      return { success: false };
    } finally {
      setIsConnecting(false);
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
      alert("Please select a wallet to connect.");
      return;
    }

    let result = { success: false, walletInfo: null, walletType: null };
    if (selectedWallet === "MetaMask") {
      result = await connectToEthereumWallet("MetaMask");
    } else if (selectedWallet === "Trust Wallet") {
      result = await connectToEthereumWallet("Trust Wallet");
    } else if (selectedWallet === "COTI") {
      result = await connectToCOTI();
    } else if (selectedWallet === "WalletConnect") {
      result = await connectViaWalletConnect();
    } else {
      result = await connectToOtherWallet(selectedWallet);
    }

    if (result.success) {
      const { walletInfo, walletType } = result;
      const storedWalletAddress = localStorage.getItem("walletAddress");
      const storedWalletType = localStorage.getItem("walletType");

      // Validate wallet against signup wallet
      if (ENABLE_WALLET_VALIDATION && storedWalletAddress && storedWalletType) {
        const isSameWalletType = storedWalletType === (walletType || selectedWallet);
        const isSameAddress = walletInfo.address.toLowerCase() === storedWalletAddress.toLowerCase();

        if (!isSameWalletType || !isSameAddress) {
          alert("This wallet does not match the one used during signup. Please use the same wallet.");
          handleDisconnect();
          return;
        }
      }

      // Store wallet info and navigate to plans
      localStorage.setItem("walletAddress", walletInfo.address);
      localStorage.setItem("walletType", walletType || selectedWallet);
      navigate("/plans");
    }
  };

  const handleDisconnect = async () => {
    setWalletData({ address: null, balance: null });
    setWeb3(null);
    setSelectedWallet(null);
    setIsOtherWalletsOpen(false);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    alert("Disconnected from wallet.");
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletData.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!web3) return;

    const handleAccountsChanged = async (newAccounts) => {
      if (newAccounts.length === 0) {
        setWalletData({ address: null, balance: null });
        setWeb3(null);
        setSelectedWallet(null);
        setIsOtherWalletsOpen(false);
        alert("Disconnected from wallet.");
        return;
      }

      const newAccount = newAccounts[0];
      const newBalance = await web3.eth.getBalance(newAccount);
      const newBalanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData({
        address: newAccount,
        balance: `${newBalanceInEth} ETH`,
      });
      alert(`Account changed!\nAddress: ${newAccount}\nBalance: ${newBalanceInEth} ETH`);
    };

    const handleChainChanged = async () => {
      if (!walletData.address) return;
      const newBalance = await web3.eth.getBalance(walletData.address);
      const newBalanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData((prev) => ({
        ...prev,
        balance: `${newBalanceInEth} ETH`,
      }));
      alert(`Network changed! New balance: ${newBalanceInEth} ETH`);
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
  }, [web3, walletData.address]);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const wallets = [
    { name: "Backpack", icon: {backpacklogo}},
    { name: "Exodus", icon: {exoduslogo}},
    { name: "Fireblocks", icon: {fireblockslogo}},
    { name: "Jupiter", icon: {jupiterlogo} },
    { name: "Phantom", icon: {phantomlogo} },
    { name: "Coinbase", icon: {coinbasewalletlogo} },
    { name: "Bifrost", icon: {bifrostlogo} },
    { name: "WEMIX", icon: {wemixlogo}},
    { name: "Bitcoin", icon: {btclogo} },
    { name: "Solflare", icon: {solflarelogo} },
    { name: "Blackfort", icon: {blackfortlogo} },
  ];

  const filteredWallets = wallets.filter((wallet) =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
            <img src="/assets/images/logo-1.png" alt="CIP Logo" className="logo-image" />
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
            {walletData.address ? (
              <div className="wallet-info">
                <p>
                  <strong>Wallet Address:</strong>{" "}
                  <span className="wallet-address">{truncateAddress(walletData.address)}</span>
                  <button className="copy-button" onClick={handleCopyAddress}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </p>
                <p><strong>Balance:</strong> {walletData.balance}</p>
                <button className="disconnect-button" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="wallet-options">
                <button
                  className={`wallet-option ${selectedWallet === "COTI" ? "selected" : ""}`}
                  onClick={() => handleWalletSelect("COTI")}
                >
                  <img src="/assets/images/coti-logo.png" alt="COTI" className="wallet-icon" />
                  COTI
                  <span className={selectedWallet === "COTI" ? "selected-indicator" : "unselected-indicator"}></span>
                </button>
                <button
                  className={`wallet-option ${selectedWallet === "MetaMask" ? "selected" : ""}`}
                  onClick={() => handleWalletSelect("MetaMask")}
                >
                  <img src="/assets/images/metamask.png" alt="MetaMask" className="wallet-icon" />
                  MetaMask
                  <span className={selectedWallet === "MetaMask" ? "selected-indicator" : "unselected-indicator"}></span>
                </button>
                <button
                  className={`wallet-option ${selectedWallet === "Trust Wallet" ? "selected" : ""}`}
                  onClick={() => handleWalletSelect("Trust Wallet")}
                >
                  <img src="/assets/images/trustwallet.png" alt="Trust Wallet" className="wallet-icon" />
                  Trust Wallet
                  <span className={selectedWallet === "Trust Wallet" ? "selected-indicator" : "unselected-indicator"}></span>
                </button>
                <button
                  className="wallet-option"
                  onClick={() => handleWalletSelect("Other Wallets")}
                >
                  Other Wallets
                  <img
                    src="/assets/images/others.png"
                    alt="Dropdown Arrow"
                    className={`dropdown-arrow ${isOtherWalletsOpen ? "open" : ""}`}
                  />
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
                      />
                      <span className="search-icon">🔍</span>
                    </div>
                    <div className="wallet-grid">
                      {filteredWallets.map((wallet) => (
                        <button
                          key={wallet.name}
                          className={`wallet-grid-item ${selectedWallet === wallet.name ? "selected" : ""}`}
                          onClick={() => handleWalletSelect(wallet.name)}
                        >
                          <img
                            src={wallet.icon}
                            alt={wallet.name}
                            className="wallet-icon"
                          />
                          <span>{wallet.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="connect-wallet-button"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectWallet;