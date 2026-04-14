import React from 'react'
import Logo from '../assets/images/logo.png'
import '../assets/css/TopHeader.css'

function TopHeader({ onNavigate, route }) {
  return (
    <header className="top-header">
      <nav className="site-nav">
        <div className="nav-inner">
          <div className="brand-left">
            <img src={Logo} alt="SINTONE logo" className="nav-logo" />
            <div className="brand-logo">SINTONE</div>
          </div>

          <ul className="nav-links nav-right">
            <li className={route === 'home' ? 'active' : ''} onClick={() => route !== 'home' && onNavigate('home')}>Home</li>
            <li className={route === 'features' ? 'active' : ''} onClick={() => route !== 'features' && onNavigate('features')}>Features</li>
            <li className={route === 'analyze' ? 'active' : ''} onClick={() => route !== 'analyze' && onNavigate('analyze')}>Analyze</li>
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default TopHeader
