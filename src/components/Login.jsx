import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Web3 from "web3";
import Assets from "./Assets";
import "../index.css";
import walletConnectLogo from "../../public/assets/images/walletconnect-logo.png";

// Enable wallet validation during login
const ENABLE_WALLET_VALIDATION = true;

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [walletData, setWalletData] = useState({
    address: null,
    balance: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("handleLogin triggered");
    console.log("Form Data:", formData);

    setFormError("");

    // Retrieve stored user data from localStorage
    let storedUser;
    try {
      storedUser = JSON.parse(localStorage.getItem("user"));
      console.log("Stored User:", storedUser);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setFormError("Unable to access localStorage. Please disable private/incognito mode or adjust your browser's privacy settings (e.g., allow cookies and site data).");
      return;
    }

    if (!storedUser) {
      setFormError("No account found. Please sign up first.");
      console.log("Error: No account found");
      return;
    }

    if (storedUser.email !== formData.email || storedUser.password !== formData.password) {
      setFormError("Invalid email or password.");
      console.log("Error: Invalid email or password");
      console.log("Stored Email:", storedUser.email, "Entered Email:", formData.email);
      console.log("Stored Password:", storedUser.password, "Entered Password:", formData.password);
      return;
    }

    console.log("Credentials match, proceeding...");

    // Wallet validation (if enabled)
    if (ENABLE_WALLET_VALIDATION && walletData.address) {
      let storedWalletAddress, storedWalletType;
      try {
        storedWalletAddress = localStorage.getItem("walletAddress");
        storedWalletType = localStorage.getItem("walletType");
      } catch (error) {
        console.error("Error accessing localStorage for wallet data:", error);
        setFormError("Unable to validate wallet due to localStorage restrictions. Please adjust your browser settings.");
        return;
      }

      if (storedWalletAddress && storedWalletType) {
        const isSameWalletType = storedWalletType === "WalletConnect";
        const isSameAddress = walletData.address.toLowerCase() === storedWalletAddress.toLowerCase();

        if (!isSameWalletType || !isSameAddress) {
          setFormError("Connected wallet does not match the one used during signup. Please use the same wallet.");
          setWalletData({ address: null, balance: null });
          try {
            localStorage.removeItem("walletAddress");
            localStorage.removeItem("walletType");
          } catch (error) {
            console.error("Error removing wallet data from localStorage:", error);
          }
          return;
        }
      }
    }

    console.log("Login successful, setting localStorage and navigating...");
    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("hasLoggedInBefore", "true");
      console.log("localStorage set: isLoggedIn =", localStorage.getItem("isLoggedIn"));
    } catch (error) {
      console.error("Error setting localStorage:", error);
      setFormError("Login successful, but unable to save login state due to localStorage restrictions.");
      // Proceed with navigation even if localStorage fails
    }

    console.log("Attempting navigation to /connect-wallet...");
    try {
      navigate("/connect-wallet");
      console.log("Navigation to /connect-wallet triggered");
    } catch (error) {
      console.error("Navigation error:", error);
      setFormError("Error navigating after login. Please try again.");
    }
  };

  const connectToWalletConnect = async () => {
    try {
      setIsConnecting(true);

      const wcProvider = await EthereumProvider.init({
        projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
        chains: [1],
        showQrModal: true,
        methods: ["eth_requestAccounts", "eth_getBalance", "personal_sign"],
      });

      await wcProvider.connect();
      const address = wcProvider.accounts[0];

      const web3 = new Web3(wcProvider);
      const balance = await web3.eth.getBalance(address);
      const balanceInEth = web3.utils.fromWei(balance, "ether");

      setWalletData({
        address,
        balance: balanceInEth,
      });

      return { web3, address, wcProvider, walletType: "WalletConnect" };
    } catch (error) {
      setFormError(error.message || "Failed to connect to WalletConnect");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletConnectLogin = async () => {
    const result = await connectToWalletConnect();
    if (!result) return;

    const { web3, address, wcProvider, walletType } = result;

    try {
      let storedWalletAddress, storedWalletType;
      try {
        storedWalletAddress = localStorage.getItem("walletAddress");
        storedWalletType = localStorage.getItem("walletType");
      } catch (error) {
        console.error("Error accessing localStorage for wallet data:", error);
        throw new Error("Unable to validate wallet due to localStorage restrictions.");
      }

      if (!storedWalletAddress) {
        throw new Error("No wallet address found. Please sign up with WalletConnect first.");
      }

      if (ENABLE_WALLET_VALIDATION) {
        const isSameWalletType = storedWalletType === walletType;
        const isSameAddress = address.toLowerCase() === storedWalletAddress.toLowerCase();

        if (!isSameWalletType || !isSameAddress) {
          throw new Error("Wallet address or type does not match the registered wallet. Please use the same wallet you signed up with.");
        }
      }

      const message = `Login to Crypto Inheritance Protocol at ${new Date().toISOString()}`;
      const signature = await web3.eth.personal.sign(message, address, "");

      const recoveredAddress = await web3.eth.personal.ecRecover(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Invalid signature");
      }

      try {
        localStorage.setItem("walletAddress", address);
        localStorage.setItem("walletType", walletType);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("hasLoggedInBefore", "true");
      } catch (error) {
        console.error("Error setting localStorage for wallet login:", error);
        throw new Error("Unable to save wallet login state due to localStorage restrictions.");
      }

      navigate("/plans");

      wcProvider.on("disconnect", () => {
        setWalletData({ address: null, balance: null });
        try {
          localStorage.removeItem("walletAddress");
          localStorage.removeItem("walletType");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("hasLoggedInBefore");
        } catch (error) {
          console.error("Error removing localStorage on disconnect:", error);
        }
        navigate("/login");
      });
    } catch (error) {
      setFormError(error.message || "WalletConnect login failed");
      wcProvider.disconnect();
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

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
              <form>
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
                  <div className="forgot-password">
                    <span onClick={handleForgotPassword}>Forgotten Password?</span>
                  </div>
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="form-buttons">
                  <button
                    type="button"
                    className="get-started"
                    onClick={(e) => {
                      console.log("Button click triggered");
                      handleLogin(e);
                    }}
                  >
                    Login
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
                </div>
              )}
              {!walletData.address && (
                <div>
                  <button
                    className="walletconnect-signup"
                    onClick={handleWalletConnectLogin}
                    disabled={isConnecting}
                  >
                    <img
                      src={walletConnectLogo}
                      alt="WalletConnect"
                      className="walletconnect-icon"
                    />
                    {isConnecting ? "Connecting..." : "Login with WalletConnect"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
