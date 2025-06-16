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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const BASE_API_URL = process.env.REACT_APP_API_URL || "https://cip-6vcm.onrender.com";
  const SIGNUP_ENDPOINT = "/auth/create-user-request-otp";

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

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError("");

    const payload = {
      reg_type: "web2",
      email: formData.email.trim(),
      password: formData.password,
    };
    console.log("Web2 signup payload:", payload);
    console.log("Attempting POST to:", `${BASE_API_URL}${SIGNUP_ENDPOINT}`);

    try {
      let response;
      let retries = 3;
      let delay = 1000;

      for (let i = 0; i < retries; i++) {
        response = await fetch(`${BASE_API_URL}${SIGNUP_ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) break;

        if (response.status === 404) {
          console.log(`404 from ${BASE_API_URL}${SIGNUP_ENDPOINT}: Endpoint not found`);
          if (i === retries - 1) {
            setFormError("Signup endpoint not found. Please contact the backend team to verify the endpoint.");
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        if (response.status === 400 || response.status === 422) {
          const data = await response.json();
          console.log(`${response.status} Response Details:`, JSON.stringify(data, null, 2));
          const errorMsg = data.detail?.map((err) => `${err.loc.join(".")}: ${err.msg}`).join("; ") || data.error || data.message || "Invalid input.";
          if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("taken")) {
            setFormError("Email already registered. Please log in or use a different email.");
            navigate("/login");
            return;
          }
          setFormError(errorMsg);
          break;
        }

        if (response.status === 500) {
          setFormError("Server error occurred. Please try again later or contact support.");
          break;
        }

        throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      console.log("Web2 signup successful:", data);
      if (data.status === "New Account Created" || data.message?.toLowerCase().includes("created")) {
        alert(`Account created successfully! An OTP has been sent to ${formData.email}. Check your inbox (and spam/junk folder) or request a new one via the forgot password link on the login page if you don't see it.`);
      } else {
        alert("Account created, but no OTP confirmation received. Please check with support or request an OTP via the login page.");
      }
      navigate("/login");
    } catch (error) {
      let errorMessage = error.message || "An error occurred during signup. Please try again.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Unable to reach the server. Check your network or backend status.";
      }
      setFormError(errorMessage);
      console.error("Web2 signup error:", error, {
        url: `${BASE_API_URL}${SIGNUP_ENDPOINT}`,
        payload: payload,
      });
    } finally {
      setIsSubmitting(false);
    }
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

      // Fetch the public key for the account
      const publicKey = await web3.eth.getAccounts().then(async (accounts) => {
        const signature = await web3.eth.personal.sign("Get public key", address, "");
        const msgHash = web3.eth.accounts.hashMessage("Get public key");
        const recovered = web3.eth.accounts.recover(msgHash, signature);
        if (recovered.toLowerCase() === address.toLowerCase()) {
          return web3.eth.getAccounts().then(() => signature); // Simplified; actual public key retrieval depends on wallet
        }
        throw new Error("Failed to verify public key.");
      });

      setWalletData({
        address,
        balance: balanceInEth,
        publicKey,
      });

      return { web3, address, wcProvider, publicKey };
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

    const { address, wcProvider, publicKey } = result;

    try {
      let payload = {
        reg_type: "web3",
        wallet_address: address,
        public_key: publicKey,
      };
      console.log("Web3 signup payload (primary):", payload);
      console.log("Attempting POST to:", `${BASE_API_URL}${SIGNUP_ENDPOINT}`);

      let response;
      let retries = 3;
      let delay = 1000;

      for (let i = 0; i < retries; i++) {
        response = await fetch(`${BASE_API_URL}${SIGNUP_ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) break;

        if (response.status === 404) {
          console.log(`404 from ${BASE_API_URL}${SIGNUP_ENDPOINT}: Endpoint not found`);
          if (i === retries - 1) {
            setFormError("Signup endpoint not found. Please contact the backend team to verify the endpoint.");
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        if (response.status === 400 || response.status === 422) {
          const data = await response.json();
          console.log(`${response.status} Response Details:`, JSON.stringify(data, null, 2));
          const errorMsg = data.detail?.map((err) => `${err.loc.join(".")}: ${err.msg}`).join("; ") || data.error || data.message || "Invalid wallet details.";
          if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("taken")) {
            setFormError("Wallet already registered. Please log in.");
            navigate("/login");
            return;
          }
          setFormError(errorMsg);
          break;
        }

        if (response.status === 500) {
          setFormError("Server error occurred. Please try again later or contact support.");
          break;
        }

        throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) return;

      const data = await response.json();
      console.log("Web3 signup successful:", data);
      if (data.message) {
        alert(data.message);
      }
      if (data.access_token) {
        localStorage.setItem("authToken", data.access_token);
      }
      navigate("/plans");
    } catch (error) {
      let errorMessage = error.message || "WalletConnect signup failed. Please try again.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Unable to reach the server. Check your network or backend status.";
      }
      setFormError(errorMessage);
      console.error("Web3 signup error:", error, {
        url: `${BASE_API_URL}${SIGNUP_ENDPOINT}`,
        payload,
      });
      wcProvider.disconnect();
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
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isWeb2FormFilled = formData.email || formData.password || formData.confirmPassword;

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
            <img src="/assets/logo-1.png" alt="CIP Logo" className="logo-image" />
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
                    disabled={walletData.address !== null}
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
                    disabled={walletData.address !== null}
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
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l-1.47-1.47C14.27 17.64 13.17 18 12 18c-3.31 0-6-2.69-6-6 0-1.17.34-2.27.89-3.21L5.42 7.32C3.66 8.74 2.45 10.73 2.02 13c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-.43-2.27-1.64-4.26-3.4-5.68l-1.47-1.47C15.97 4.86 14.27 4.5 12 4.5zm0 2c1.17 0 2.27.34 3.21.89l-1.47 1.47C13.79 8.34 12.89 8 12 8c-2.21 0-4 1.79-4 4 0 .89.34 1.79.89 2.44l-1.47 1.47C6.27 14.97 5.5 13.67 5.5 12c0-3.31 2.69-6 6-6zm0 2c1.1 0 2 .9 2 2 0 .22-.04.43-.1.63l-2.53-2.53c.2-.06.41-.1 .63-.1zm-2 2c0-1.1 .9-2 2-2 .22 0 .43.04 .63.1L9.1 11.63c-.06-.2-.1-.41-.1-.63z"
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
                    disabled={walletData.address !== null}
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
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l-1.47-1.47C14.27 17.64 13.17 18 12 18c-3.31 0-6-2.69-6-6 0-1.17.34-2.27.89-3.21L5.42 7.32C3.66 8.74 2.45 10.73 2.02 13c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-.43-2.27-1.64-4.26-3.4-5.68l-1.47-1.47C15.97 4.86 14.27 4.5 12 4.5zm0 2c1.17 0 2.27.34 3.21.89l-1.47 1.47C13.79 8.34 12.89 8 12 8c-2.21 0-4 1.79-4 4 0 .89.34 1.79.89 2.44l-1.47 1.47C6.27 14.97 5.5 13.67 5.5 12c0-3.31 2.69-6 6-6zm0 2c1.1 0 2 .9 2 2 0 .22-.04.43-.1.63l-2.53-2.53c.2-.06.41-.1 .63-.1zm-2 2c0-1.1 .9-2 2-2 .22 0 .43.04 .63.1L9.1 11.63c-.06-.2-.1-.41-.1-.63z"
                          fill="#7E7E7E"
                        />
                      )}
                    </svg>
                  </span>
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="login-link">
                  <p>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} className="login-text">
                      Log In
                    </span>
                  </p>
                </div>
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
                <button
                  type="submit"
                  form="signup-form"
                  className="get-started"
                  disabled={isSubmitting || !isWeb2FormFilled}
                >
                  {isSubmitting ? "Processing..." : "Next"}
                </button>
                <div className="or-separator">Or</div>
                <button
                  className="walletconnect-signup"
                  onClick={handleWalletConnectSignUp}
                  disabled={isConnecting || isWeb2FormFilled}
                >
                  <img
                    src="/assets/walletconnect-logo.png"
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