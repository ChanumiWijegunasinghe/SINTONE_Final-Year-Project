import React, { useState, useEffect } from "react";
import "../assets/css/FeaturesPage.css";
import FeaturesImg from "../assets/images/Features1.png";
import Logo from '../assets/images/logo.png'
import Footer from './Footer'

function FeaturesPage({ onNavigate, route }) {
  const fullText = "SINTONE Features";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let timeout;

    if (!finished) {
      if (!isDeleting && displayText.length < fullText.length) {
        timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length + 1)), 100);
      } else if (!isDeleting && displayText.length === fullText.length) {
        // stop looping after fully typed
        setFinished(true);
      } else if (isDeleting && displayText.length > 0) {
        timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length - 1)), 50);
      } else if (isDeleting && displayText.length === 0) {
        timeout = setTimeout(() => setIsDeleting(false), 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="home-page">
      <section className="top-header">
        <nav className="site-nav">
          <div className="nav-inner">
            <div className="nav-left">
              <div className="brand-left">
                <img src={Logo} alt="SINTONE logo" className="nav-logo" />
                <div className="brand-logo">SINTONE</div>
              </div>
            </div>
            <div className="nav-right">
              <ul className="nav-links">
                  <li className={route === 'home' ? 'active' : ''} onClick={() => route !== 'home' && onNavigate?.('home')}>Home</li>
                  <li className={route === 'features' ? 'active' : ''} onClick={() => route !== 'features' && onNavigate?.('features')}>Features</li>
                  <li className={route === 'analyze' ? 'active' : ''} onClick={() => route !== 'analyze' && onNavigate?.('analyze')}>Analyze</li>
              </ul>
            </div>
          </div>
        </nav>
      </section>

      <header className="hero">
        <div
          className="features-banner"
          style={{ backgroundImage: `url(${FeaturesImg})` }}
        >
          <div className="features-banner-inner">
            <h1 className="banner-title">
              <span className="typewriter">{displayText}</span>
            </h1>
            <p className="banner-sub">Detect hate speech categories and tones in Sinhala text with precision and ease.</p>
          </div>
        </div>
        <div className="hero-content">

          <div className="cards-row">
            <div className="home-card category-card">
              <div className="icon-circle category">📊</div>
              <h3>Category Analysis</h3>
              <p>Classify Sinhala comments into specific hate speech categories with high accuracy.</p>
            </div>

            <div className="home-card tone-card">
              <div className="icon-circle tone">😤</div>
              <h3>Tone Analysis</h3>
              <p>Detect the emotional tone behind Sinhala text to understand intent and severity.</p>
            </div>
          </div>

          <button className="cta" onClick={() => onNavigate?.('analyze')}>
            Analyze Sinhala Text Comment <span className="cta-arrow">→</span>
          </button>
        </div>
      </header>

      <Footer />
    </div>
  );
}

export default FeaturesPage;
