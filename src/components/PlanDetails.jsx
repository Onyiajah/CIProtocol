import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";
import images from '../assets/images';  

const { walletLogos, uiIcons } = images;
const {cipLogo} = walletLogos;

const {profile} = uiIcons;

function PlanDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, planName } = location.state || {};

  const handleDeletePlan = () => {
    // Retrieve existing plans from local storage
    const existingPlans = JSON.parse(localStorage.getItem("plans")) || [];
    
    // Filter out the current plan (compare by asset, beneficiaries, and trigger conditions)
    const updatedPlans = existingPlans.filter(
      (p) =>
        p.asset !== plan.asset ||
        p.beneficiaries.length !== plan.beneficiaries.length ||
        p.triggerConditions !== plan.triggerConditions
    );

    // Save the updated plans back to local storage
    localStorage.setItem("plans", JSON.stringify(updatedPlans));

    // Navigate to PostAssetDashboard using the planName
    navigate(`/post-asset/${planName || "Free"}`);
  };

  if (!plan) {
    return (
      <div className="dashboard-page">
        <div className="sidebar">
          <div className="logo">
            <img src={cipLogo} alt="CIP Logo" className="logo-image" />
          </div>
          <div className="sidebar-nav">
            <button
              className="sidebar-button dashboard-button"
              onClick={() => navigate(`/dashboard/${planName || "Free"}`)}
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
            <h1 className="dashboard-title">Plan Details</h1>
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

          <div className="no-assets-section">
            <p className="no-assets-text">No plan details available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
       <Assets /> {/* Preload all images */}
      <div className="sidebar">
        <div className="logo">
          <img src={cipLogo} alt="CIP Logo" className="logo-image" />
        </div>
        <div className="sidebar-nav">
          <button
            className="sidebar-button dashboard-button active"
            onClick={() => navigate(`/post-asset/${planName || "Free"}`)}
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

        <div className="review-plan-section">
          <h2 className="review-plan-heading">Plan Details</h2>
          <div className="review-item">
            <h3 className="review-item-title">Asset</h3>
            <div className="review-item-content asset-content">
              <span className="asset-icon"></span>
              <span className="asset-name">{plan.asset}</span>
            </div>
          </div>

          <div className="review-item">
            <h3 className="review-item-title">Beneficiaries</h3>
            <div className="review-item-content bordered-content">
              {plan.beneficiaries && plan.beneficiaries.length > 0 ? (
                plan.beneficiaries.map((beneficiary, index) => (
                  <p key={index} className="beneficiary-address">
                    {beneficiary.walletAddress || "N/A"}
                  </p>
                ))
              ) : (
                <p className="beneficiary-address">No beneficiaries added</p>
              )}
            </div>
          </div>

          <div className="review-item">
            <h3 className="review-item-title">Trigger Conditions</h3>
            <div className="review-item-content bordered-content">
              <p className="trigger-conditions-text">{plan.triggerConditions}</p>
            </div>
          </div>

          <div className="confirm-button-wrapper">
            <button
              className="confirm-button"
              onClick={() => navigate(`/post-asset/${planName || "Free"}`)}
            >
              Back to Dashboard
            </button>
            <button
              className="confirm-button"
              onClick={handleDeletePlan}
              style={{ background: "#FF0000", marginLeft: "10px" }}
            >
              Delete Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanDetails; 
