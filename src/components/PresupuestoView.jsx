import React, { useState } from 'react'
import { Printer, X, Calendar, Phone, Clock, Share2, MessageCircle, Mail, Copy, Check } from 'lucide-react'
import logoImg from '../assets/logo.jpg'

export default function PresupuestoView({ presupuesto, onClose }) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const subtotalNeto = presupuesto.items.reduce((acc, curr) => acc + (curr.subtotal || 0), 0)
  const totalHoras = presupuesto.items.reduce((acc, curr) => acc + ((parseFloat(curr.horas) || 0) * (parseFloat(curr.cantidad) || 1)), 0)
  const descuentoNum = parseFloat(presupuesto.descuento) || 0
  const baseImponible = Math.max(0, subtotalNeto - descuentoNum)
  
  const incluirIva = presupuesto.incluirIva !== false
  const montoIva = incluirIva ? baseImponible * 0.21 : 0
  const totalFinal = baseImponible + montoIva

  // Arma el texto del presupuesto para compartir
  const buildShareText = () => {
    const lineas = presupuesto.items.map(item =>
      `• ${item.descripcion} (${item.cantidad}u${item.horas ? ` · ${item.horas}hs` : ''}) → $${(item.subtotal || 0).toLocaleString('es-AR')}`
    ).join('\n')

    return (
      `🔧 *PRESUPUESTO #${presupuesto.numero || '0001'} — GARAGE SACABOLLOS*\n` +
      `📅 Fecha: ${presupuesto.fecha || new Date().toLocaleDateString('es-AR')}\n\n` +
      `👤 *Cliente:* ${presupuesto.cliente.nombre || 'Particular'}${presupuesto.cliente.telefono ? ` | ${presupuesto.cliente.telefono}` : ''}\n` +
      `🚗 *Vehículo:* ${presupuesto.vehiculo.marca || ''} ${presupuesto.vehiculo.modelo || ''} — Patente: ${presupuesto.vehiculo.patente || 'S/D'}\n\n` +
      `📋 *Detalle de trabajos:*\n${lineas}\n\n` +
      `⏱ Total horas estimadas: ${totalHoras} hs\n` +
      `💰 Subtotal neto: $${subtotalNeto.toLocaleString('es-AR')}\n` +
      (descuentoNum > 0 ? `🏷 Descuento: -$${descuentoNum.toLocaleString('es-AR')}\n` : '') +
      (incluirIva ? `📊 IVA 21%: +$${montoIva.toLocaleString('es-AR')}\n` : '') +
      `✅ *TOTAL: $${totalFinal.toLocaleString('es-AR')}*\n\n` +
      `📍 Pasteur 1009, Pilar | 📞 11-3105-0182\n` +
      `Válido por 15 días hábiles.`
    )
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(buildShareText())
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShowShareMenu(false)
  }

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Presupuesto #${presupuesto.numero || '0001'} — Garage Sacabollos`)
    const body = encodeURIComponent(buildShareText())
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    setShowShareMenu(false)
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback para iOS
      const ta = document.createElement('textarea')
      ta.value = buildShareText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setShowShareMenu(false)
  }

  // Web Share API nativa (funciona bien en Android/iOS)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Presupuesto #${presupuesto.numero || '0001'} — Garage Sacabollos`,
          text: buildShareText(),
        })
      } catch (err) {
        // usuario canceló, no hacer nada
      }
    } else {
      setShowShareMenu(true)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Controles superiores */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Vista Previa / PDF</h3>
          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>

            {/* Botón Compartir */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn-secondary"
                onClick={handleNativeShare}
                style={{ background: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.5)', color: '#22c55e' }}
              >
                <Share2 size={16} />
                <span>Compartir</span>
              </button>

              {/* Menú fallback (desktop) */}
              {showShareMenu && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 999,
                  background: '#1f2937', border: '1px solid #374151',
                  borderRadius: '10px', padding: '0.5rem', minWidth: '180px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}>
                  <button onClick={handleShareWhatsApp} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    width: '100%', padding: '0.6rem 0.8rem', background: 'transparent',
                    border: 'none', color: '#25D366', cursor: 'pointer', borderRadius: '6px',
                    fontSize: '0.9rem', fontWeight: '600'
                  }}>
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button onClick={handleShareEmail} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    width: '100%', padding: '0.6rem 0.8rem', background: 'transparent',
                    border: 'none', color: '#60a5fa', cursor: 'pointer', borderRadius: '6px',
                    fontSize: '0.9rem', fontWeight: '600'
                  }}>
                    <Mail size={16} /> Email
                  </button>
                  <button onClick={handleCopyText} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    width: '100%', padding: '0.6rem 0.8rem', background: 'transparent',
                    border: 'none', color: '#d1d5db', cursor: 'pointer', borderRadius: '6px',
                    fontSize: '0.9rem', fontWeight: '600'
                  }}>
                    {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                    {copied ? '¡Copiado!' : 'Copiar texto'}
                  </button>
                </div>
              )}
            </div>

            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir / PDF</span>
            </button>
            <button className="btn-secondary" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tarjeta Impresa / Comprobante */}
        <div className="invoice-preview-card">
          <div className="invoice-header">
            <div className="invoice-logo-block">
              <img src={logoImg} alt="Garage Sacabollos Logo" className="invoice-logo-img" />
              <div className="invoice-brand-text">
                <h2>Garage Sacabollos</h2>
                <p>Gabriel Centurion — CUIT 20-32254008-7</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Pasteur 1009, Pilar &nbsp;•&nbsp; 11-3105-0182
                </p>
              </div>
            </div>
            <div className="invoice-meta">
              <div className="invoice-number">PRESUPUESTO #{presupuesto.numero || '0001'}</div>
              <div className="invoice-date">
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Fecha: {presupuesto.fecha || new Date().toLocaleDateString('es-AR')}
              </div>
              <div className="invoice-date">Validez: 15 días hábiles</div>
            </div>
          </div>

          {/* Grilla Datos Cliente y Vehículo */}
          <div className="invoice-details-grid">
            <div className="detail-block">
              <h4>Cliente</h4>
              <p>{presupuesto.cliente.nombre || 'Cliente Particular'}</p>
              {presupuesto.cliente.telefono && (
                <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '2px' }}>
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {presupuesto.cliente.telefono}
                </div>
              )}
              {presupuesto.cliente.cuit && (
                <div style={{ fontSize: '0.82rem', color: '#4b5563', marginTop: '2px' }}>
                  CUIT/CUIL: {presupuesto.cliente.cuit}
                </div>
              )}
              {presupuesto.cliente.direccion && (
                <div style={{ fontSize: '0.82rem', color: '#4b5563', marginTop: '2px' }}>
                  📍 {presupuesto.cliente.direccion}
                </div>
              )}
            </div>

            <div className="detail-block">
              <h4>Vehículo &amp; Patente</h4>
              <p style={{ textTransform: 'uppercase' }}>
                {presupuesto.vehiculo.marca || 'S/D'} {presupuesto.vehiculo.modelo || ''}
              </p>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ff6b00', marginTop: '2px', letterSpacing: '1px' }}>
                PATENTE: {presupuesto.vehiculo.patente || 'S/D'}
              </div>
            </div>
          </div>

          {/* Tabla de Detalle */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Categoría</th>
                <th>Detalle del Trabajo / Insumos</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Cant.</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Hs Trabajo</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Precio Neto</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Subtotal Neto</th>
              </tr>
            </thead>
            <tbody>
              {presupuesto.items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af' }}>
                    Sin ítems asignados.
                  </td>
                </tr>
              ) : (
                presupuesto.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', fontSize: '0.8rem', color: '#4b5563' }}>{item.categoria}</td>
                    <td>{item.descripcion}</td>
                    <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ textAlign: 'center' }}>{item.horas ? `${item.horas} hs` : '-'}</td>
                    <td style={{ textAlign: 'right' }}>${(parseFloat(item.precio) || 0).toLocaleString('es-AR')}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>${(item.subtotal || 0).toLocaleString('es-AR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totales */}
          <div className="invoice-totals" style={{ width: '320px' }}>
            <div className="invoice-total-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Total Horas Trabajo:
              </span>
              <span style={{ fontWeight: 'bold' }}>{totalHoras} hs</span>
            </div>

            <div className="invoice-total-row">
              <span>Subtotal Neto (Sin IVA):</span>
              <span>${subtotalNeto.toLocaleString('es-AR')}</span>
            </div>
            
            {descuentoNum > 0 && (
              <div className="invoice-total-row" style={{ color: '#ef4444' }}>
                <span>Descuento:</span>
                <span>-${descuentoNum.toLocaleString('es-AR')}</span>
              </div>
            )}

            {incluirIva && (
              <div className="invoice-total-row">
                <span>IVA (21%):</span>
                <span>+${montoIva.toLocaleString('es-AR')}</span>
              </div>
            )}

            <div className="invoice-total-row final">
              <span>{incluirIva ? 'TOTAL CON IVA:' : 'TOTAL NETO:'}</span>
              <span>${totalFinal.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Observaciones */}
          {presupuesto.observaciones && (
            <div style={{ marginTop: '1rem', background: '#f9fafb', padding: '0.85rem', borderRadius: '8px', borderLeft: '4px solid #ff6b00' }}>
              <strong style={{ fontSize: '0.8rem', color: '#374151', textTransform: 'uppercase' }}>Observaciones: </strong>
              <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{presupuesto.observaciones}</span>
            </div>
          )}

          <div className="invoice-footer">
            Garage Sacabollos • Taller Especializado de Sacabollos, Chapa, Pintura &amp; Detailing Automotor
            <br />
            ¡Gracias por confiar en nuestro trabajo!
          </div>
        </div>
      </div>
    </div>
  )
}
