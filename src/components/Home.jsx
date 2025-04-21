import React, { useState } from "react";
import { Link } from "react-router-dom";
import Assets from "./Assets"; // Import Assets
import "./Home.css";

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="home-root">
      <Assets /> {/* Preload all images */}
      <header>
        <div className="container">
          <Link to="/" className="brand">
            <img src="/assets/logo-1.png" alt="Crypto Inheritance Protocol" className="logo" />
          </Link>
          <button className="hamburger" onClick={toggleMenu}></button>
          <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/login" className="btn" onClick={toggleMenu}>
              Login
            </Link>
            <Link to="/welcome" className="btn" onClick={toggleMenu}>
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section
          className="hero"
          style={{
            backgroundImage: `url(/assets/header.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container">
            <h1>Your legacy deserves a secure tomorrow.</h1>
            <p className="subtitle">
              Your digital assets deserve the same protection as your physical assets.
            </p>
            <p>
              Automate inheritance, stay compliant, and secure your wealth with AI-powered
              smart contracts and blockchain technology.
            </p>
            <Link to="/welcome" className="btn">
              Get early access
            </Link>
            <div className="supported-by">
              <span>Supported by</span>
              <img src="/assets/coti-logo.png" alt="COTI" className="coti-logo" />
            </div>
          </div>
        </section>

        <section className="catchphrase">
          <div className="container">
            <p>Your wealth, Your rules, Your future.</p>
          </div>
        </section>

        <section className="stats">
          <div className="container">
            <h2>Don't let your legacy become another statistic.</h2>
            <p>
              Imagine a world where your loved ones never worry about accessing your
              digital wealth. CIP bridges the gap, ensuring your assets are secure,
              accessible, and ready to be passed on effortlessly.
            </p>
          </div>
        </section>

        <section className="build">
          <div className="container">
            <div className="row">
              <div className="image">
                <img src="/assets/shield.png" alt="Built for the future" />
              </div>
              <div className="text">
                <h2>Built for the future, designed for peace of mind.</h2>
                <p>
                  CIP is pioneering a secure, tamper-proof crypto inheritance protocol that
                  ensures your assets are protected for generations to come. With
                  cutting-edge infrastructure, it guarantees that your digital wealth is
                  safe, sustainable, and future-proof.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="how-it-works"
          style={{
            backgroundImage: `url(/assets/how-it-works.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container">
            <div className="row">
              <div className="left-column">
                <h2>
                  Ready to Secure Your Tomorrow? <br /> Here is How It Works:
                </h2>
              </div>
              <div className="right-column">
                <ul>
                  <li>Register your assets on our secure platform.</li>
                  <li>Let AI craft a custom inheritance plan tailored to your needs.</li>
                  <li>
                    Smart contracts ensure your assets are transferred when life events
                    occur.
                  </li>
                  <li>Legal templates validate the process to prevent disputes.</li>
                </ul>
                <Link to="/welcome" className="btn">
                  Get early access
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="uniqueness">
          <div className="container">
            <h2>What makes CIP unique?</h2>
            <div className="columns">
              <div className="column">
                <h3>Flexibility</h3>
                <p>
                  CIP empowers users to create tailored inheritance solutions,
                  multi-signature wallets, and legally sound agreements that evolve
                  alongside their needs. This modularity offers users the freedom to adapt
                  and secure their assets across decentralized networks with ease.
                </p>
              </div>
              <div className="column">
                <h3>Bulletproof Security</h3>
                <p>
                  CIP introduces a new standard for safeguarding wealth in decentralized
                  ecosystems. Its smart contracts are designed to provide unmatched
                  security for digital legacies, ensuring users' assets and agreements are
                  safe and future-proof.
                </p>
              </div>
              <div className="column">
                <h3>Comprehensiveness</h3>
                <p>
                  Whether it’s traditional or digital, your assets are secured across
                  every ecosystem. With our crypto inheritance protocol, you can rest
                  assured that everything you’ve worked for is fully protected—no matter
                  the asset, no matter the platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>© 2025. Crypto Inheritance Protocol. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;