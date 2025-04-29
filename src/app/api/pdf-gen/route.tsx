'use server'

import { supabase } from "@/lib/supabase-client"

type Rango = { start: string; end: string; virtual?: string | null }

function agruparHorariosPorModalidad(horas: { start: string, end: string, virtual?: string | null }[]): string[] {
  const sorted = horas.sort((a, b) => a.start.localeCompare(b.start));

  const agrupados: Rango[] = [];
  for (const current of sorted) {
    const last = agrupados[agrupados.length - 1];
    if (last && last.end === current.start && last.virtual === current.virtual) {
      last.end = current.end; // unir si es contiguo y misma modalidad
    } else {
      agrupados.push({ ...current });
    }
  }

  return agrupados.map(r =>
    `${r.start}-${r.end}${r.virtual ? ` (${r.virtual})` : ''}`
  );
}

export async function obtenerDatosPrograma(programaId: number) {
  const { data: programa } = await supabase
    .from('programas_educativos')
    .select('numero_grupo')
    .eq('id', programaId)
    .single()

  if (!programa) return []

  const { data: grupos } = await supabase
    .from('grupos')
    .select('id, nombre')
    .like('nombre', `${programa.numero_grupo}%`)

  const resultado = []

  for (const grupo of grupos || []) {
    const { data: clases } = await supabase
      .rpc('get_clases_por_programa', { programa_id: programaId });

    const materiasPorFila = (clases || []).reduce((acc: any, clase) => {
      if (clase.grupo_id != grupo.id) return acc;

      const key = clase.materia_id;
      if (!acc[key]) {
        acc[key] = {
          clave: clase.clave,
          materia_nombre: clase.materia_nombre,
          profesor_nombre: clase.profesor_nombre,
          edificio: clase.edificio,
          salon: clase.salon,
          capacidad: clase.capacidad || '',
          creditos: clase.creditos || '',
          tipo: clase.tipo_materia,
          horarios: {
            LUNES: [],
            MARTES: [],
            MIÉRCOLES: [],
            JUEVES: [],
            VIERNES: [],
            SÁBADO: []
          }
        };
      }

      const dia = clase.dia?.toUpperCase();
      const inicio = clase.hora.padStart(2, '0') + ':00';
      const fin = (parseInt(clase.hora) + 1).toString().padStart(2, '0') + ':00';

      acc[key].horarios[dia].push({
        start: inicio,
        end: fin,
        virtual: clase.virtual || null
      });

      return acc;
    }, {});

    // Agrupar por modalidad
    for (const key in materiasPorFila) {
      const materia = materiasPorFila[key];
      for (const dia in materia.horarios) {
        const agrupado = agruparHorariosPorModalidad(materia.horarios[dia]);
        materia.horarios[dia] = agrupado.join('\n');
      }
    }

    resultado.push({
      grupo: grupo.nombre,
      datos: Object.values(materiasPorFila)
    });
  }

  return resultado;
}
