import React from "react";
import btcLogo from "/public/assets/images/btc-logo.png";
import cotiLogo from "/public/assets/images/coti-logo.png";
import others from "/public/assets/images/others.png";
import profile from "/public/assets/images/profile.png";
import shield from "/public/assets/images/shield.png";
import tutorialImage from "/public/assets/images/tutorial-image.png";
import cloud from "/public/assets/images/cloud.png";
import coins from "/public/assets/images/Coins.png";
import lightning from "/public/assets/images/Lightning.png";
import bell from "/public/assets/images/Bell.png";
import plusIcon from "/public/assets/images/plus-icon.png";
import house from "/public/assets/images/house.png";
import dropdown from "/public/assets/images/dropdown.png";
import header from "/public/assets/images/header.png";
import howItWorks from "/public/assets/images/how-it-works.png";
import backgroundImage from "/public/assets/images/background-image.jpeg";
import logo from "/public/assets/images/logo-1.png";
import metamask from "/public/assets/images/metamask.png";
import trustwallet from "/public/assets/images/trustwallet.png";
import backpackLogo from "/public/assets/images/backpack-logo.png";
import exodusLogo from "/public/assets/images/exodus-logo.png";
import fireblocksLogo from "/public/assets/images/fireblocks-logo.png";
import jupiterLogo from "/public/assets/images/jupiter-logo.png";
import phantomLogo from "/public/assets/images/phantom-logo.png";
import coinbaseLogo from "/public/assets/images/coinbase-wallet-logo.png";
import bifrostLogo from "/public/assets/images/bifrost-logo.png";
import wemixLogo from "/public/assets/images/wemix-logo.png";
import bitcoinLogo from "/public/assets/images/btc-logo.png";
import softlareLogo from "/public/assets/images/solflare-logo.png";
import blackfortLogo from "/public/assets/images/blackfort-logo.png";

function Assets() {
  return (
    <div style={{ display: "none" }}>
      <img src={btcLogo} alt="BTC" />
      <img src={cotiLogo} alt="COTI" />
      {/* Removed <img src={dashboard} /> as 'dashboard' is not imported */}
      <img src={others} alt="Others" />
      <img src={profile} alt="Profile" />
      <img src={shield} alt="Shield" />
      <img src={tutorialImage} alt="Tutorial" />
      <img src={cloud} alt="Cloud" />
      <img src={coins} alt="Coins" />
      <img src={lightning} alt="Lightning" />
      <img src={bell} alt="Bell" />
      <img src={plusIcon} alt="Plus Icon" />
      <img src={house} alt="House" />
      <img src={dropdown} alt="Dropdown" />
      <img src={header} alt="Header" />
      <img src={howItWorks} alt="How It Works" />
      <img src={backgroundImage} alt="Background" />
      <img src={logo} alt="Logo" />
      <img src={metamask} alt="Metamask" />
      <img src={trustwallet} alt="TrustWallet" />
      <img src={backpackLogo} alt="Backpack" />
      <img src={exodusLogo} alt="Exodus" />
      <img src={fireblocksLogo} alt="Fireblocks" />
      <img src={jupiterLogo} alt="Jupiter" />
      {/* Removed <img src={blockchainLogo} /> as 'blockchainLogo' is not imported */}
      <img src={phantomLogo} alt="Phantom" />
      {/* Removed <img src={magicEdenLogo} /> as 'magicEdenLogo' is not imported */}
      <img src={coinbaseLogo} alt="Coinbase" />
      <img src={bifrostLogo} alt="Bifrost" />
      {/* Removed <img src={tangemLogo} /> as 'tangemLogo' is not imported */}
      <img src={wemixLogo} alt="WEMIX" />
      {/* Removed <img src={robinhoodLogo} /> as 'robinhoodLogo' is not imported */}
      <img src={bitcoinLogo} alt="Bitcoin" />
      <img src={softlareLogo} alt="Softlare" />
      {/* Removed <img src={mathwalletLogo} /> as 'mathwalletLogo' is not imported */}
      <img src={blackfortLogo} alt="Blackfort" />
    </div>
  );
}

export default Assets;