import React, { useState, useEffect } from 'react'
import '../assets/css/HomePage.css'
import TransparentCard from './TransparentCard'
import TopHeader from './TopHeader'
import Footer from './Footer'

function HomePage({ onNavigate, route }) {
  const fullText = "Welcome to SINTONE";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const typingSpeed = 120;
    const deletingSpeed = 60;
    const pauseAfterTyped = 1200; // pause when full text typed
    const pauseBeforeTyping = 500; // pause before restarting

    if (!isDeleting && displayText.length < fullText.length) {
      timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length + 1)), typingSpeed);
    } else if (!isDeleting && displayText.length === fullText.length) {
      // when fully typed, begin deleting after a short pause
      timeout = setTimeout(() => setIsDeleting(true), pauseAfterTyped);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(fullText.slice(0, displayText.length - 1)), deletingSpeed);
    } else if (isDeleting && displayText.length === 0) {
      // restart typing after a short pause
      timeout = setTimeout(() => setIsDeleting(false), pauseBeforeTyping);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, fullText]);

  const scrollToNext = () => {
    const next = document.querySelector('.home-hero + .section') || document.querySelector('.section');
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="home-page">
      <TopHeader onNavigate={onNavigate} route={route} />

      <header className="hero home-hero">
        <div className="hero-box">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="typewriter">{displayText}<span className="cursor" aria-hidden="true">|</span></span>
            </h1>
            
          </div>
        </div>
        <button className="scroll-down" onClick={scrollToNext} aria-label="Scroll to content">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </header>

      <>
          <section className="section">
            <div className="container">
              <h2 className="section-title">What is Hate Speech?</h2>
              <p className="section-sub">Hate speech refers to any form of communication that attacks, discriminates, or incites violence against individuals or groups based on attributes such as ethnicity, religion, gender, or nationality.</p>

              <div className="cards-row">
                <div className="home-card category-card">
                  <div className="icon-circle category">⚠️</div>
                  <h3>Growing Threat</h3>
                  <p>Online hate speech is rising globally, with low-resource languages like Sinhala being particularly underserved.</p>
                </div>

                <div className="home-card tone-card">
                  <div className="icon-circle tone">🔍</div>
                  <h3>Hard to Detect</h3>
                  <p>Sinhala script and linguistic nuances make automated detection challenging, requiring specialized AI models.</p>
                </div>

                <div className="home-card impact-card">
                  <div className="icon-circle impact">📘</div>
                  <h3>Real-World Impact</h3>
                  <p>Unchecked hate speech can fuel communal tensions and violence, making detection essential for peace.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="section why-section">
            <div className="container">
              <h2 className="section-title">Why Choose SINTONE?</h2>
              <p className="section-sub">SINTONE delivers specialized, AI-driven hate speech insights tailored for the Sinhala language — something generic tools cannot offer.</p>

              <div className="why-grid">
                <TransparentCard title="Sinhala-First" icon="🇱🇰">Built specifically for Sinhala, understanding script and linguistic context.</TransparentCard>

                <TransparentCard title="Dual Analysis" icon="⚖️">Combines category detection and tone analysis in a single pipeline.</TransparentCard>

                

                <TransparentCard title="Fast & Easy" icon="⚡">Simple interface — paste text, click analyze, get results instantly.</TransparentCard>
              </div>
            </div>
          </section>

          <section className="section cta-section">
            <div className="container text-center">
              <h3>Ready to Explore the Features of SINTONE?</h3>
              {/*<p>Discover the features of SINTONE</p>*/}
              <button className="cta" onClick={() => onNavigate('features')}>Go to Features →</button>
            </div>
          </section>
      </>

      <Footer />
    </div>
  )
}

export default HomePage



