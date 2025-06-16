import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Assets from "./Assets";
import images from "../assets/images";
import "../index.css";

const { walletLogos, uiIcons } = images || {};
const { cipLogo } = walletLogos || {};
const { profile, others } = uiIcons || {};

function AddAsset() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState("");
  const [supportedAssets, setSupportedAssets] = useState([]);
  const [error, setError] = useState("");
  const loggedonuser = localStorage.getItem("emailLoggedIn") || "User";

  useEffect(() => {
    const fetchSupportedAssets = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No auth token found. Please log in again.");
          navigate("/login");
          return;
        }

        const response = await fetch("https://cip-6vcm.onrender.com/process/asset-supported", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please log in again.");
            localStorage.removeItem("authToken");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch supported assets");
        }

        const data = await response.json();
        console.log("API response:", data);
        setSupportedAssets(Array.isArray(data) ? data : ["BTC", "ETH", "COTI"]);
      } catch (err) {
        setError(err.message);
        setSupportedAssets(["BTC", "ETH", "COTI"]);
      }
    };

    fetchSupportedAssets();
  }, [navigate]);

  const handleAssetChange = (event) => {
    setSelectedAsset(event.target.value);
    console.log("Selected asset:", event.target.value);
  };

  const handleNextClick = () => {
    if (!selectedAsset) {
      alert("Please select an asset before proceeding.");
      return;
    }
    navigate("/add-beneficiaries", { state: { asset: selectedAsset } });
  };

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>;
  }

  return (
    <div className="add-asset-page">
      <Assets />
      <div className="sidebar">
        <div className="logo">
          {cipLogo ? (
            <img src={cipLogo} alt="CIP Logo" className="logo-image" />
          ) : (
            <span>CIP Logo</span>
          )}
        </div>
        <div className="sidebar-nav">
          <button
            className="sidebar-button dashboard-button active"
            onClick={() => navigate("/dashboard/Free")}
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
          <h1 className="dashboard-title">Add Asset</h1>
          <div className="user-info">
            <span className="bell-icon"></span>
            <span className="user-greeting">Hello, {loggedonuser}</span>
            {profile ? (
              <img src={profile} alt="User Avatar" className="user-avatar" />
            ) : (
              <span>Avatar</span>
            )}
            {others ? (
              <img src={others} alt="Dropdown Arrow" className="dropdown-arrow" />
            ) : (
              <span>▼</span>
            )}
          </div>
        </div>

        <div className="step-indicator">
          <span className="step active">1</span>
          <span className="step-line"></span>
          <span className="step">2</span>
          <span className="step-line"></span>
          <span className="step">3</span>
          <span className="step-line"></span>
          <span className="step">4</span>
          <span className="step-line"></span>
          <span className="step">5</span>
        </div>

        <div className="select-asset-section">
          <h2 className="select-asset-heading">Select Your Asset</h2>
          <p className="select-asset-subheading">Choose the asset you want to add for inheritance.</p>
          <label className="asset-label">Select Asset</label>
          <select
            className="asset-dropdown"
            value={selectedAsset}
            onChange={handleAssetChange}
          >
            <option value="" disabled>
              Select
            </option>
            {supportedAssets.map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
          <div className="next-button-wrapper">
            <button className="next-button" onClick={handleNextClick}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAsset;