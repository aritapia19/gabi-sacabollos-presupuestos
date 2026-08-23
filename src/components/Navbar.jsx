import React from 'react'
import { FilePlus, History, FileSpreadsheet, Database } from 'lucide-react'
import logoImg from '../assets/logo.jpg'

export default function Navbar({ activeTab, setActiveTab, isSupabaseConfigured }) {
  return (
    <nav className="navbar">
      <div className="brand-section">
        <img src={logoImg} alt="Garaje Sacabollos Logo" className="brand-logo" />
        <div className="brand-info">
          <h1>GARAJE <span>SACABOLLOS</span></h1>
          <p>Gabriel Centurion</p>
          <p style={{ fontSize: '0.75rem', opacity: 0.75 }}>CUIT 20-32254008-7</p>
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

        <button
          className={`nav-btn ${activeTab === 'excel' ? 'active' : ''}`}
          onClick={() => setActiveTab('excel')}
        >
          <FileSpreadsheet size={16} />
          <span>Importar Excel</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'supabase' ? 'active' : ''}`}
          onClick={() => setActiveTab('supabase')}
          style={{ borderColor: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.4)' : '' }}
        >
          <Database size={16} color={isSupabaseConfigured ? '#10b981' : '#ff6b00'} />
          <span>{isSupabaseConfigured ? 'Nube Supabase' : 'Config Nube'}</span>
        </button>
      </div>
    </nav>
  )
}
