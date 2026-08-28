import React, { useState, useRef } from 'react'
import { Printer, X, Calendar, Phone, Clock, Share2, Download, Loader } from 'lucide-react'
import logoImg from '../assets/logo.jpg'

export default function PresupuestoView({ presupuesto, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const invoiceRef = useRef(null)

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

  const getPdfFilename = () =>
    `Presupuesto-${presupuesto.numero || '0001'}-${(presupuesto.cliente.nombre || 'cliente').replace(/\s+/g, '_')}.pdf`

  // Genera el PDF como Blob usando html2pdf.js
  const generatePdfBlob = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    const element = invoiceRef.current

    const opt = {
      margin: [8, 8, 8, 8],
      filename: getPdfFilename(),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    const pdf = html2pdf().set(opt).from(element)
    return await pdf.outputPdf('blob')
  }

  // Compartir: intenta Web Share API con archivo, sino descarga
  const handleShare = async () => {
    setIsGenerating(true)
    try {
      const blob = await generatePdfBlob()
      const file = new File([blob], getPdfFilename(), { type: 'application/pdf' })

      // Web Share API con archivo (funciona en Android Chrome, iOS Safari 15+)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Presupuesto #${presupuesto.numero || '0001'} — Garage Sacabollos`,
          files: [file],
        })
      } else {
        // Fallback: descarga el PDF directamente
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = getPdfFilename()
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error generando PDF:', err)
        alert('No se pudo generar el PDF. Intentá con el botón Imprimir.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Controles superiores */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Vista Previa / PDF</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>

            {/* Botón Compartir PDF */}
            <button
              className="btn-secondary"
              onClick={handleShare}
              disabled={isGenerating}
              style={{
                background: isGenerating ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.15)',
                borderColor: 'rgba(34,197,94,0.5)',
                color: '#22c55e',
                minWidth: '130px'
              }}
            >
              {isGenerating
                ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Generando...</span></>
                : <><Share2 size={16} /><span>Compartir PDF</span></>
              }
            </button>

            {/* Botón Imprimir */}
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir</span>
            </button>

            <button className="btn-secondary" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tarjeta Impresa / Comprobante — este div se convierte en PDF */}
        <div className="invoice-preview-card" ref={invoiceRef}>
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

        {/* Spinner CSS inline */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  )
}
