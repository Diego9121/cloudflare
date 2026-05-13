import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cotizaciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ cotizaciones: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, estado, productos, actualizarStock } = await request.json();

    if (actualizarStock && productos) {
      for (const producto of productos) {
        const { data: productoActual } = await supabaseAdmin
          .from('productos')
          .select('stock')
          .eq('id', producto.producto_id)
          .single();

        if (productoActual) {
          await supabaseAdmin
            .from('productos')
            .update({ stock: productoActual.stock + producto.cantidad })
            .eq('id', producto.producto_id);
        }
      }
    }

    const { error } = await supabaseAdmin
      .from('cotizaciones')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
      .from('cotizaciones')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}