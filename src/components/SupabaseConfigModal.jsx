import React, { useState } from 'react'
import { Database, CheckCircle2, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react'

export default function SupabaseConfigModal({ isSupabaseConfigured, onClose }) {
  const [copied, setCopied] = useState(false)

  const sqlInstructions = `CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  numero SERIAL,
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  vehiculo_marca TEXT,
  vehiculo_modelo TEXT,
  vehiculo_patente TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  subtotal NUMERIC,
  descuento NUMERIC,
  total NUMERIC,
  observaciones TEXT,
  items JSONB
);
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total" ON presupuestos FOR ALL USING (true) WITH CHECK (true);`

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlInstructions)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
            <Database color="var(--orange-primary)" size={24} />
            <span>Configuración de Supabase & Vercel Nube</span>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem 0.8rem' }}>Cerrar</button>
        </div>

        {/* Estado actual */}
        <div style={{ background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 107, 0, 0.1)', border: `1px solid ${isSupabaseConfigured ? '#10b981' : 'var(--orange-primary)'}`, padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {isSupabaseConfigured ? <CheckCircle2 color="#10b981" size={24} /> : <AlertCircle color="var(--orange-primary)" size={24} />}
          <div>
            <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
              {isSupabaseConfigured ? 'Conexión a Supabase Nube Activa' : 'Modo Almacenamiento Local (Sin Nube Conectada)'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isSupabaseConfigured 
                ? 'Tus presupuestos se guardan y sincronizan automáticamente en Supabase.'
                : 'La app funciona perfectamente guardando en tu navegador. Para sincronizar celulares y notebooks, configurá tus claves de Supabase en Vercel.'}
            </div>
          </div>
        </div>

        {/* Pasos para conectar a Supabase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>Pasos rápidos para conectar con Supabase:</h4>
          
          <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li>
              Creá un proyecto gratuito en <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--orange-primary)', fontWeight: 'bold' }}>Supabase.com</a>.
            </li>
            <li>
              Andá al <strong>SQL Editor</strong> en Supabase, pegá la estructura de tablas que te dejamos lista y ejecutala.
              <div style={{ marginTop: '0.35rem' }}>
                <button className="btn-secondary" onClick={handleCopySql} style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}>
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                </button>
              </div>
            </li>
            <li>
              Andá a <strong>Project Settings → API</strong> y copiá la <code>URL</code> y la <code>anon public key</code>.
            </li>
            <li>
              En **Vercel**, agregá las siguientes variables de entorno en las propiedades de tu proyecto:
              <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem', fontFamily: 'monospace', color: 'var(--orange-primary)' }}>
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
