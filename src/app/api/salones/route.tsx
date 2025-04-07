import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET() {
  const { data, error } = await supabase.from('salones').select('*');
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { edificio, num, capacidad } = await request.json();
  const { data, error } = await supabase
    .from('salones')
    .insert([{ edificio, num, capacidad }]);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PUT/PATCH actualizar un salón existente
export async function PUT(request: Request) {
  const { id, edificio, num, capacidad } = await request.json();
  
  // Verificar que el id existe
  if (!id) {
    return NextResponse.json(
      { error: 'Se requiere el ID del salón para actualizar' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('salones')
    .update({ edificio, num, capacidad })
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
      { error: 'Se requiere el ID del salón para eliminar' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('salones')
    .delete()
    .eq('id', id); // Usamos el id para identificar el registro a eliminar

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json(
    { message: 'Salón eliminado correctamente' },
    { status: 200 }
  );
}