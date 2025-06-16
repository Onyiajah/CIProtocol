import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets";
import { getWill, fundWill, initializeWeb3 } from "../utils/ContractInteraction.js";
import images from '../assets/images';

const { walletLogos, uiIcons } = images;
const { cipLogo } = walletLogos;
const { profile } = uiIcons;

function PlanDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, planName, willer, transactionHash } = location.state || {};
  const [willDetails, setWillDetails] = useState(null);
  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWillDetails = async () => {
      if (!willer) return;
      setLoading(true);
      try {
        await initializeWeb3();
        const details = await getWill(willer);
        setWillDetails(details);
      } catch (error) {
        console.error("Fetch will error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWillDetails();
  }, [willer]);

  const handleFundWill = async () => {
    if (!willer) return;
    setFunding(true);
    setFundError(null);
    try {
      await initializeWeb3();
      const receipt = await fundWill();
      console.log("Funded will:", receipt.transactionHash);
      alert("Will funded successfully!");
    } catch (error) {
      setFundError(error.message || "Failed to fund will.");
    } finally {
      setFunding(false);
    }
  };

  if (!plan) {
    return (
      <div className="dashboard-page">
        {/* Same as original no-plan case */}
        <div className="sidebar">
          <div className="logo"><img src={cipLogo} alt="CIP Logo" className="logo-image" /></div>
          <div className="sidebar-nav">
            <button className="sidebar-button" onClick={() => navigate(`/dashboard/${planName || "Free"}`)}>Dashboard</button>
            <button className="sidebar-button" onClick={() => navigate("/plans")}>Plans</button>
          </div>
        </div>
        <div className="main-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Plan Details</h1>
            <div className="user-info">
              <span className="bell-icon"></span>
              <span className="user-greeting">Hello, Afolabi12345</span>
              <img src={profile} alt="User Avatar" className="user-avatar" />
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
      <Assets />
      <div className="sidebar">
        <div className="logo"><img src={cipLogo} alt="CIP Logo" className="logo-image" /></div>
        <div className="sidebar-nav">
          <button className="sidebar-button active" onClick={() => navigate(`/post-asset/${planName || "Free"}`)}>Dashboard</button>
          <button className="sidebar-button" onClick={() => navigate("/plans")}>Plans</button>
        </div>
      </div>
      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Plan Details</h1>
          <div className="user-info">
            <span className="bell-icon"></span>
            <span className="user-greeting">Hello, Afolabi12345</span>
            <img src={profile} alt="User Avatar" className="user-avatar" />
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
              {loading && <span>Loading will details...</span>}
              {willDetails && (
                <div className="asset-details">
                  <p>Exists: {willDetails.exists ? "Yes" : "No"}</p>
                  <p>Distributed: {willDetails.distributed ? "Yes" : "No"}</p>
                  <p>Release Time: {new Date(willDetails.releaseTime * 1000).toLocaleString()}</p>
                  <h4>Inheritors:</h4>
                  {willDetails.inheritorAddresses.map((addr, i) => (
                    <p key={i}>{addr} - {willDetails.inheritorPercentages[i] / 100}%</p>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="review-item">
            <h3 className="review-item-title">Beneficiaries</h3>
            <div className="review-item-content bordered-content">
              {plan.beneficiaries.map((beneficiary, index) => (
                <p key={index} className="beneficiary-address">
                  {beneficiary.wallet_address || "N/A"} - {beneficiary.share_percentage || "N/A"}%
                </p>
              ))}
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
              onClick={handleFundWill}
              disabled={funding}
              style={{ background: funding ? "#ccc" : "#28a745", marginLeft: "10px" }}
            >
              {funding ? "Funding..." : "Fund Will"}
            </button>
            {fundError && <p style={{ color: "red" }}>{fundError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanDetails;