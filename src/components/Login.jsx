import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Web3 from "web3";
import Assets from "./Assets";
import userDatabase from "../userDatabase"; // Fixed import path
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://cipbackend-two.vercel.app/api/auth";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        

      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store the token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('emailLoggedIn', data.user.email);
      localStorage.setItem('walletAddress', data.user.wallet);
      console.log("Navigation attempted to connect-wallet");
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      setFormError(error.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
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

    const { web3, address, wcProvider } = result;

    try {
      const message = `Login to Crypto Inheritance Protocol at ${new Date().toISOString()}`;
      const signature = await web3.eth.personal.sign(message, address, "");

      const recoveredAddress = await web3.eth.personal.ecRecover(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Invalid signature");
      }

      // Try to login with wallet address
      try {
        const walletEmail = `${address.toLowerCase()}@wallet.user`;
        const walletPassword = message + signature.slice(0, 10);
        
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: walletEmail,
            password: walletPassword
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          // Store the token in localStorage
          localStorage.setItem('authToken', data.token);
          navigate("/plans");
          return;
        }
      } catch (loginError) {
        // If login fails, we'll try to register the wallet
        console.log("Wallet login failed, trying registration");
      }

      // If login failed, try to register the wallet
      try {
        const walletEmail = `${address.toLowerCase()}@wallet.user`;
        const walletPassword = message + signature.slice(0, 10);
        
        const registerResponse = await fetch(`${API_URL}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: walletEmail,
            password: walletPassword,
            wallet: address
          }),
        });

        const registerData = await registerResponse.json();
        
        if (!registerResponse.ok && registerData.error !== "Email already exists") {
          throw new Error(registerData.error || "Failed to register wallet");
        }

        // Login after registration
        const loginResponse = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: walletEmail,
            password: walletPassword
          }),
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
          localStorage.setItem('authToken', loginData.token);
          navigate("/plans");
        } else {
          throw new Error(loginData.error || "Failed to login after registration");
        }
      } catch (error) {
        throw new Error(error.message || "Wallet registration failed");
      }

      // Set up disconnect event
      wcProvider.on("disconnect", () => {
        localStorage.removeItem('authToken');
        setWalletData({ address: null, balance: null });
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
  
  const handleSignUp = () => {
    navigate("/signup");
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
                    type="submit" 
                    className="get-started"
                    disabled={isSubmitting}
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
                </div>
              )}
              
              {!walletData.address && (
                <div className="wallet-connect-container">
                  <button
                    className="walletconnect-signup"
                    onClick={handleWalletConnectLogin}
                    disabled={isConnecting}
                  >
                    <img
                      src="/assets/walletconnect-logo.png"
                      alt="WalletConnect"
                      className="walletconnect-icon"
                    />
                    {isConnecting ? "Connecting..." : "Login with WalletConnect"}
                  </button>
                </div>
              )}
              
              <div className="signup-link">
                <p>Don't have an account?</p>
                <span onClick={handleSignUp} className="signup-text">Sign Up</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
