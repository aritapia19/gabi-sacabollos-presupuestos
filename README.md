# 🚗 Gabi Sacabollos - Sistema de Presupuestos Automotrices

Aplicación web profesional para automatización de presupuestos de reparación de autos, sacabollos, pintura y detailing.

![Logo Gabi Sacabollos](public/logo.jpg)

## 🛠️ Tecnologías
- **Frontend**: React + Vite + Vanilla CSS (Modo Oscuro Industrial Negro, Gris y Naranja Neón).
- **Iconos**: Lucide React.
- **Base de Datos**: Supabase (PostgreSQL Cloud) + LocalStorage Fallback.
- **Lector Excel**: SheetJS (XLSX) para procesar planillas `Presupuesto.xlsx`.
- **Despliegue**: Vercel.

## 🚀 Instalación y Desarrollo Local

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

3. Compilar para producción (Vercel):
```bash
npm run build
```

## ☁️ Conexión a Supabase
1. Ejecutá el script `supabase_schema.sql` en el SQL Editor de tu proyecto en Supabase.
2. Agregá tus claves en un archivo `.env.local` o en la configuración de **Vercel**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
