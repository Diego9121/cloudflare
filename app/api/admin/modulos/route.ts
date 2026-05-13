import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'modulos';

    if (tipo === 'modulos') {
      const { data, error } = await supabaseAdmin
        .from('modulos')
        .select('*')
        .order('nombre');
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    } else {
      const { data, error } = await supabaseAdmin
        .from('subcategorias')
        .select('*')
        .order('nombre');
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, ...data } = body;

    if (tipo === 'modulo') {
      const { data: modulo, error } = await supabaseAdmin
        .from('modulos')
        .insert({ nombre: data.nombre, prefijo_codigo: data.prefijo_codigo, imagen_url: data.imagen_url })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, data: modulo });
    } else if (tipo === 'subcategoria') {
      const { data: subcategoria, error } = await supabaseAdmin
        .from('subcategorias')
        .insert({ nombre: data.nombre, modulo_id: data.modulo_id, prefijo_codigo: data.prefijo_codigo })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, data: subcategoria });
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { tipo, id, ...data } = body;

    if (tipo === 'modulo') {
      const { error } = await supabaseAdmin
        .from('modulos')
        .update({ nombre: data.nombre, prefijo_codigo: data.prefijo_codigo, imagen_url: data.imagen_url })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (tipo === 'subcategoria') {
      const { error } = await supabaseAdmin
        .from('subcategorias')
        .update({ nombre: data.nombre, prefijo_codigo: data.prefijo_codigo })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const tipo = searchParams.get('tipo');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    if (tipo === 'modulo') {
      await supabaseAdmin.from('subcategorias').delete().eq('modulo_id', id);
      const { error } = await supabaseAdmin.from('modulos').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await supabaseAdmin.from('subcategorias').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}