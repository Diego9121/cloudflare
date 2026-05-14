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
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const filterAgotados = searchParams.get('agotados') === 'true';
    const filterModulo = searchParams.get('modulo') || '';
    const filterSubcategoria = searchParams.get('subcategoria') || '';

    // Búsqueda por ID específico
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ producto: data });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact' })
      .order('modulo_id', { ascending: true })
      .order('codigo', { ascending: true })
      .range(from, to);

    if (filterAgotados) {
      query = query.eq('stock', 0);
    }
    if (filterModulo) {
      query = query.eq('modulo_id', filterModulo);
    }
    if (filterSubcategoria) {
      query = query.eq('subcategoria_id', filterSubcategoria);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ productos: data, total: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Detectar si es bulk insert (array) o insert individual (object)
    const isBulk = Array.isArray(body);
    
    if (isBulk) {
      // Bulk insert para importación CSV
      const { data, error } = await supabaseAdmin
        .from('productos')
        .insert(body)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, productos: data, count: data?.length || 0 });
    } else {
      // Insert individual
      const { data, error } = await supabaseAdmin
        .from('productos')
        .insert(body)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, producto: data });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();

    const { error } = await supabaseAdmin
      .from('productos')
      .update(data)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}