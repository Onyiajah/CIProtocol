import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";
import images from '../assets/images';  

const { walletLogos, uiIcons } = images;
const {cipLogo, cotiLogo, btcLogo} = walletLogos;

const {profile} = uiIcons;


function ReviewPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { asset, beneficiaries, triggerConditions } = location.state || {};

  // Get the stored plan from localStorage
  const storedPlan = localStorage.getItem("userPlan") || "Free";

  const wallet = "COTI";

  const addOrdinalSuffix = (day) => {
    if (day % 10 === 1 && day !== 11) return `${day}st`;
    if (day % 10 === 2 && day !== 12) return `${day}nd`;
    if (day % 10 === 3 && day !== 13) return `${day}rd`;
    return `${day}th`;
  };

  const formatTriggerConditions = () => {
    if (!triggerConditions) return "";

    // Check if triggerConditions is a string and parse accordingly
    if (typeof triggerConditions === "string") {
      if (triggerConditions.startsWith("Multi-Sig:")) {
        // Extract addresses after "Multi-Sig: "
        const addresses = triggerConditions.replace("Multi-Sig: ", "").trim();
        return `Multi-Sig${addresses ? ` - ${addresses}` : ""}`;
      }
      if (triggerConditions.startsWith("Inactivity:")) {
        // Extract date (e.g., "Inactivity: 2025-05-01"), allow for optional spaces
        const match = triggerConditions.match(/Inactivity:\s*(\d{4}-\d{2}-\d{2})/);
        if (match) {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) { // Check if date is valid
            const day = addOrdinalSuffix(date.getDate());
            const month = date.toLocaleString("en-US", { month: "short" });
            const year = date.getFullYear();
            return `Inactivity - ${day} ${month}, ${year}`;
          }
        }
        return "Inactivity";
      }
      if (triggerConditions.startsWith("Due Date:")) {
        // Extract date (e.g., "Due Date: 2025-05-01")
        const dateStr = triggerConditions.replace("Due Date: ", "").trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) { // Check if date is valid
          const day = addOrdinalSuffix(date.getDate());
          const month = date.toLocaleString("en-US", { month: "short" });
          const year = date.getFullYear();
          return `Due Date - ${day} ${month}, ${year}`;
        }
        return "Due Date";
      }
    }

    // Fallback for unexpected formats
    return triggerConditions.toString();
  };

  const handleConfirmClick = () => {
    const newPlan = {
      asset: asset || "N/A",
      beneficiaries: beneficiaries || [],
      triggerConditions: formatTriggerConditions() || "N/A",
    };

    const existingPlans = JSON.parse(localStorage.getItem("plans")) || [];
    const updatedPlans = [...existingPlans, newPlan];
    localStorage.setItem("plans", JSON.stringify(updatedPlans));

    navigate("/plan-details", { state: { plan: newPlan, planName: storedPlan } });
  };

  return (
    <div className="review-plan-page">
       <Assets /> {/* Preload all images */}
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
            {beneficiaries && beneficiaries.length > 0 ? (
              beneficiaries.map((beneficiary, index) => (
                <div
                  key={index}
                  className="review-item-content bordered-content"
                  style={{ width: "376px" }}
                >
                  <p className="beneficiary-address">
                    {beneficiary.walletAddress || "N/A"}
                  </p>
                </div>
              ))
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
            <button className="confirm-button" onClick={handleConfirmClick}>
              Confirm Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewPlan; 