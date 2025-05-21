import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const profesor = searchParams.get("id")
  const { data, error } = await supabase.from('profesores').select('*').eq("id", profesor).single();
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const { data: disponData, error: dispError } = await supabase.from('disponibilidad_profesor').select('profesor_id, dia, hora').eq('profesor_id', profesor);
  if (dispError) {
    return NextResponse.json({ error }, { status: 501 });
  }

  const { data: asigData, error: asigError } = await supabase.from('asignaturas_interes').select('profesor_id, materia_id, requerimientos').eq('profesor_id', profesor);
  if (asigError) {
    return NextResponse.json({ error }, { status: 502 });
  }

  const { data: cursosData, error: cursosError } = await supabase.from('cursos_actualizacion').select('profesor_id, nombre').eq('profesor_id', profesor)
  if (cursosError) {
    return NextResponse.json({ error }, {status: 503});
  }

  const { data: platData, error: platError } = await supabase.from('plataformas_digitales').select('profesor_id, nombre').eq('profesor_id', profesor)
  if (platError) {
    return NextResponse.json({ error }, {status: 504});
  }

  data.disponibilidad = disponData;
  data.asignaturas_interes = asigData;
  data.cursos = cursosData;
  data.plataformas = platData;
  return NextResponse.json(data);
}

interface asignatura {
  asignatura: string
  requerimientos: string
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
    const asignaturasData = asignaturas_interes.map((item: asignatura) => ({
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

// PUT/PATCH actualizar un profesor existente
export async function PUT(request: Request) {
  const {
    id,
    pdf,
    nombre,
    num_empleado,
    correo,
    coordina,
    disponibilidad,
    asignaturas_interes,
    cursos,
    plataformas,
    otros_programas
  } = await request.json()
  
  // Verificar que el id existe
  if (!id) {
    return NextResponse.json(
      { error: 'Se requiere especificar profesor para actualizar' },
      { status: 400 }
    );
  }
  if(pdf){
    const { error: deleteError } = await supabase
    .from('profesores')
    .delete()
    .eq('id', id); // Usamos el id para identificar el registro a eliminar

    if (deleteError) {
      return NextResponse.json({ deleteError }, { status: 500 });
    }
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
      const asignaturasData = asignaturas_interes.map((item: asignatura) => ({
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

    return NextResponse.json({ message: 'Profesor actualizado exitosamente' }, { status: 201 })
  }
  else{
    const { error: errorProfesor } = await supabase
    .from('profesores')
    .update({ nombre, num_empleado, correo, otros_programas, coordina })
    .eq('id', id);

    if (errorProfesor) return NextResponse.json({ error: errorProfesor.message }, { status: 500 });

    const tablasRelacionadas = [
      { tabla: 'disponibilidad_profesor', datos: disponibilidad },
      { tabla: 'asignaturas_interes', datos: asignaturas_interes },
      { tabla: 'plataformas_digitales', datos: plataformas },
      { tabla: 'cursos_actualizacion', datos: cursos },
    ];
    
    // 2. Elimina solo si hay datos nuevos
    for (const { tabla, datos } of tablasRelacionadas) {
      if (datos.length > 0) {
        const { error } = await supabase.from(tabla).delete().eq('profesor_id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 501 });
      }
    }
    
    // 3. Inserta solo si hay datos
    const insertPromises = tablasRelacionadas
      .filter(t => t.datos.length > 0)
      .map(t => supabase.from(t.tabla).insert(t.datos));
    
    const results = await Promise.all(insertPromises);
    
    for (const result of results) {
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 502 });
      }
    }

    // 4. Validación de clases según disponibilidad actualizada
    const { data: disponibilidadData, error: dispError } = await supabase
      .from('disponibilidad_profesor')
      .select('profesor_id, dia, hora')
      .eq('profesor_id', id);

    if (dispError) {
      return NextResponse.json({ error: dispError }, { status: 501 });
    }

    const { data: clasesData, error: clasesError } = await supabase
      .from('clases')
      .select('id, profesor_id, dia, hora')
      .eq('profesor_id', id);

    if (clasesError) {
      return NextResponse.json({ error: clasesError }, { status: 502 });
    }

    await Promise.all(clasesData.map(async (clase) => {
      const disponibilidad = disponibilidadData.find((d) => d.dia === clase.dia && (d.hora === clase.hora || parseInt(d.hora)+1==parseInt(clase.hora)));
      if (!disponibilidad) {
        const { error } = await supabase
          .from('clases')
          .delete()
          .eq('id', clase.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 503 });
      }
    }));

    return NextResponse.json({ message: 'Profesor actualizado' }, { status: 200 });
  }
}

// DELETE eliminar un profesor
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
