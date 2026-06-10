export const CATS = [
  { id: 'alquiler',    name: 'Alquiler',     icon: '🏠', color: '#D4537E', bg: '#FDF2F6' },
  { id: 'comida',      name: 'Comida',        icon: '🛒', color: '#993556', bg: '#F9D6E7' },
  { id: 'servicios',   name: 'Servicios',     icon: '⚡', color: '#888780', bg: '#F1EFE8' },
  { id: 'transporte',  name: 'Transporte',    icon: '🚗', color: '#5F5E5A', bg: '#E8E6E2' },
  { id: 'ocio',        name: 'Ocio',          icon: '🎬', color: '#ED93B1', bg: '#FBEAF0' },
  { id: 'salud',       name: 'Salud',         icon: '💊', color: '#B4B2A9', bg: '#F1EFE8' },
  { id: 'ropa',        name: 'Ropa',          icon: '👗', color: '#F2A8C8', bg: '#FDF2F6' },
  { id: 'otro',        name: 'Otros',         icon: '📦', color: '#D3D1C7', bg: '#F8F7F6' },
]

export const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export const catById = (id) => CATS.find(c => c.id === id) || CATS[CATS.length - 1]
