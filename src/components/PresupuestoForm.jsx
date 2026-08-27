import React, { useState } from 'react'
import { User, Car, Plus, Trash2, Printer, Save, Sparkles, Clock } from 'lucide-react'

// Servicios preseteados con horas estimadas por trabajo
const PRESET_SERVICES = [
  { categoria: 'Sacabollos', descripcion: 'Desabollado de Puerta sin dañar pintura', horas: 3, precio: 25000 },
  { categoria: 'Sacabollos', descripcion: 'Desabollado de Capot (bollos / granizo)', horas: 6, precio: 35000 },
  { categoria: 'Sacabollos', descripcion: 'Desabollado de Techo completo', horas: 12, precio: 50000 },
  { categoria: 'Pulido & Detailing', descripcion: 'Tratamiento Acrílico con Sellado UV', horas: 8, precio: 65000 },
  { categoria: 'Pulido & Detailing', descripcion: 'Tratamiento Cerámico 9H Multicapa', horas: 16, precio: 110000 },
  { categoria: 'Pulido & Detailing', descripcion: 'Polimerizado y Restauración de Ópticas (Par)', horas: 2, precio: 18000 },
  { categoria: 'Pintura', descripcion: 'Pintura y Reparación de Paragolpes', horas: 24, precio: 75000 },
  { categoria: 'Pintura', descripcion: 'Pintura de Panel (Puerta / Guardabarros)', horas: 24, precio: 85000 },
  { categoria: 'Mecánica', descripcion: 'Chequeo y Diagnóstico Preventivo', horas: 1.5, precio: 15000 },
]

export default function PresupuestoForm({ 
  presupuesto, 
  setPresupuesto, 
  onSavePresupuesto, 
  onShowPreview,
  isSaving
}) {
  const [nuevoItem, setNuevoItem] = useState({
    categoria: 'Sacabollos',
    descripcion: '',
    cantidad: 1,
    horas: 2,
    precio: ''
  })

  const handleChangeCliente = (field, value) => {
    setPresupuesto(prev => ({
      ...prev,
      cliente: { ...prev.cliente, [field]: value }
    }))
  }

  const handleChangeVehiculo = (field, value) => {
    setPresupuesto(prev => ({
      ...prev,
      vehiculo: { ...prev.vehiculo, [field]: value }
    }))
  }

  const handleAddPreset = (preset) => {
    const item = {
      id: Date.now().toString(),
      categoria: preset.categoria,
      descripcion: preset.descripcion,
      cantidad: 1,
      horas: preset.horas || 2,
      precio: preset.precio,
      subtotal: preset.precio
    }
    setPresupuesto(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!nuevoItem.descripcion || !nuevoItem.precio) return

    const precioNum = parseFloat(nuevoItem.precio) || 0
    const cantNum = parseFloat(nuevoItem.cantidad) || 1
    const horasNum = parseFloat(nuevoItem.horas) || 1

    const item = {
      id: Date.now().toString(),
      categoria: nuevoItem.categoria,
      descripcion: nuevoItem.descripcion,
      cantidad: cantNum,
      horas: horasNum,
      precio: precioNum,
      subtotal: precioNum * cantNum
    }

    setPresupuesto(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))

    setNuevoItem({
      categoria: 'Sacabollos',
      descripcion: '',
      cantidad: 1,
      horas: 2,
      precio: ''
    })
  }

  const handleRemoveItem = (id) => {
    setPresupuesto(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const handleItemChange = (id, field, value) => {
    setPresupuesto(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          const cant = parseFloat(field === 'cantidad' ? value : updated.cantidad) || 0
          const prec = parseFloat(field === 'precio' ? value : updated.precio) || 0
          updated.subtotal = cant * prec
          return updated
        }
        return item
      })
    }))
  }

  // Cálculos dinámicos con IVA 21%
  const subtotalNeto = presupuesto.items.reduce((acc, curr) => acc + (curr.subtotal || 0), 0)
  const totalHoras = presupuesto.items.reduce((acc, curr) => acc + ((parseFloat(curr.horas) || 0) * (parseFloat(curr.cantidad) || 1)), 0)
  const descuentoNum = parseFloat(presupuesto.descuento) || 0
  const baseImponible = Math.max(0, subtotalNeto - descuentoNum)
  
  const incluirIva = presupuesto.incluirIva !== false
  const montoIva = incluirIva ? baseImponible * 0.21 : 0
  const totalFinal = baseImponible + montoIva

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Car size={22} />
          <span>Generador de Presupuesto</span>
        </div>
      </div>

      {/* Formulario Cliente y Vehículo */}
      <div className="grid-main">
        <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div className="form-section-title">
            <User size={16} />
            <span>Datos del Cliente</span>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label>Nombre y Apellido *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Juan Pérez"
                value={presupuesto.cliente.nombre}
                onChange={(e) => handleChangeCliente('nombre', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Teléfono / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: 11 4455-6677"
                value={presupuesto.cliente.telefono}
                onChange={(e) => handleChangeCliente('telefono', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>CUIT / CUIL</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: 20-12345678-9"
                value={presupuesto.cliente.cuit || ''}
                onChange={(e) => handleChangeCliente('cuit', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Av. Corrientes 1234, CABA"
                value={presupuesto.cliente.direccion || ''}
                onChange={(e) => handleChangeCliente('direccion', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div className="form-section-title">
            <Car size={16} />
            <span>Datos del Vehículo</span>
          </div>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Marca *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Volkswagen"
                value={presupuesto.vehiculo.marca}
                onChange={(e) => handleChangeVehiculo('marca', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Modelo *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Gol Trend"
                value={presupuesto.vehiculo.modelo}
                onChange={(e) => handleChangeVehiculo('modelo', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Patente *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: AB123CD"
                style={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}
                value={presupuesto.vehiculo.patente}
                onChange={(e) => handleChangeVehiculo('patente', e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trabajos Rápidos — OCULTO hasta nuevo aviso */}
      {false && (
        <div>
          <div className="form-section-title">
            <Sparkles size={16} />
            <span>Agregar Trabajo Rápido</span>
          </div>
          <div className="service-badges-grid">
            {PRESET_SERVICES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="service-quick-badge"
                onClick={() => handleAddPreset(preset)}
              >
                <Plus size={12} />
                <span>{preset.descripcion} (${preset.precio.toLocaleString('es-AR')})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de Agregar Ítem Adaptable a Celular */}
      <form onSubmit={handleAddItem} style={{ background: 'rgba(255, 107, 0, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-orange)' }}>
        <div className="add-item-form-grid">
          <div className="form-group">
            <label>Categoría</label>
            <select
              className="form-select"
              value={nuevoItem.categoria}
              onChange={(e) => setNuevoItem({ ...nuevoItem, categoria: e.target.value })}
            >
              <option value="Sacabollos">Sacabollos</option>
              <option value="Pulido & Detailing">Pulido & Detailing</option>
              <option value="Pintura">Pintura</option>
              <option value="Mecánica">Mecánica</option>
              <option value="Repuestos">Repuestos</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="form-group">
            <label>Descripción del Trabajo / Repuesto</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Desabollado sin pintar en puerta trasera izquierda"
              value={nuevoItem.descripcion}
              onChange={(e) => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
            />
          </div>

          {/* Fila de Números en Celular */}
          <div className="numbers-row-mobile">
            <div className="form-group">
              <label>Cant.</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={nuevoItem.cantidad}
                onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Hs Trabajo</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="form-input"
                placeholder="0"
                value={nuevoItem.horas}
                onChange={(e) => setNuevoItem({ ...nuevoItem, horas: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Precio ($)</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                placeholder="0.00"
                value={nuevoItem.precio}
                onChange={(e) => setNuevoItem({ ...nuevoItem, precio: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.4rem' }}>
            <Plus size={18} />
            <span>Agregar</span>
          </button>
        </div>
      </form>

      {/* Tabla de Ítems Scrollable en Móvil */}
      <div className="items-table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Descripción del Trabajo / Repuesto</th>
              <th style={{ width: '70px', textAlign: 'center' }}>Cant.</th>
              <th style={{ width: '85px', textAlign: 'center' }}>Hs Trabajo</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Precio Neto</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Subtotal Neto</th>
              <th style={{ width: '45px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {presupuesto.items.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay trabajos agregados. Seleccioná un trabajo rápido o agregá uno personalizado.
                </td>
              </tr>
            ) : (
              presupuesto.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={`category-tag category-${item.categoria.replace(/\s+/g, '')}`}>
                      {item.categoria}
                    </span>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.3rem 0.5rem', background: 'transparent', border: 'none' }}
                      value={item.descripcion}
                      onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      style={{ padding: '0.3rem', textAlign: 'center', width: '55px' }}
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="form-input"
                      style={{ padding: '0.3rem', textAlign: 'center', width: '60px' }}
                      value={item.horas || 0}
                      onChange={(e) => handleItemChange(item.id, 'horas', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ padding: '0.3rem', textAlign: 'right', width: '100px' }}
                      value={item.precio}
                      onChange={(e) => handleItemChange(item.id, 'precio', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--orange-primary)' }}>
                    ${(item.subtotal || 0).toLocaleString('es-AR')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-icon-danger" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen de Totales Adaptable a Celular */}
      <div className="summary-grid-container">
        <div className="form-group">
          <label>Observaciones / Garantía del Trabajo</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Ej: Trabajo garantizado por 12 meses. Tiempo estimado de entrega a coordinar."
            value={presupuesto.observaciones}
            onChange={(e) => setPresupuesto({ ...presupuesto, observaciones: e.target.value })}
          ></textarea>
        </div>

        <div className="totals-box">
          <div className="totals-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} color="var(--orange-primary)" /> Total Horas de Trabajo:
            </span>
            <span style={{ fontWeight: 'bold' }}>{totalHoras} hs</span>
          </div>

          <div className="totals-row">
            <span>Subtotal Neto (Sin IVA):</span>
            <span>${subtotalNeto.toLocaleString('es-AR')}</span>
          </div>

          <div className="totals-row">
            <span>Descuento ($):</span>
            <input
              type="number"
              className="form-input"
              style={{ width: '110px', padding: '0.3rem 0.5rem', textAlign: 'right' }}
              placeholder="0"
              value={presupuesto.descuento}
              onChange={(e) => setPresupuesto({ ...presupuesto, descuento: e.target.value })}
            />
          </div>

          <div className="totals-row" style={{ padding: '0.4rem 0', borderTop: '1px dashed var(--border-subtle)', borderBottom: '1px dashed var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
              <input
                type="checkbox"
                checked={incluirIva}
                onChange={(e) => setPresupuesto({ ...presupuesto, incluirIva: e.target.checked })}
                style={{ accentColor: 'var(--orange-primary)', width: '16px', height: '16px' }}
              />
              <span>Aplicar IVA 21% Argentina</span>
            </label>
            <span style={{ color: incluirIva ? 'var(--orange-primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>
              +${montoIva.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="totals-row grand-total">
            <span>TOTAL CON IVA:</span>
            <span className="total-amount">${totalFinal.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción al final */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onShowPreview}>
          <Printer size={16} />
          <span>Vista PDF</span>
        </button>
        <button className="btn-primary" style={{ flex: 2 }} onClick={onSavePresupuesto} disabled={isSaving}>
          <Save size={16} />
          <span>{isSaving ? 'Guardando...' : 'Guardar Presupuesto'}</span>
        </button>
      </div>
    </div>
  )
}
