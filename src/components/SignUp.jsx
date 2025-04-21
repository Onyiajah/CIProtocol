import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import "../index.css";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletData, setWalletData] = useState({
    address: null,
    balance: null,
  });
  const [selectedWallet, setSelectedWallet] = useState("COTI");
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const connectToEthereumWallet = async (walletType) => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        alert(`Please install ${walletType} to continue!`);
        return { success: false };
      }

      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length === 0) {
        alert(`No accounts found. Please connect an account in ${walletType}.`);
        return { success: false };
      }

      const account = accounts[0];
      const balance = await web3.eth.getBalance(account);
      const balanceInEth = web3.utils.fromWei(balance, "ether");

      const walletInfo = {
        address: account,
        balance: `${balanceInEth} ETH`,
      };

      setWalletData(walletInfo);
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
      return { success: true, walletInfo, walletType: "COTI" };
    } catch (error) {
      console.error("Error connecting to COTI:", error);
      alert("Failed to connect to COTI. Please try again.");
      return { success: false };
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    let result = { success: false, walletInfo: null, walletType: null };
    if (selectedWallet === "MetaMask") {
      result = await connectToEthereumWallet("MetaMask");
    } else if (selectedWallet === "COTI") {
      result = await connectToCOTI();
    } else {
      alert("Please select a wallet to connect.");
      return;
    }

    if (result.success) {
      localStorage.setItem("walletAddress", result.walletInfo.address);
      localStorage.setItem("walletType", result.walletType || selectedWallet);
      localStorage.setItem("user", JSON.stringify({ email, password }));
      alert("Signup successful!");
      navigate("/connect-wallet");
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div>
        <h3>Connect Wallet</h3>
        <button onClick={() => setSelectedWallet("COTI")}>COTI</button>
        <button onClick={() => setSelectedWallet("MetaMask")}>MetaMask</button>
      </div>
      <button onClick={handleSignUp} disabled={isConnecting}>
        {isConnecting ? "Connecting..." : "Sign Up"}
      </button>
    </div>
  );
}

export default SignUp;