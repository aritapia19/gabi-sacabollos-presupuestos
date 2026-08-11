import React, { useState } from 'react'
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { parseExcelFile, extractItemsFromRows } from '../lib/excelParser'

export default function ExcelImporter({ onImportItems }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [extractedSheets, setExtractedSheets] = useState([])
  const [selectedItems, setSelectedItems] = useState([])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const sheets = await parseExcelFile(file)
      setExtractedSheets(sheets)
      
      // Extrae ítems automáticamente de la primera hoja
      if (sheets.length > 0) {
        const items = extractItemsFromRows(sheets[0].rows)
        setSelectedItems(items)
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo procesar el archivo Excel. Asegurate de seleccionar un archivo .xlsx válido.')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyImport = () => {
    if (selectedItems.length === 0) return
    onImportItems(selectedItems)
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <FileSpreadsheet size={22} />
          <span>Importador de Presupuestos desde Excel</span>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Seleccioná tu archivo manual de Excel (por ejemplo <code style={{ color: 'var(--orange-primary)' }}>Presupuesto.xlsx</code>) para extraer automáticamente la lista de trabajos, insumos y precios hacia el sistema.
      </p>

      {/* Selector de Archivo Drag & Drop */}
      <div 
        style={{ 
          border: '2px dashed var(--border-orange)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '2.5rem 1rem', 
          textAlign: 'center', 
          background: 'rgba(255, 107, 0, 0.03)',
          cursor: 'pointer'
        }}
      >
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
          id="excel-file-input"
        />
        <label htmlFor="excel-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <Upload size={40} color="var(--orange-primary)" />
          <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>
            {loading ? 'Leyendo archivo Excel...' : 'Hacé clic acá para seleccionar Presupuesto.xlsx'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Archivos soportados: .XLSX / .XLS</span>
        </label>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Ítems Detectados */}
      {selectedItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>
              Se detectaron {selectedItems.length} trabajos / ítems en la planilla:
            </h4>
            <button className="btn-primary" onClick={handleApplyImport}>
              <Plus size={16} />
              <span>Importar Ítems al Presupuesto Actual</span>
            </button>
          </div>

          <div className="items-table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Descripción extraída</th>
                  <th style={{ textAlign: 'right' }}>Precio detectado</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.descripcion}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--orange-primary)' }}>
                      ${item.precio.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
