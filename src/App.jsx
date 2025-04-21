import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import SignUp from "./components/SignUp";
import ConnectWallet from "./components/ConnectWallet";
import Plans from "./components/Plans";
import SelectPlan from "./components/SelectPlan";
import Dashboard from "./components/Dashboard";
import AddAsset from "./components/AddAsset";
import AddBeneficiaries from "./components/AddBeneficiaries";
import TriggerConditions from "./components/TriggerConditions";
import MultiSig from "./components/MultiSig";
import Inactivity from "./components/Inactivity";
import DueDate from "./components/DueDate";
import ReviewPlan from "./components/ReviewPlan";
import PostAssetDashboard from "./components/PostAssetDashboard";
import PlanDetails from "./components/PlanDetails";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Assets from "./components/Assets";
import "./index.css";

function App() {
  return (
    <div className="App">
      <Assets />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/connect-wallet"
          element={
            <ProtectedRoute>
              <ConnectWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/select-plan/:planName"
          element={
            <ProtectedRoute>
              <SelectPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:planName"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-asset"
          element={
            <ProtectedRoute>
              <AddAsset />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-beneficiaries"
          element={
            <ProtectedRoute>
              <AddBeneficiaries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trigger-conditions"
          element={
            <ProtectedRoute>
              <TriggerConditions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/multi-sig"
          element={
            <ProtectedRoute>
              <MultiSig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inactivity"
          element={
            <ProtectedRoute>
              <Inactivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/due-date"
          element={
            <ProtectedRoute>
              <DueDate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-plan"
          element={
            <ProtectedRoute>
              <ReviewPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-asset/:planName"
          element={
            <ProtectedRoute>
              <PostAssetDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan-details"
          element={
            <ProtectedRoute>
              <PlanDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;