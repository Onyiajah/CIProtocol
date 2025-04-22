import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";
import images from '../assets/images';  

const { walletLogos, uiIcons } = images;
const {cipLogo} = walletLogos;

const {profile} = uiIcons;


function Dashboard() {
  const { planName: planNameFromParams } = useParams();
  const navigate = useNavigate();

  // Use planName from params if available, otherwise fall back to localStorage
  const planName = planNameFromParams || localStorage.getItem("userPlan") || "Free";

  const handlePlansClick = () => {
    navigate("/plans");
  };

  const handleUpgradePlanClick = () => {
    navigate("/plans");
  };

  const handleAddAssetClick = () => {
    navigate("/add-asset");
  };

  const showUpgradePlanButton = planName !== "Enterprise";

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
            onClick={() => navigate(`/dashboard/${planName}`)}
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
            <span className="user-greeting">Hello, Afolabi12345</span>
            <img
              src={profile}
              alt="User Avatar"
              className="user-avatar"
            />
            <span className="dropdown-arrow"></span>
          </div>
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