import React, { useState } from 'react'
import { Search, Eye, Trash2, Calendar, Car, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function HistorialList({ 
  historial, 
  onLoadPresupuesto, 
  onDeletePresupuesto, 
  onShowPreview,
  isSupabaseConfigured
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHistorial = historial.filter(item => {
    const term = searchTerm.toLowerCase()
    const cliente = (item.cliente?.nombre || item.cliente_nombre || '').toLowerCase()
    const patente = (item.vehiculo?.patente || item.vehiculo_patente || '').toLowerCase()
    const modelo = (item.vehiculo?.modelo || item.vehiculo_modelo || '').toLowerCase()
    return cliente.includes(term) || patente.includes(term) || modelo.includes(term)
  })

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Clock size={22} />
          <span>Historial de Presupuestos Emitidos</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: isSupabaseConfigured ? '#10b981' : 'var(--orange-primary)', fontWeight: '600' }}>
          {isSupabaseConfigured ? '● Sincronizado en Supabase Nube' : '● Almacenamiento Local'}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.4rem' }}
          placeholder="Buscar por nombre de cliente, patente (ej: AB123CD) o modelo de auto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Historial */}
      <div className="items-table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>N°</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vehículo / Patente</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistorial.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No se encontraron presupuestos en el historial.
                </td>
              </tr>
            ) : (
              filteredHistorial.map((p, idx) => {
                const clienteNombre = p.cliente?.nombre || p.cliente_nombre || 'Particular'
                const vehiculoDesc = `${p.vehiculo?.marca || p.vehiculo_marca || ''} ${p.vehiculo?.modelo || p.vehiculo_modelo || ''}`
                const patente = p.vehiculo?.patente || p.vehiculo_patente || 'S/D'
                const total = p.total || 0
                const fecha = p.fecha || (p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR') : 'Hoy')

                return (
                  <tr key={p.id || idx}>
                    <td style={{ fontWeight: '800', color: 'var(--orange-primary)' }}>
                      #{p.numero || idx + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{fecha}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{clienteNombre}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.cliente?.telefono || p.cliente_telefono || ''}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{vehiculoDesc}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--orange-primary)', letterSpacing: '0.5px' }}>
                        PATENTE: {patente}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '1rem', color: '#fff' }}>
                      ${total.toLocaleString('es-AR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                          title="Ver / Imprimir PDF"
                          onClick={() => {
                            onLoadPresupuesto(p)
                            onShowPreview()
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-icon-danger"
                          title="Eliminar"
                          onClick={() => onDeletePresupuesto(p.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
