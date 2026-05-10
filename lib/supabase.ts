import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateProductCode(moduloId: string): Promise<string> {
  const { data: modulo } = await supabase
    .from('modulos')
    .select('prefijo_codigo')
    .eq('id', moduloId)
    .single();
  
  if (!modulo) throw new Error('Módulo no encontrado');
  
  const prefijo = modulo.prefijo_codigo;
  
  const { count } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true })
    .like('codigo', `${prefijo}%`);
  
  const nextNumber = (count || 0) + 1;
  return `${prefijo}${String(nextNumber).padStart(3, '0')}`;
}

export async function createModulo(nombre: string, prefijo_codigo: string): Promise<Modulo> {
  const { data, error } = await supabase
    .from('modulos')
    .insert({ nombre, prefijo_codigo: prefijo_codigo.toUpperCase() })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function createSubcategoria(nombre: string, modulo_id: string): Promise<Subcategoria> {
  const { data, error } = await supabase
    .from('subcategorias')
    .insert({ nombre, modulo_id })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export interface Modulo {
  id: string;
  nombre: string;
  prefijo_codigo: string;
  imagen_url?: string | null;
  created_at: string;
}

export interface Subcategoria {
  id: string;
  modulo_id: string;
  nombre: string;
  created_at: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  modulo_id: string;
  subcategoria_id: string | null;
  precio: number;
  precio_descuento: number | null;
  stock: number;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
}

export interface Cotizacion {
  id: string;
  cliente_nombre: string;
  cliente_celular: string;
  cliente_departamento: string;
  cliente_provincia: string;
  cliente_notas: string;
  productos: CotizacionProducto[];
  estado: 'PENDIENTE' | 'PAGADO' | 'APROBADO' | 'RECHAZADO';
  created_at: string;
  updated_at: string;
}

export interface CotizacionProducto {
  producto_id: string;
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface AdminUser {
  id: string;
  nombre: string;
  password_hash: string;
}