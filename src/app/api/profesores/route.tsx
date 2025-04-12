import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const edificio = searchParams.get("edificio")
  const salon = searchParams.get("salon")
  const { data, error } = await supabase.from('salones').select('*').eq("edificio", edificio).eq("num", salon).single();
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
// El conjunto de edificio y número de salón actúan como el id
export async function PUT(request: Request) {
  const { prevEdificio, prevNum, edificio, num, capacidad } = await request.json();
  
  // Verificar que el id existe
  if (!edificio || !num) {
    return NextResponse.json(
      { error: 'Se requiere especificar edificio y salón para actualizar' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('salones')
    .update({ edificio, num, capacidad })
    .eq('edificio', prevEdificio).eq("num", prevNum); // Usamos el id para identificar el registro a actualizar

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE eliminar un salón
export async function DELETE(request: Request) {
  const { edificio, num } = await request.json();
  
  // Verificar que el id existe
  if (!edificio || !num) {
    return NextResponse.json(
      { error: 'Se requiere especificar edificio y salón para eliminar' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('salones')
    .delete()
    .eq('edificio', edificio).eq("num", num); // Usamos el id para identificar el registro a eliminar

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json(
    { message: 'Salón eliminado correctamente' },
    { status: 200 }
  );
}