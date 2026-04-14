import React from 'react'
import '../assets/css/TransparentCard.css'

function TransparentCard({ title, children, icon }) {
  return (
    <div className="transparent-card" tabIndex={0}>
      {icon && <div className="tc-icon">{icon}</div>}
      <h4 className="tc-title">{title}</h4>
      <div className="tc-body">{children}</div>
    </div>
  )
}

export default TransparentCard
