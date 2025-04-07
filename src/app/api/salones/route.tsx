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