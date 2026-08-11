import React from 'react'
import { Printer, X, Calendar, Phone, Clock } from 'lucide-react'
import logoImg from '../assets/logo.jpg'

export default function PresupuestoView({ presupuesto, onClose }) {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Controles superiores */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Vista Previa de Comprobante / PDF</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir / Descargar PDF</span>
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
              <img src={logoImg} alt="Gabi Sacabollos Logo" className="invoice-logo-img" />
              <div className="invoice-brand-text">
                <h2>Gabi Sacabollos</h2>
                <p>Reparación • Sacabollos • Pintura • Detailing</p>
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
            </div>

            <div className="detail-block">
              <h4>Vehículo & Patente</h4>
              <p style={{ textTransform: 'uppercase' }}>
                {presupuesto.vehiculo.marca || 'S/D'} {presupuesto.vehiculo.modelo || ''}
              </p>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ff6b00', marginTop: '2px', letterSpacing: '1px' }}>
                PATENTE: {presupuesto.vehiculo.patente || 'S/D'}
              </div>
            </div>
          </div>

          {/* Tabla de Detalle con Formato Unificado */}
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
            Gabi Sacabollos • Taller Especializado de Sacabollos, Chapa, Pintura & Detailing Automotor
            <br />
            ¡Gracias por confiar en nuestro trabajo!
          </div>
        </div>
      </div>
    </div>
  )
}
