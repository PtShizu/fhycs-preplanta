import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const { data, error } = await supabase.from('programas_educativos').select('*').eq("id", id).single();
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { nombre } = await request.json();
  const { data, error } = await supabase
    .from('programas_educativos')
    .insert([{ nombre }]);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PUT/PATCH actualizar un programa educativo existente
export async function PUT(request: Request) {
  const { id, nombre } = await request.json();
  
  // Verificar que el id existe
  if (!id) {
    return NextResponse.json(
      { error: 'Se requiere especificar programa educativo para actualizar' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('programas_educativos')
    .update({ nombre })
    .eq('id', id); // Usamos el id para identificar el registro a actualizar

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE eliminar un salón
export async function DELETE(request: Request) {
  const { id } = await request.json();
  
  // Verificar que el id existe
  if (!id) {
    return NextResponse.json(
      { error: 'Se requiere especificar programa educativo para eliminar' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('programas_educativos')
    .delete()
    .eq('id', id); // Usamos el id para identificar el registro a eliminar

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json(
    { message: 'Programa educativo eliminado correctamente' },
    { status: 200 }
  );
}