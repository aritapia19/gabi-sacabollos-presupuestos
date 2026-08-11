import * as XLSX from 'xlsx'

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const result = []
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          result.push({
            sheetName,
            rows: json
          })
        })

        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

// Extrae ítems detectados de planillas típicas de presupuesto
export const extractItemsFromRows = (rows) => {
  const items = []
  
  rows.forEach((row, index) => {
    if (!row || row.length === 0) return
    
    // Busca filas que contengan una descripción y un monto numérico
    const desc = row.find(cell => typeof cell === 'string' && cell.trim().length > 3)
    const price = row.find(cell => typeof cell === 'number' && cell > 0)
    
    if (desc && price) {
      items.push({
        id: `excel-${index}`,
        descripcion: desc.trim(),
        precio: price,
        categoria: 'Importado Excel'
      })
    }
  })
  
  return items
}
