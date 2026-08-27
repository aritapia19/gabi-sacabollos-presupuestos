import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import PresupuestoForm from './components/PresupuestoForm'
import PresupuestoView from './components/PresupuestoView'
import HistorialList from './components/HistorialList'
import ExcelImporter from './components/ExcelImporter'
import SupabaseConfigModal from './components/SupabaseConfigModal'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'

const INITIAL_PRESUPUESTO = {
  id: null,
  numero: null,
  fecha: new Date().toLocaleDateString('es-AR'),
  cliente: { nombre: '', telefono: '', email: '' },
  vehiculo: { marca: '', modelo: '', patente: '', anio: '', color: '' },
  items: [],
  descuento: 0,
  incluirIva: true,
  observaciones: ''
}

export default function App() {
  const [activeTab, setActiveTab] = useState('nuevo')
  const [presupuesto, setPresupuesto] = useState(INITIAL_PRESUPUESTO)
  const [historial, setHistorial] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [showSupabaseModal, setShowSupabaseModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchHistorial()
  }, [])

  useEffect(() => {
    if (activeTab === 'supabase') {
      setShowSupabaseModal(true)
    }
  }, [activeTab])

  const fetchHistorial = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('presupuestos')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          const mapped = data.map(row => ({
            id: row.id,
            numero: row.numero || row.numero_presupuesto,
            fecha: row.fecha || row.fecha_emision,
            cliente: {
              nombre: row.cliente_nombre || '',
              telefono: row.cliente_telefono || '',
              email: row.cliente_email || ''
            },
            vehiculo: {
              marca: row.vehiculo_marca || '',
              modelo: row.vehiculo_modelo || '',
              patente: row.vehiculo_patente || '',
              color: row.vehiculo_color || '',
              anio: row.vehiculo_anio || ''
            },
            items: row.items || [],
            descuento: row.descuento || 0,
            incluirIva: row.incluir_iva !== false,
            subtotal: row.subtotal || 0,
            total: row.total || 0,
            observaciones: row.observaciones || ''
          }))
          setHistorial(mapped)
          return
        }
      } catch (err) {
        console.warn('Fallback a LocalStorage debido a error en Supabase:', err)
      }
    }

    const local = localStorage.getItem('gabi_presupuestos_historial')
    if (local) {
      try {
        setHistorial(JSON.parse(local))
      } catch (e) {
        setHistorial([])
      }
    }
  }

  const handleSavePresupuesto = async () => {
    if (!presupuesto.cliente.nombre && !presupuesto.vehiculo.patente) {
      alert('Por favor completá al menos el nombre del cliente o la patente del vehículo.')
      return
    }

    setIsSaving(true)
    
    const subtotalNeto = presupuesto.items.reduce((acc, curr) => acc + (curr.subtotal || 0), 0)
    const descuentoNum = parseFloat(presupuesto.descuento) || 0
    const baseImponible = Math.max(0, subtotalNeto - descuentoNum)
    const incluirIva = presupuesto.incluirIva !== false
    const montoIva = incluirIva ? baseImponible * 0.21 : 0
    const totalFinal = baseImponible + montoIva

    const newPresupuesto = {
      ...presupuesto,
      id: presupuesto.id || Date.now().toString(),
      numero: presupuesto.numero || (historial.length + 1).toString().padStart(4, '0'),
      fecha: presupuesto.fecha || new Date().toLocaleDateString('es-AR'),
      subtotal: subtotalNeto,
      montoIva,
      total: totalFinal
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          cliente_nombre: newPresupuesto.cliente.nombre,
          cliente_telefono: newPresupuesto.cliente.telefono,
          cliente_email: newPresupuesto.cliente.email,
          vehiculo_marca: newPresupuesto.vehiculo.marca,
          vehiculo_modelo: newPresupuesto.vehiculo.modelo,
          vehiculo_patente: newPresupuesto.vehiculo.patente,
          vehiculo_color: newPresupuesto.vehiculo.color,
          vehiculo_anio: newPresupuesto.vehiculo.anio ? parseInt(newPresupuesto.vehiculo.anio) : null,
          subtotal: subtotalNeto,
          descuento: descuentoNum,
          incluir_iva: incluirIva,
          total: totalFinal,
          observaciones: newPresupuesto.observaciones,
          items: newPresupuesto.items
        }

        const { error } = await supabase
          .from('presupuestos')
          .insert([payload])

        if (error) {
          console.error('Error guardando en Supabase:', error)
        }
      } catch (err) {
        console.error('Excepción guardando en Supabase:', err)
      }
    }

    const updatedHistorial = [newPresupuesto, ...historial.filter(h => h.id !== newPresupuesto.id)]
    setHistorial(updatedHistorial)
    localStorage.setItem('gabi_presupuestos_historial', JSON.stringify(updatedHistorial))

    setIsSaving(false)
    alert('¡Presupuesto guardado con éxito!')
    setActiveTab('historial')
  }

  const handleDeletePresupuesto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este presupuesto del historial?')) return

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('presupuestos').delete().eq('id', id)
      } catch (err) {
        console.error(err)
      }
    }

    const updated = historial.filter(item => item.id !== id)
    setHistorial(updated)
    localStorage.setItem('gabi_presupuestos_historial', JSON.stringify(updated))
  }

  const handleImportItems = (items) => {
    setPresupuesto(prev => ({
      ...prev,
      items: [...prev.items, ...items]
    }))
    setActiveTab('nuevo')
    alert(`Se importaron ${items.length} ítems desde el Excel al presupuesto actual.`)
  }

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSupabaseConfigured={isSupabaseConfigured} 
      />

      <main className="no-print">
        {activeTab === 'nuevo' && (
          <PresupuestoForm
            presupuesto={presupuesto}
            setPresupuesto={setPresupuesto}
            onSavePresupuesto={handleSavePresupuesto}
            onShowPreview={() => setShowPreview(true)}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'historial' && (
          <HistorialList
            historial={historial}
            onLoadPresupuesto={(p) => setPresupuesto(p)}
            onDeletePresupuesto={handleDeletePresupuesto}
            onShowPreview={() => setShowPreview(true)}
            isSupabaseConfigured={isSupabaseConfigured}
          />
        )}

        {activeTab === 'excel' && (
          <ExcelImporter onImportItems={handleImportItems} />
        )}
      </main>

      {showPreview && (
        <PresupuestoView
          presupuesto={presupuesto}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showSupabaseModal && (
        <SupabaseConfigModal
          isSupabaseConfigured={isSupabaseConfigured}
          onClose={() => {
            setShowSupabaseModal(false)
            if (activeTab === 'supabase') setActiveTab('nuevo')
          }}
        />
      )}
    </div>
  )
}
