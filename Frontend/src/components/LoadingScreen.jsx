import '../assets/css/LoadingScreen.css'
import Logo from '../assets/images/logo.png'

function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <img src={Logo} alt="SINTONE logo" className="loading-logo" />
        <h1 className="loading-title">SINTONE</h1>
        <p className="loading-subtitle">SINHALA HATE SPEECH DETECTION</p>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen