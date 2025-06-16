import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Web3 from "web3";
import Assets from "./Assets";
import walletConnectLogo from "../../public/assets/images/walletconnect-logo.png"; // Ensure this path is correct
import "../index.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [walletData, setWalletData] = useState({
    address: null,
    balance: null,
  });
  const [walletConnectProvider, setWalletConnectProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const BASE_API_URL = process.env.REACT_APP_API_URL || "https://cip-6vcm.onrender.com";
  const WEB2_LOGIN_ENDPOINT = "/auth/token";
  const WEB3_LOGIN_ENDPOINT = "/auth/token-for-wallet-login";
  // New endpoint for user info
  const USER_INFO_ENDPOINT = "/auth/user-info";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  // Helper function to fetch comprehensive user data after initial authentication
  const fetchAndRedirectUser = async (token, loggedInWalletAddress = null) => {
    try {
      const userInfoResponse = await fetch(`${BASE_API_URL}${USER_INFO_ENDPOINT}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error("Failed to fetch user information after login.");
      }

      const userInfo = await userInfoResponse.json();
      console.log("User Info fetched:", userInfo);

      // Update localStorage with the latest user data from the user-info endpoint
      localStorage.setItem("walletAddress", userInfo.wallet || "");
      localStorage.setItem("userPlan", userInfo.plan_name || "");
      localStorage.setItem("assetAdded", userInfo.has_assets ? "true" : "false");

      // Determine redirection path based on fetched user info
      let redirectPath;
      if (userInfo.has_assets) {
        redirectPath = `/post-asset/${userInfo.plan_name || "Free"}`;
      } else if (userInfo.has_plan) {
        // User has a plan but no assets.
        // If no wallet is currently associated with the user, navigate to connect wallet.
        // Otherwise, navigate to add assets for the selected plan.
        if (!userInfo.wallet) {
          redirectPath = "/connect-wallet";
        } else {
          redirectPath = `/add-asset/${userInfo.plan_name || "Free"}`; // Navigate to AddAsset with plan
        }
      } else {
        // No plan selected yet
        redirectPath = "/plans";
      }

      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath);

    } catch (error) {
      console.error("Error fetching user info or redirecting:", error);
      setFormError(error.message || "Could not retrieve full user information. Please try again.");
      // If fetching user info fails, clear auth token and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("userPlan");
      localStorage.removeItem("assetAdded");
      navigate("/login");
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const form = new URLSearchParams();
      form.append("email", formData.email);
      form.append("password", formData.password);
      if (formData.otp) form.append("otp", formData.otp);

      console.log("Web2 login payload:", Object.fromEntries(form));
      const response = await fetch(`${BASE_API_URL}${WEB2_LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          const errorMsg =
            data.detail?.map((err) => `${err.loc.join(".")}: ${err.msg}`).join("; ") ||
            data.error ||
            data.message ||
            "Invalid email, password, or OTP.";
          setFormError(errorMsg);
          return;
        }
        throw new Error(data.error || "Login failed");
      }

      // Store authentication token
      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("emailLoggedIn", formData.email);

      console.log("Web2 login successful, fetching user info for redirection...");
      await fetchAndRedirectUser(data.access_token);

    } catch (error) {
      let errorMessage = error.message || "Invalid email, password, or OTP.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Unable to reach the server. Check your network or backend status.";
      }
      setFormError(errorMessage);
      console.error("Web2 login error:", error, {
        url: `${BASE_API_URL}${WEB2_LOGIN_ENDPOINT}`,
        payload: Object.fromEntries(form),
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

  const handleWalletConnectLogin = async () => {
    const result = await connectViaWalletConnect();
    if (!result) return;

    const { address, wcProvider, web3 } = result;

    try {
      const message = `Login to Crypto Inheritance Protocol at ${new Date().toISOString()}`;
      const signature = await web3.eth.personal.sign(message, address, "");

      console.log("Web3 login payload:", { wallet_address: address, signature, message });
      const response = await fetch(`${BASE_API_URL}${WEB3_LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: address,
          signature,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          const errorMsg =
            data.detail?.map((err) => `${err.loc.join(".")}: ${err.msg}`).join("; ") ||
            data.error ||
            data.message ||
            "Invalid wallet details.";
          setFormError(errorMsg);
          return;
        }
        if (
          data.error?.toLowerCase().includes("not registered") ||
          data.message?.toLowerCase().includes("not found")
        ) {
          setFormError("Wallet not registered. Please sign up.");
          navigate("/signup");
          return;
        }
        throw new Error(data.error || "Wallet login failed");
      }

      // Store authentication token
      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("walletAddress", address); // Set the connected wallet address

      console.log("Web3 login successful, fetching user info for redirection...");
      await fetchAndRedirectUser(data.access_token, address);

    } catch (error) {
      let errorMessage = error.message || "WalletConnect login failed.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Unable to reach the server. Check your network or backend status.";
      }
      setFormError(errorMessage);
      console.error("Web3 login error:", error, {
        url: `${BASE_API_URL}${WEB3_LOGIN_ENDPOINT}`,
        payload: { wallet_address: address, signature, message },
      });
      wcProvider.disconnect();
    }
  };

  const handleDisconnect = async () => {
    if (walletConnectProvider) {
      await walletConnectProvider.disconnect();
      setWalletConnectProvider(null);
      setWalletData({ address: null, balance: null });
      localStorage.removeItem("authToken"); // Clear all relevant items on manual disconnect
      localStorage.removeItem("emailLoggedIn");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("userPlan");
      localStorage.removeItem("assetAdded");
      alert("Disconnected from wallet.");
      navigate("/login");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  // Effect for handling WalletConnect provider events (accountsChanged, chainChanged, disconnect)
  useEffect(() => {
    if (!walletConnectProvider) return;

    const handleAccountsChanged = async (newAccounts) => {
      if (newAccounts.length === 0) {
        setWalletData({ address: null, balance: null });
        setWalletConnectProvider(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("emailLoggedIn");
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("userPlan");
        localStorage.removeItem("assetAdded");
        alert("Disconnected from wallet.");
        navigate("/login");
        return;
      }

      const newAccount = newAccounts[0];
      const web3 = new Web3(walletConnectProvider);
      const newBalance = await web3.eth.getBalance(newAccount);
      const balanceInEth = web3.utils.fromWei(newBalance, "ether");
      setWalletData((prev) => ({
        ...prev,
        address: newAccount,
        balance: balanceInEth,
      }));
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

    const onDisconnect = () => {
        setWalletData({ address: null, balance: null });
        setWalletConnectProvider(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("emailLoggedIn");
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("userPlan");
        localStorage.removeItem("assetAdded");
        alert("Disconnected from wallet.");
        navigate("/login");
    };

    walletConnectProvider.on("accountsChanged", handleAccountsChanged);
    walletConnectProvider.on("chainChanged", handleChainChanged);
    walletConnectProvider.on("disconnect", onDisconnect);

    return () => {
      walletConnectProvider.removeListener("accountsChanged", handleAccountsChanged);
      walletConnectProvider.removeListener("chainChanged", handleChainChanged);
      walletConnectProvider.removeListener("disconnect", onDisconnect);
    };
  }, [walletConnectProvider, walletData.address, navigate]);

  // Effect for disconnecting WalletConnect on component unmount
  useEffect(() => {
    return () => {
      if (walletConnectProvider) {
        // Disconnect only if it's still connected when component unmounts
        // This prevents issues if the provider was already disconnected by another event handler
        if (walletConnectProvider.connected) {
          walletConnectProvider.disconnect();
        }
      }
    };
  }, [walletConnectProvider]);

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
            <img src="/assets/logo-1.png" alt="CIP Logo" className="logo-image" />
          </div>
          <div className="progress-indicator">
            <span className="progress-step active">1</span>
            <span className="progress-line"></span>
            <span className="progress-step active">2</span>
            <span className="progress-line"></span>
            <span className="progress-step">3</span>
          </div>
          <div className="form-section">
            <div className="signup-header">
              <h3>LOGIN</h3>
              <p>Enter your credentials to access your account</p>
            </div>
            <div className="form-fields">
              <form onSubmit={handleLogin}>
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
                  <label htmlFor="password">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter Password"
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
                </div>
                <div className="form-group">
                  <div className="forgot-password">
                    <span onClick={handleForgotPassword}>Forgotten Password?</span>
                  </div>
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="form-buttons">
                  <button
                    type="submit"
                    className="get-started"
                    disabled={isSubmitting || (!formData.email && !formData.password)}
                  >
                    {isSubmitting ? "Processing..." : "Login"}
                  </button>
                </div>
              </form>

              {walletData.address && (
                <div className="wallet-info">
                  <p>
                    <strong>Wallet Address:</strong>{" "}
                    <span className="wallet-address">{truncateAddress(walletData.address)}</span>
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
                <div className="wallet-connect-container">
                  <button
                    className="walletconnect-signup"
                    onClick={handleWalletConnectLogin}
                    disabled={isConnecting || formData.email || formData.password || formData.otp}
                  >
                    <img
                      src={walletConnectLogo} // Using imported logo
                      alt="WalletConnect"
                      className="walletconnect-icon"
                    />
                    {isConnecting ? "Connecting..." : "Login with WalletConnect"}
                  </button>
                </div>
              )}

              <div className="signup-link">
                <p>Don't have an account?</p>
                <span onClick={handleSignUp} className="signup-text">
                  Sign Up
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;