import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";
import images from '../assets/images';  

const { walletLogos, uiIcons } = images;
const { cipLogo } = walletLogos;
const { profile } = uiIcons;

function PostAssetDashboard() {
  const { planName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { newPlan, upgradedFromFree } = location.state || {};

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No authentication token found. Please log in again.");
          navigate("/login");
          return;
        }

        const url = "https://cip-6vcm.onrender.com/process/return-user-assets";
        console.log("Fetching user assets from:", url);
        console.log("Using token:", token);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.log("Error response:", errorData);
          throw new Error(
            `HTTP error! status: ${response.status} - ${
              errorData.message || errorData.error || "Unknown error"
            }`
          );
        }

        const data = await response.json();
        console.log("Fetched user assets:", data);

        // Map the assets array to the plans structure
        const formattedPlans = Array.isArray(data.assets)
          ? data.assets.map(asset => ({
              asset: asset.asset || asset.name || "Unknown Asset",
              beneficiaries: asset.beneficiaries || [],
              triggerConditions: asset.triggerConditions || asset.trigger || "No Trigger Condition",
            }))
          : [];

        // Update localStorage and state
        localStorage.setItem("plans", JSON.stringify(formattedPlans));
        setPlans(formattedPlans);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch user assets.");

        // Fallback to localStorage if API fails
        const storedPlans = JSON.parse(localStorage.getItem("plans")) || [];
        setPlans(storedPlans);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAssets();
  }, [navigate]);

  // Handle newPlan and upgrade logic in a separate useEffect
  useEffect(() => {
    let storedPlans = JSON.parse(localStorage.getItem("plans")) || [];

    if (newPlan) {
      const planExists = storedPlans.some(
        (p) =>
          p.asset === newPlan.asset &&
          p.beneficiaries.length === newPlan.beneficiaries.length &&
          p.triggerConditions === newPlan.triggerConditions
      );

      if (!planExists) {
        storedPlans = [...storedPlans, newPlan];
        localStorage.setItem("plans", JSON.stringify(storedPlans));
        setPlans(storedPlans);
      }
    }

    if (upgradedFromFree && storedPlans.length > 0) {
      const newPlanType = "Basic";
      localStorage.setItem("planName", newPlanType);

      navigate(`/post-asset/${newPlanType}`, {
        state: { plans: storedPlans, upgradedFromFree: false },
        replace: true,
      });
    }
  }, [newPlan, upgradedFromFree, navigate]);

  const handlePlansClick = () => {
    navigate("/plans");
  };

  const handleUpgradePlanClick = () => {
    if (isFreePlan && plans.length >= 1) {
      navigate("/plans", { state: { upgradedFromFree: true } });
    } else {
      navigate("/plans");
    }
  };

  const handleCreateNewPlan = () => {
    if (isFreePlan && plans.length >= 1) {
      alert(
        "You have reached the limit of one plan on the Free plan. Please upgrade your plan to create more."
      );
      return;
    }
    navigate(`/add-asset/${planName || "Free"}`);
  };

  const handleViewPlan = (plan) => {
    navigate(`/plan-details/`, { state: { plan, planName: planName || "Free" } });
  };

  const isFreePlan = planName === "Free";

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

        {isFreePlan ? (
          <button className="upgrade-plan-button" onClick={handleUpgradePlanClick}>
            <span className="upgrade-icon"></span>
            <span className="upgrade-text">Upgrade Plan</span>
          </button>
        ) : (
          <button className="create-new-plan-button" onClick={handleCreateNewPlan}>
            <span className="plus-icon"></span>
            <span className="create-new-text">Create New Plan</span>
          </button>
        )}

        <div className="your-plans-section">
          <h2 className="your-plans-heading">Your Plans</h2>

          {loading ? (
            <div className="no-assets-section">
              <p className="no-assets-text">Loading plans...</p>
            </div>
          ) : error ? (
            <div className="no-assets-section">
              <p className="no-assets-text">Error: {error}</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="no-assets-section">
              <span className="cloud-icon"></span>
              <h2 className="no-assets-text">No Plans Created Yet</h2>
            </div>
          ) : (
            plans.map((plan, index) => (
              <div key={index} className="plan-card">
                <h3 className="plan-asset">
                  {typeof plan.asset === "object"
                    ? plan.asset.name || "No Asset"
                    : plan.asset || "No Asset"}
                </h3>
                <p className="plan-beneficiaries">
                  {plan.beneficiaries?.length || 0} Beneficiaries
                </p>
                <p className="plan-trigger-conditions">
                  {plan.triggerConditions || "No Trigger Condition"}
                </p>
                <button
                  className="view-plan-button"
                  onClick={() => handleViewPlan(plan)}
                >
                  {plans.length > 1 && !isFreePlan ? "View Your Plans" : "View This Plan"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PostAssetDashboard;