import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets";
import "../index.css";
import images from '../assets/images';  
import { createWill, initializeWeb3, ethers } from '../utils/ContractInteraction.js';

const { walletLogos, uiIcons } = images;
const { cipLogo, cotiLogo, btcLogo } = walletLogos;
const { profile } = uiIcons;

function ReviewPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { asset, beneficiaries, triggerConditions } = location.state || {};
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  // Get the stored plan from localStorage
  const storedPlan = localStorage.getItem("userPlan") || "Free";

  const wallet = "COTI";

  // Initialize Web3 and get user address
  useEffect(() => {
    const init = async () => {
      try {
        const address = await initializeWeb3();
        if (address) setUserAddress(address);
      } catch (err) {
        setError("Failed to connect to wallet: " + err.message);
      }
    };
    init();
  }, []);

  const addOrdinalSuffix = (day) => {
    if (day % 10 === 1 && day !== 11) return `${day}st`;
    if (day % 10 === 2 && day !== 12) return `${day}nd`;
    if (day % 10 === 3 && day !== 13) return `${day}rd`;
    return `${day}th`;
  };

  const formatTriggerConditions = () => {
    if (!triggerConditions) return "";

    if (typeof triggerConditions === "string") {
      if (triggerConditions.startsWith("Multi-Sig:")) {
        const addresses = triggerConditions.replace("Multi-Sig: ", "").trim();
        return `Multi-Sig${addresses ? ` - ${addresses}` : ""}`;
      }
      if (triggerConditions.startsWith("Inactivity:")) {
        const match = triggerConditions.match(/Inactivity:\s*(\d{4}-\d{2}-\d{2})/);
        if (match) {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) {
            const day = addOrdinalSuffix(date.getDate());
            const month = date.toLocaleString("en-US", { month: "short" });
            const year = date.getFullYear();
            return `Inactivity - ${day} ${month}, ${year}`;
          }
        }
        return "Inactivity";
      }
      if (triggerConditions.startsWith("Due Date:")) {
        const dateStr = triggerConditions.replace("Due Date: ", "").trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const day = addOrdinalSuffix(date.getDate());
          const month = date.toLocaleString("en-US", { month: "short" });
          const year = date.getFullYear();
          return `Due Date - ${day} ${month}, ${year}`;
        }
        return "Due Date";
      }
    }

    return triggerConditions.toString();
  };

  const parseTriggerForBlockchain = () => {
    if (!triggerConditions) return { condition: null, value: null };

    if (typeof triggerConditions === "string") {
      if (triggerConditions.startsWith("Due Date:")) {
        const dateStr = triggerConditions.replace("Due Date: ", "").trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const timestamp = BigInt(Math.floor(date.getTime() / 1000)); // Unix timestamp in seconds
          return { condition: "due_date", value: timestamp };
        }
      } else if (triggerConditions.startsWith("Inactivity:")) {
        const match = triggerConditions.match(/Inactivity:\s*(\d{4}-\d{2}-\d{2})/);
        if (match) {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) {
            const timestamp = BigInt(Math.floor(date.getTime() / 1000)); // Unix timestamp in seconds
            return { condition: "inactivity", value: timestamp };
          }
        }
      }
    }
    return { condition: "unknown", value: null };
  };

  const handleConfirmClick = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      if (!userAddress) {
        setError("Wallet not connected. Please connect your wallet.");
        setIsSubmitting(false);
        return;
      }

      if (!asset || !beneficiaries || !triggerConditions) {
        setError("Missing required plan details: Asset, Beneficiaries, and Trigger Conditions are required.");
        setIsSubmitting(false);
        return;
      }

      // Format beneficiaries into inheritors for createWill
      const formattedBeneficiaries = beneficiaries.map((beneficiary, index) => {
        const walletAddress = typeof beneficiary === 'object' && beneficiary.walletAddress 
          ? beneficiary.walletAddress 
          : typeof beneficiary === 'string' 
            ? beneficiary 
            : null;
        if (!walletAddress || !ethers.isAddress(walletAddress)) {
          throw new Error(`Invalid beneficiary wallet address at index ${index}: ${walletAddress}`);
        }
        return {
          wallet: walletAddress,
          percentage: Math.floor(10000 / beneficiaries.length) // Basis points (e.g., 5000 for 50% with 2 beneficiaries)
        };
      });

      const { condition: trigger_condition, value: releaseTime } = parseTriggerForBlockchain();
      if (!trigger_condition || !releaseTime || trigger_condition === "unknown") {
        setError("Unsupported or invalid trigger condition. Only 'Due Date' or 'Inactivity' with a valid date is supported.");
        setIsSubmitting(false);
        return;
      }

      // Call createWill from ContractInteraction.js
      const txResult = await createWill(formattedBeneficiaries, releaseTime);
      console.log("Transaction Hash:", txResult.transactionHash);

      // Navigate to PlanDetails with the willer address
      const plan = {
        asset,
        beneficiaries: formattedBeneficiaries.map(b => ({ wallet_address: b.wallet, share_percentage: b.percentage / 100 })),
        triggerConditions,
      };
      navigate("/plan-details", { 
        state: { 
          plan, 
          planName: storedPlan, 
          willer: userAddress,
          transactionHash: txResult.transactionHash 
        } 
      });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-plan-page">
      <Assets />
      <div className="sidebar">
        <div className="logo">
          <img src={cipLogo} alt="CIP Logo" className="logo-image" />
        </div>
        <div className="sidebar-nav">
          <button
            className="sidebar-button dashboard-button active"
            onClick={() => navigate(`/post-asset/${storedPlan}`)}
          >
            <span className="icon houseline-icon"></span>
            Dashboard
          </button>
          <button
            className="sidebar-button plans-button"
            onClick={() => navigate("/plans")}
          >
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
            <span className="user-greeting">Hello, Afolabi12345</span>
            <img
              src={profile}
              alt="User Avatar"
              className="user-avatar"
            />
            <span className="dropdown-arrow"></span>
          </div>
        </div>

        <div className="step-indicator">
          <span className="step active">1</span>
          <span className="step-line"></span>
          <span className="step active">2</span>
          <span className="step-line"></span>
          <span className="step active">3</span>
          <span className="step-line"></span>
          <span className="step active">4</span>
          <span className="step-line"></span>
          <span className="step active">5</span>
        </div>

        <div className="review-plan-section">
          {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
          <h2 className="review-plan-heading">Let’s Review Your Plan</h2>
          <p className="review-plan-subheading">Confirm your details before creation.</p>

          <div className="review-item">
            <h3 className="review-item-title">Wallet</h3>
            <div className="review-item-content wallet-content">
              <img
                src={cotiLogo}
                alt="COTI Logo"
                className="wallet-icon"
              />
              <span className="wallet-name">{wallet || "N/A"}</span>
            </div>
          </div>

          <div className="review-item">
            <h3 className="review-item-title">Asset</h3>
            <div className="review-item-content asset-content">
              <img
                src={btcLogo}
                alt="BTC Logo"
                className="asset-icon"
              />
              <span className="asset-name">{asset || "N/A"}</span>
            </div>
          </div>

          <div className="review-item">
            <h3 className="review-item-title">Beneficiaries</h3>
            {beneficiaries && Array.isArray(beneficiaries) && beneficiaries.length > 0 ? (
              beneficiaries.map((beneficiary, index) => {
                const displayAddress = typeof beneficiary === 'object' && beneficiary.walletAddress 
                  ? beneficiary.walletAddress 
                  : typeof beneficiary === 'string' 
                    ? beneficiary 
                    : "Invalid Beneficiary Data";
                return (
                  <div
                    key={index}
                    className="review-item-content bordered-content"
                    style={{ width: "376px" }}
                  >
                    <p className="beneficiary-address">
                      {displayAddress || "N/A"}
                    </p>
                  </div>
                );
              })
            ) : (
              <div
                className="review-item-content bordered-content"
                style={{ width: "376px" }}
              >
                <p className="beneficiary-address">No beneficiaries added</p>
              </div>
            )}
          </div>

          <div className="review-item">
            <h3 className="review-item-title">Trigger Conditions</h3>
            <div
              className="review-item-content bordered-content"
              style={{ width: "201px" }}
            >
              <p className="trigger-conditions-text">{formatTriggerConditions() || "N/A"}</p>
            </div>
          </div>

          <div className="confirm-button-wrapper">
            <button
              className="confirm-button"
              onClick={handleConfirmClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewPlan;