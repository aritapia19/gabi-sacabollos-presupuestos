-- ================================================================
-- SCRIPT DE BASE DE DATOS SUPABASE - GABI SACABOLLOS
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase
-- ================================================================

-- 1. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    notas TEXT
);

-- 2. Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    patente TEXT NOT NULL UNIQUE,
    anio INTEGER,
    color TEXT
);

-- 3. Tabla de Presupuestos Head
CREATE TABLE IF NOT EXISTS presupuestos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    numero_presupuesto SERIAL UNIQUE,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_email TEXT,
    vehiculo_marca TEXT NOT NULL,
    vehiculo_modelo TEXT NOT NULL,
    vehiculo_patente TEXT NOT NULL,
    vehiculo_color TEXT,
    vehiculo_anio INTEGER,
    tiempo_estimado TEXT DEFAULT '24 hs (2 días)',
    fecha_emision DATE DEFAULT CURRENT_DATE NOT NULL,
    validez_dias INTEGER DEFAULT 15,
    estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobado', 'Rechazado', 'Completado')),
    subtotal NUMERIC(12,2) DEFAULT 0 NOT NULL,
    descuento NUMERIC(12,2) DEFAULT 0 NOT NULL,
    incluir_iva BOOLEAN DEFAULT true,
    total NUMERIC(12,2) DEFAULT 0 NOT NULL,
    observaciones TEXT,
    items JSONB,
    forma_pago TEXT DEFAULT 'Efectivo / Transferencia'
);

-- RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total a clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a vehiculos" ON vehiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a presupuestos" ON presupuestos FOR ALL USING (true) WITH CHECK (true);
