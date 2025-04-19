import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const profesor = searchParams.get("profesor")
  const { data, error } = await supabase.from('profesores').select('*').eq("id", profesor).single();
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const {
    nombre,
    num_empleado,
    correo,
    disponibilidad,
    asignaturas_interes,
    cursos,
    plataformas,
    otros_programas
  } = await request.json()

  // 1. Insertar en 'profesores'
  const { data: profesorInsertado, error: errorProfesor } = await supabase
    .from('profesores')
    .insert([{ nombre, num_empleado, correo, otros_programas }])
    .select()
    .single()

  if (errorProfesor) {
    return NextResponse.json({ error: errorProfesor }, { status: 501 })
  }

  const profesor_id = profesorInsertado.id

  // 2. Insertar disponibilidad
  const disponibilidadData = []
  for (const [dia, rangos] of Object.entries(disponibilidad) as [string, string[]][]) {
    for (const rango of rangos) {
      const [hora] = rango.split('-')
      disponibilidadData.push({
        profesor_id,
        dia,
        hora,
      })
    }
  }

  if (disponibilidadData.length > 0) {
    const { error: errorDisponibilidad } = await supabase
      .from('disponibilidad_profesor')
      .insert(disponibilidadData)

    if (errorDisponibilidad) {
      return NextResponse.json({ error: errorDisponibilidad }, { status: 502 })
    }
  }

  // 3. Insertar asignaturas de interés (con requerimientos)
  if (asignaturas_interes.length > 0) {
    const asignaturasData = asignaturas_interes.map((item: any) => ({
      profesor_id,
      materia_id: item.asignatura,
      requerimientos: item.requerimientos,
    }))
    console.log(asignaturasData)

    const { error: errorAsignaturas } = await supabase
      .from('asignaturas_interes')
      .insert(asignaturasData)

    if (errorAsignaturas) {
      return NextResponse.json({ error: errorAsignaturas }, { status: 503 })
    }
  }

  // 4. Insertar cursos
  if (cursos.length > 0) {
    const cursosData = cursos.map((nombre: string) => ({
      profesor_id,
      nombre,
    }))

    const { error: errorCursos } = await supabase
      .from('cursos_actualizacion')
      .insert(cursosData)

    if (errorCursos) {
      return NextResponse.json({ error: errorCursos }, { status: 504 })
    }
  }

  // 5. Insertar plataformas
  if (plataformas.length > 0) {
    const plataformasData = plataformas.map((nombre: string) => ({
      profesor_id,
      nombre,
    }))

    const { error: errorPlataformas } = await supabase
      .from('plataformas_digitales')
      .insert(plataformasData)

    if (errorPlataformas) {
      return NextResponse.json({ error: errorPlataformas }, { status: 505 })
    }
  }

  return NextResponse.json({ message: 'Profesor registrado con éxito' }, { status: 201 })
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
  const { id } = await request.json();
  
  // Verificar que el id existe
  if (!id) {
    return NextResponse.json(
      { error: 'Se requiere especificar id para eliminar' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('profesores')
    .delete()
    .eq('id', id); // Usamos el id para identificar el registro a eliminar

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json(
    { message: 'Eliminado correctamente' },
    { status: 200 }
  );
}