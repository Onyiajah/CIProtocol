import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Web3 from "web3";
import Assets from "./Assets";
import "../index.css";

function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [walletData, setWalletData] = useState({
    address: null,
    balance: null,
  });
  const [walletConnectProvider, setWalletConnectProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.email) {
      setFormError("Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match!");
      return false;
    }
    return true;
  };

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormError("");

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.email === formData.email) {
      setFormError("Email already exists. Please log in or use a different email.");
      return;
    }

    const user = {
      email: formData.email,
      password: formData.password,
    };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("hasLoggedInBefore", "false");

    navigate("/login");
  };

  const connectViaWalletConnect = async () => {
    try {
      setIsConnecting(true);

      const wcProvider = await EthereumProvider.init({
        projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
        chains: [1],
        showQrModal: true,
        methods: ["eth_requestAccounts", "eth_getBalance", "personal_sign"],
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

      return { web3, address, wcProvider };
    } catch (error) {
      setFormError(error.message || "Failed to connect to WalletConnect");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletConnectSignUp = async () => {
    const result = await connectViaWalletConnect();
    if (!result) return;

    const { web3, address, wcProvider } = result;

    try {
      const message = `Sign up for Crypto Inheritance Protocol at ${new Date().toISOString()}`;
      const signature = await web3.eth.personal.sign(message, address, "");

      const recoveredAddress = await web3.eth.personal.ecRecover(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Invalid signature");
      }

      const storedWalletAddress = localStorage.getItem("walletAddress");

      if (storedWalletAddress && storedWalletAddress.toLowerCase() === address.toLowerCase()) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("hasLoggedInBefore", "true");
        localStorage.setItem("walletAddress", address);
        navigate("/plans");
        return;
      }

      localStorage.setItem("walletAddress", address);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("hasLoggedInBefore", "false");

      navigate("/plans");
    } catch (error) {
      setFormError(error.message || "WalletConnect signup failed");
      wcProvider.disconnect();
    }
  };

  const handleDisconnect = async () => {
    if (walletConnectProvider) {
      await walletConnectProvider.disconnect();
      setWalletConnectProvider(null);
    }
    setWalletData({ address: null, balance: null });
    alert("Disconnected from wallet.");
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletData.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      const newBalanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData({
        address: newAccount,
        balance: newBalanceInEth,
      });
      alert(`Account changed!\nAddress: ${newAccount}\nBalance: ${newBalanceInEth} ETH`);
    };

    const handleChainChanged = async () => {
      if (!walletData.address) return;
      const web3 = new Web3(walletConnectProvider);
      const newBalance = await web3.eth.getBalance(walletData.address);
      const newBalanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData((prev) => ({
        ...prev,
        balance: newBalanceInEth,
      }));
      alert(`Network changed! New balance: ${newBalanceInEth} ETH`);
    };

    walletConnectProvider.on("accountsChanged", handleAccountsChanged);
    walletConnectProvider.on("chainChanged", handleChainChanged);

    return () => {
      walletConnectProvider.removeListener("accountsChanged", handleAccountsChanged);
      walletConnectProvider.removeListener("chainChanged", handleChainChanged);
    };
  }, [walletConnectProvider, walletData.address]);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
            <span className="progress-step">2</span>
            <span className="progress-line"></span>
            <span className="progress-step">3</span>
          </div>
          <div className="form-section">
            <div className="signup-header">
              <h3>SIGN UP</h3>
              <p>Let's create your account</p>
            </div>
            <div className="form-fields">
              <form id="signup-form" onSubmit={handleEmailSignUp}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Enter New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create New Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {showPassword ? (
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                          fill="#7E7E7E"
                        />
                      ) : (
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l-1.47-1.47C14.27 17.64 13.17 18 12 18c-3.31 0-6-2.69-6-6 0-1.17.34-2.27.89-3.21L5.42 7.32C3.66 8.74 2.45 10.73 2.02 13c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-.43-2.27-1.64-4.26-3.4-5.68l-1.47-1.47C15.97 4.86 14.27 4.5 12 4.5zm0 2c1.17 0 2.27.34 3.21.89l-1.47 1.47C13.79 8.34 12.89 8 12 8c-2.21 0-4 1.79-4 4 0 .89.34 1.79.89 2.44l-1.47 1.47C6.27 14.97 5.5 13.67 5.5 12c0-3.31 2.69-6 6-6zm0 2c1.1 0 2 .9 2 2 0 .22-.04.43-.1.63l-2.53-2.53c.2-.06.41-.1.63-.1zm-2 2c0-1.1.9-2 2-2 .22 0 .43.04.63.1L9.1 11.63c-.06-.2-.1-.41-.1-.63z"
                          fill="#7E7E7E"
                        />
                      )}
                    </svg>
                  </span>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {showConfirmPassword ? (
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                          fill="#7E7E7E"
                        />
                      ) : (
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l-1.47-1.47C14.27 17.64 13.17 18 12 18c-3.31 0-6-2.69-6-6 0-1.17.34-2.27.89-3.21L5.42 7.32C3.66 8.74 2.45 10.73 2.02 13c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-.43-2.27-1.64-4.26-3.4-5.68l-1.47-1.47C15.97 4.86 14.27 4.5 12 4.5zm0 2c1.17 0 2.27.34 3.21.89l-1.47 1.47C13.79 8.34 12.89 8 12 8c-2.21 0-4 1.79-4 4 0 .89.34 1.79.89 2.44l-1.47 1.47C6.27 14.97 5.5 13.67 5.5 12c0-3.31 2.69-6 6-6zm0 2c1.1 0 2 .9 2 2 0 .22-.04.43-.1.63l-2.53-2.53c.2-.06.41-.1.63-.1zm-2 2c0-1.1.9-2 2-2 .22 0 .43.04.63.1L9.1 11.63c-.06-.2-.1-.41-.1-.63z"
                          fill="#7E7E7E"
                        />
                      )}
                    </svg>
                  </span>
                </div>
                {formError && <p className="form-error">{formError}</p>}
              </form>
            </div>
            {walletData.address && (
              <div className="wallet-info">
                <p>
                  <strong>Wallet Address:</strong>{" "}
                  <span className="wallet-address">{truncateAddress(walletData.address)}</span>
                  <button className="copy-button" onClick={handleCopyAddress}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </p>
                <p>
                  <strong>Balance:</strong> {walletData.balance} ETH
                </p>
                <button className="disconnect-button" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </div>
            )}
            {!walletData.address && (
              <div className="form-buttons">
                <button type="submit" form="signup-form" className="get-started">
                  Next
                </button>
                <div className="or-separator">Or</div>
                <button
                  className="walletconnect-signup"
                  onClick={handleWalletConnectSignUp}
                  disabled={isConnecting}
                >
                  <img
                    src="/assets/images/walletconnect-logo.png"
                    alt="WalletConnect"
                    className="walletconnect-icon"
                  />
                  {isConnecting ? "Connecting..." : "Sign Up with WalletConnect"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
