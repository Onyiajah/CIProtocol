import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "../index.css";
import images from '../assets/images';  

const { walletLogos, uiIcons } = images;
const {cipLogo} = walletLogos;

const {profile} = uiIcons;



function PostAssetDashboard() {
  const { planName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { newPlan, upgradedFromFree } = location.state || {};

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // Fetch existing plans from localStorage
    let storedPlans = JSON.parse(localStorage.getItem("plans")) || [];

    // If there's a newPlan from navigation state, add it to the plans
    if (newPlan) {
      // Avoid duplicates by checking if the plan already exists
      const planExists = storedPlans.some(
        (p) =>
          p.asset === newPlan.asset &&
          p.beneficiaries.length === newPlan.beneficiaries.length &&
          p.triggerConditions === newPlan.triggerConditions
      );

      if (!planExists) {
        storedPlans = [...storedPlans, newPlan];
        localStorage.setItem("plans", JSON.stringify(storedPlans));
      }
    }

    // Update the component state with the latest plans
    setPlans(storedPlans);

    // Handle the upgrade flow
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

  // Prioritize the newPlan for display if it exists; otherwise, use the most recent plan (last in array)
  const displayedPlan = newPlan || (plans.length > 0 ? plans[plans.length - 1] : null);

  const viewButtonText =
    plans.length > 1 && !isFreePlan ? "View Your Plans" : "View This Plan";

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

          {displayedPlan ? (
            <div className="plan-card">
              <h3 className="plan-asset">
                {typeof displayedPlan.asset === "object"
                  ? displayedPlan.asset.name || "No Asset"
                  : displayedPlan.asset || "No Asset"}
              </h3>
              <p className="plan-beneficiaries">
                {displayedPlan.beneficiaries?.length || 0} Beneficiaries
              </p>
              <p className="plan-trigger-conditions">
                {displayedPlan.triggerConditions || "No Trigger Condition"}
              </p>
              <button
                className="view-plan-button"
                onClick={() => handleViewPlan(displayedPlan)}
              >
                {viewButtonText}
              </button>
            </div>
          ) : (
            <div className="no-assets-section">
              <span className="cloud-icon"></span>
              <h2 className="no-assets-text">No Plans Created Yet</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostAssetDashboard; 
