import React from 'react'
import { FilePlus, History } from 'lucide-react'
import logoImg from '../assets/logo.jpg'

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="brand-section">
        <img src={logoImg} alt="Garage Sacabollos Logo" className="brand-logo" />
        <div className="brand-info">
          <h1>GARAGE <span>SACABOLLOS</span></h1>
          <p>Gabriel Centurion — CUIT 20-32254008-7</p>
          <p style={{ fontSize: '0.72rem', opacity: 0.75, lineHeight: '1.5' }}>
            Pasteur 1009, Pilar &nbsp;•&nbsp; sotto_77mya@hotmail.com &nbsp;•&nbsp; 11-3105-0182
          </p>
        </div>
      </div>

      <div className="nav-actions">
        <button
          className={`nav-btn ${activeTab === 'nuevo' ? 'active' : ''}`}
          onClick={() => setActiveTab('nuevo')}
        >
          <FilePlus size={16} />
          <span>Nuevo Presupuesto</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          <History size={16} />
          <span>Historial</span>
        </button>
      </div>
    </nav>
  )
}
