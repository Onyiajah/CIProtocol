import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Web3 from "web3";
import Assets from "./Assets";
import "../index.css";
import images from '../assets/images';

const { walletLogos, uiIcons } = images || {};
const { cipLogo } = walletLogos || {};
const { profile, others } = uiIcons || {};

function Dashboard() {
  const { planName: planNameFromParams } = useParams();
  const navigate = useNavigate();

  // State for user info and wallet connection
  const loggedonuser = localStorage.getItem("emailLoggedIn") || "User";
  const [userInfo, setUserInfo] = useState({
    walletAddress: localStorage.getItem("walletAddress") || "",
    plan: planNameFromParams || localStorage.getItem("userPlan") || "Free",
  });
  const [walletData, setWalletData] = useState({
    address: null,
    balance: null,
  });
  const [walletConnectProvider, setWalletConnectProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const BASE_API_URL = process.env.REACT_APP_API_URL || "https://cip-6vcm.onrender.com";
  const USER_INFO_ENDPOINT = "/auth/user-info";
  const WALLET_UPDATE_ENDPOINT = "/auth/account-wallet-update";

  // Fetch user info on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("No authentication token found. Please log in again.");
          navigate("/login");
          return;
        }

        const response = await fetch(`${BASE_API_URL}${USER_INFO_ENDPOINT}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please log in again.");
            localStorage.removeItem("authToken");
            navigate("/login");
            return;
          }
          throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setUserInfo({
          walletAddress: data.wallet_address || "",
          plan: data.plan || "Free",
        });

        // Update localStorage with latest info
        localStorage.setItem("walletAddress", data.wallet_address || "");
        localStorage.setItem("userPlan", data.plan || "Free");
      } catch (err) {
        setError(err.message || "Failed to load user information.");
        console.error("User info fetch error:", err);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // WalletConnect connection
  const connectViaWalletConnect = async () => {
    try {
      setIsConnecting(true);
      setError("");

      const wcProvider = await EthereumProvider.init({
        projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
        chains: [1],
        showQrModal: true,
        methods: ["eth_requestAccounts", "eth_getBalance"],
      });

      await wcProvider.connect();
      setWalletConnectProvider(wcProvider);

      const web3 = new Web3(wcProvider);
      const accounts = wcProvider.accounts;
      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      const address = accounts[0];
      const balance = await web3.eth.getBalance(address);
      const balanceInEth = web3.utils.fromWei(balance, "ether");

      setWalletData({
        address,
        balance: balanceInEth,
      });

      return { address, wcProvider };
    } catch (error) {
      setError(error.message || "Failed to connect to WalletConnect");
      console.error("WalletConnect error:", error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Update wallet address via API (PATCH request)
  const handleWalletUpdate = async () => {
    const result = await connectViaWalletConnect();
    if (!result) return;

    const { address, wcProvider } = result;

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("No authentication token found. Please log in again.");
        navigate("/login");
        return;
      }

      const payload = {
        wallet_address: address,
      };

      console.log("Wallet update payload:", payload);
      console.log("Attempting PATCH to:", `${BASE_API_URL}${WALLET_UPDATE_ENDPOINT}`);

      const response = await fetch(`${BASE_API_URL}${WALLET_UPDATE_ENDPOINT}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }
        if (response.status === 400 || response.status === 422) {
          const data = await response.json();
          console.log(`${response.status} Response Details:`, JSON.stringify(data, null, 2));
          const errorMsg = data.detail?.map((err) => `${err.loc.join(".")}: ${err.msg}`).join("; ") || data.error || data.message || "Invalid wallet address.";
          setError(errorMsg);
          return;
        }
        throw new Error(`Failed to update wallet: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUserInfo((prev) => ({
        ...prev,
        walletAddress: address,
      }));
      localStorage.setItem("walletAddress", address);
      alert("Wallet address updated successfully!");
      console.log("Wallet update successful:", data);
    } catch (error) {
      setError(error.message || "Failed to update wallet address.");
      console.error("Wallet update error:", error, {
        url: `${BASE_API_URL}${WALLET_UPDATE_ENDPOINT}`,
        payload,
      });
    } finally {
      if (wcProvider) {
        wcProvider.disconnect();
        setWalletConnectProvider(null);
        setWalletData({ address: null, balance: null });
      }
    }
  };

  const handleDisconnect = async () => {
    if (walletConnectProvider) {
      await walletConnectProvider.disconnect();
      setWalletConnectProvider(null);
      setWalletData({ address: null, balance: null });
      alert("Disconnected from wallet.");
    }
  };

  // Navigation handlers
  const handlePlansClick = () => {
    navigate("/plans");
  };

  const handleUpgradePlanClick = () => {
    navigate("/plans");
  };

  const handleAddAssetClick = () => {
    navigate("/add-asset");
  };

  const showUpgradePlanButton = userInfo.plan !== "Enterprise";

  // WalletConnect event listeners
  useEffect(() => {
    if (!walletConnectProvider) return;

    const handleAccountsChanged = async (newAccounts) => {
      if (newAccounts.length === 0) {
        setWalletData({ address: null, balance: null });
        setWalletConnectProvider(null);
        alert("Disconnected from wallet.");
        return;
      }

      const newAccount = newAccounts[0];
      const web3 = new Web3(walletConnectProvider);
      const newBalance = await web3.eth.getBalance(newAccount);
      const balanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData({
        address: newAccount,
        balance: balanceInEth,
      });
      alert(`Account changed!\nAddress: ${newAccount}\nBalance: ${balanceInEth} ETH`);
    };

    const handleChainChanged = async () => {
      if (!walletData.address) return;
      const web3 = new Web3(walletConnectProvider);
      const newBalance = await web3.eth.getBalance(walletData.address);
      const balanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData((prev) => ({
        ...prev,
        balance: balanceInEth,
      }));
      alert(`Network changed! New balance: ${balanceInEth} ETH`);
    };

    walletConnectProvider.on("accountsChanged", handleAccountsChanged);
    walletConnectProvider.on("chainChanged", handleChainChanged);

    return () => {
      walletConnectProvider.removeListener("accountsChanged", handleAccountsChanged);
      walletConnectProvider.removeListener("chainChanged", handleChainChanged);
    };
  }, [walletConnectProvider, walletData.address]);

  useEffect(() => {
    return () => {
      if (walletConnectProvider) {
        walletConnectProvider.disconnect();
      }
    };
  }, [walletConnectProvider]);

  const truncateAddress = (address) => {
    if (!address) return "Not connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>;
  }

  return (
    <div className="dashboard-page">
      <Assets />
      <div className="sidebar">
        <div className="logo">
          {cipLogo ? (
            <img src={cipLogo} alt="CIP Logo" className="logo-image" />
          ) : (
            <span>CIP Logo</span>
          )}
        </div>
        <div className="sidebar-nav">
          <button
            className="sidebar-button dashboard-button active"
            onClick={() => navigate(`/dashboard/${userInfo.plan}`)}
          >
            <span className="icon houseline-icon"></span>
            Dashboard
          </button>
          <button className="sidebar-button plans-button" onClick={handlePlansClick}>
            <span className="icon plans-icon"></span>
            Plans
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="user-info">
            <span className="bell-icon"></span>
            <span className="user-greeting">Hello, {loggedonuser}</span>
            {profile ? (
              <img src={profile} alt="User Avatar" className="user-avatar" />
            ) : (
              <span>Avatar</span>
            )}
            {others ? (
              <img src={others} alt="Dropdown Arrow" className="dropdown-arrow" />
            ) : (
              <span>▼</span>
            )}
          </div>
        </div>

        <div className="user-details">
          <p><strong>Current Plan:</strong> {userInfo.plan}</p>
          <p><strong>Wallet Address:</strong> {truncateAddress(userInfo.walletAddress)}</p>
          {walletData.address ? (
            <div className="wallet-info">
              <p><strong>Connected Wallet:</strong> {truncateAddress(walletData.address)}</p>
              <p><strong>Balance:</strong> {walletData.balance} ETH</p>
              <button className="disconnect-button" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button
              className="walletconnect-button"
              onClick={handleWalletUpdate}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : userInfo.walletAddress ? "Update Wallet" : "Connect Wallet"}
            </button>
          )}
        </div>

        {showUpgradePlanButton && (
          <button className="upgrade-plan-button" onClick={handleUpgradePlanClick}>
            <span className="upgrade-icon"></span>
            <span className="upgrade-text">Upgrade Plan</span>
          </button>
        )}

        <div className="no-assets-section">
          <div className="cloud-icon"></div>
          <p className="no-assets-text">You Don’t Have Any Asset Yet</p>
          <button className="add-asset-button" onClick={handleAddAssetClick}>
            Add Asset
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;