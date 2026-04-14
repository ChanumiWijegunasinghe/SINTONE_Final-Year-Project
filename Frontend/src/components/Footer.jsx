import React, { useEffect, useState } from 'react'
import '../assets/css/Footer.css'

function Footer() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function checkScroll() {
      const doc = document.documentElement
      const scrolledToBottom = (window.innerHeight + window.scrollY) >= (doc.scrollHeight - 20)
      const shortPage = doc.scrollHeight <= window.innerHeight
      setVisible(scrolledToBottom || shortPage)
    }

    checkScroll()
    window.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)

    return () => {
      window.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  return (
    <footer className={`site-footer ${visible ? 'visible' : 'hidden'}`} role="contentinfo" aria-hidden={!visible}>
      <div className="footer-inner">
        <div className="footer-logo">SINTONE</div>
        <div className="footer-text">© 2025 - 2026 SINTONE — Sinhala Hate Speech Category & Tone Detection</div>
      </div>
    </footer>
  )
}

export default Footer
