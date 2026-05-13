import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function POST(request: Request) {
  try {
    const { nombre, password } = await request.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('nombre', nombre)
      .limit(1)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    const passwordValid = password === admin.password_hash;
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      admin: { id: admin.id, nombre: admin.nombre }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error del servidor' },
      { status: 500 }
    );
  }
}