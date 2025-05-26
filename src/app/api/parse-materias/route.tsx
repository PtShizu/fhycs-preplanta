// pages/api/parse-materias.ts
import pdf from 'pdf-parse/lib/pdf-parse';
import { supabase } from '@/lib/supabase-client';

type Materia = {
  clave: string;
  nombre: string;
  horas_clase: number;
  horas_taller: number;
  horas_lab: number;
  hpc: number;
  hcl: number;
  he: number;
  creditos: number;
};

type MateriaPrograma = {
  nombre: string;
  tipo: 'obligatoria' | 'optativa';
  etapa: 'básica' | 'disciplinaria' | 'terminal' | null;
};

// Función para parsear la línea de datos numéricos
function parseDataLine(line: string) {
  // Normalizar la línea
  line = line.replace(/\s+/g, ' ').trim();
  const parts = line.split(' ').filter(p => p !== '');
  
  // Buscar créditos (último número)
  let creditosIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^\d{1,2}$/.test(parts[i])) {
      creditosIndex = i;
      break;
    }
  }
  
  if (creditosIndex === -1) return null;
  
  const creditos = parts[creditosIndex];
  const dataParts = parts.slice(0, creditosIndex);
  
  // Asignar valores with '--' como default
  return {
    hc: dataParts[0] || '--',
    hl: dataParts[1] || '--',
    ht: dataParts[2] || '--',
    hpc: dataParts[3] || '--',
    hcl: dataParts[4] || '--',
    he: dataParts[5] || '--',
    creditos
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { file, id } = body;

    if (!file) {
      return new Response(JSON.stringify({ error: 'Falta el archivo' }), {
        status: 400,
      });
    }

    const pdfBuffer = Buffer.from(file, 'base64');
    const data = await pdf(pdfBuffer);
    const text = data.text;
    const lines = text.split('\n');

    let etapaActual: MateriaPrograma['etapa'] = null;
    let tipoActual: MateriaPrograma['tipo'] = 'obligatoria';
    const materias: Materia[] = [];
    const materiasPrograma: MateriaPrograma[] = [];

    const etapaMap: Record<string, MateriaPrograma['etapa']> = {
      'ETAPA BÁSICA': 'básica',
      'ETAPA BASICA': 'básica',
      'ETAPA DISCIPLINARIA': 'disciplinaria',
      'ETAPA TERMINAL': 'terminal',
      'BASICA': 'básica',
      'DISCIPLINARIA': 'disciplinaria',
      'TERMINAL': 'terminal'
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Detección de encabezados de etapa y optativas
      const upperLine = line.toUpperCase();
      // Caso: OPTATIVAS ETAPA ...
      const optEtapaMatch = upperLine.match(/^OPTATIVAS\s+ETAPA\s+([A-ZÁÉÍÓÚ]+)/);
      if (optEtapaMatch && etapaMap[`ETAPA ${optEtapaMatch[1]}`]) {
        tipoActual = 'optativa';
        etapaActual = etapaMap[`ETAPA ${optEtapaMatch[1]}`];
        i++;
        continue;
      }
      // Caso: solo OPTATIVAS
      if (/^OPTATIVAS$/.test(upperLine)) {
        tipoActual = 'optativa';
        etapaActual = null;
        i++;
        continue;
      }
      // Caso: solo ETAPA ...
      const etapaSoloMatch = upperLine.match(/^ETAPA\s+([A-ZÁÉÍÓÚ]+)/);
      if (etapaSoloMatch && etapaMap[`ETAPA ${etapaSoloMatch[1]}`]) {
        tipoActual = 'obligatoria';
        etapaActual = etapaMap[`ETAPA ${etapaSoloMatch[1]}`];
        i++;
        continue;
      }
      
      // Detección de materia (clave de 6 dígitos)
      const claveMatch = line.match(/^(\d{6})(.+)?$/);
      if (!claveMatch) {
        i++;
        continue;
      }
      
      // Extraer clave y nombre
      const clave = claveMatch[1];
      let nombre = (claveMatch[2] || '').trim();
      i++;
      
      // Concatenar líneas de nombre
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (/^(\d+|--)\s+(\d+|--)/.test(nextLine)) break; // Inicio de datos
        if (/^\d{6}/.test(nextLine)) break; // Nueva materia
        nombre += ' ' + nextLine;
        i++;
      }
      
      // Parsear línea de datos
      if (i >= lines.length) break;
      
      const datosLine = lines[i].trim();
      const datos = parseDataLine(datosLine);
      
      if (!datos) {
        console.warn('No se pudieron parsear los datos para:', nombre);
        i++;
        continue;
      }
      
      // Construir objeto Materia
      materias.push({
        clave,
        nombre: nombre.trim(),
        horas_clase: parseInt(datos.hc === '--' ? '0' : datos.hc),
        horas_taller: parseInt(datos.ht === '--' ? '0' : datos.ht),
        horas_lab: parseInt(datos.hl === '--' ? '0' : datos.hl),
        hpc: parseInt(datos.hpc === '--' ? '0' : datos.hpc),
        hcl: parseInt(datos.hcl === '--' ? '0' : datos.hcl),
        he: parseInt(datos.he === '--' ? '0' : datos.he),
        creditos: parseInt(datos.creditos),
      });
      
      materiasPrograma.push({
        nombre: nombre.trim(),
        tipo: tipoActual,
        etapa: etapaActual,
      });
      
      i++;
    }

    // 1. Verificar materias existentes
    const { data: materiasExistentes, error: errorExist } = await supabase
      .from('materias')
      .select('id, clave, nombre');

    if (errorExist) {
      return new Response(JSON.stringify({ error: 'Error al obtener materias existentes' }), {
        status: 500,
      });
    }

    // Normaliza claves a string y trim en todo el flujo
    const normalizaClave = (clave: string | number) => String(clave).trim();

    const existentesClaveMap = new Map(materiasExistentes.map((m) => [normalizaClave(m.clave), m.id]));
    const existentesNombreMap = new Map(materiasExistentes.map((m) => [normalizaClave(m.clave), m.nombre]));

    // Eliminar duplicados en el array materias solo por clave y sincronizar materiasPrograma
    const materiasUnicasMap = new Map<string, { materia: Materia, programa: MateriaPrograma }>();
    for (let idx = 0; idx < materias.length; idx++) {
      const m = materias[idx];
      const claveNorm = normalizaClave(m.clave);
      if (!materiasUnicasMap.has(claveNorm)) {
        materiasUnicasMap.set(claveNorm, { materia: { ...m, clave: claveNorm }, programa: materiasPrograma[idx] });
      }
    }
    const materiasUnicas = Array.from(materiasUnicasMap.values()).map(obj => obj.materia);
    const materiasProgramaUnicas = Array.from(materiasUnicasMap.values()).map(obj => obj.programa);

    // 2. Insertar nuevas materias SOLO por clave (normalizada y sin duplicados en el lote)
    const nuevasMateriasMap = new Map<string, Materia>();
    for (const m of materiasUnicas) {
      const claveNorm = normalizaClave(m.clave);
      if (!existentesClaveMap.has(claveNorm) && !nuevasMateriasMap.has(claveNorm)) {
        nuevasMateriasMap.set(claveNorm, { ...m, clave: claveNorm });
      }
    }
    const nuevasMaterias = Array.from(nuevasMateriasMap.values());

    if (nuevasMaterias.length > 0) {
      // Insertar en lotes para evitar timeout y duplicados en el batch
      const batchSize = 20;
      for (let j = 0; j < nuevasMaterias.length; j += batchSize) {
        // Filtra duplicados por clave en el batch y log para depuración
        const batchMap = new Map<string, Materia>();
        for (const m of nuevasMaterias.slice(j, j + batchSize)) {
          const claveNorm = normalizaClave(m.clave);
          if (!batchMap.has(claveNorm)) {
            batchMap.set(claveNorm, m);
          }
        }
        let batch = Array.from(batchMap.values());
        if (batch.length === 0) { continue; }
        // Verifica en la base si alguna clave del batch ya existe
        const clavesBatch = batch.map(m => normalizaClave(m.clave));
        const { data: existentesEnBatch, error: errorBatchExist } = await supabase
          .from('materias')
          .select('clave')
          .in('clave', clavesBatch);
        if (errorBatchExist) {
          console.error('Error consultando claves existentes en batch:', errorBatchExist);
          throw errorBatchExist;
        }
        const clavesExistentesSet = new Set((existentesEnBatch || []).map(m => normalizaClave(m.clave)));
        batch = batch.filter(m => !clavesExistentesSet.has(normalizaClave(m.clave)));
        if (batch.length === 0) { continue; }
        // Log de claves del batch para depuración
        console.log('Claves a insertar en este batch:', batch.map(m => m.clave));
        const { data: insertadas, error: errorInsert } = await supabase
          .from('materias')
          .insert(batch)
          .select('id, clave');
        if (errorInsert) {
          console.error('Error insertando lote:', batch.map(m => m.nombre));
          throw errorInsert;
        }
        insertadas?.forEach((m) => {
          const claveNorm = normalizaClave(m.clave);
          existentesClaveMap.set(claveNorm, m.id);
        });
      }
    }

    // 3. Actualizar materias existentes (sincronizar cambios de nombre)
    const materiasActualizar = materias.filter(m => {
      const claveNorm = normalizaClave(m.clave);
      return existentesClaveMap.has(claveNorm) && existentesNombreMap.get(claveNorm) !== m.nombre;
    });

    if (materiasActualizar.length > 0) {
      const { error: errorUpdate } = await supabase
        .from('materias')
        .upsert(materiasActualizar.map(m => ({ ...m, id: existentesClaveMap.get(normalizaClave(m.clave)) })))
        .select('id, clave');

      if (errorUpdate) {
        return new Response(JSON.stringify({ error: 'Error al actualizar materias existentes' }), {
          status: 500,
        });
      }
    }

    // 3. Insertar en programas_materias
    // Reconstruir el map de claves a ids después de inserciones/actualizaciones
    // --- INICIO CAMBIO: paginación para obtener todas las materias ---
    async function obtenerTodasLasMaterias() {
        const pageSize = 1000;
        let page = 0;
        let todas: any[] = [];
        while (true) {
            const { data, error } = await supabase
                .from('materias')
                .select('id, clave')
                .range(page * pageSize, (page + 1) * pageSize - 1);
            if (error) {
                throw error;
            }
            if (data && data.length > 0) {
                todas = todas.concat(data);
                if (data.length < pageSize) {
                    break; // última página
                }
                page++;
            } else {
                break;
            }
        }
        return todas;
    }
    const materiasActualizadas = await obtenerTodasLasMaterias();
    // --- FIN CAMBIO ---
    // Normaliza la clave al construir el map
    const claveToIdMap = new Map((materiasActualizadas || []).map(m => [normalizaClave(m.clave), m.id]));

    // Borrar relaciones previas de materias para este programa
    const { error: errorBorradoRelacion } = await supabase
      .from('programas_materias')
      .delete()
      .eq('programa_id', id);
    if (errorBorradoRelacion) {
      return new Response(JSON.stringify({ error: 'Error al borrar materias relacionadas', detalle: errorBorradoRelacion.message }), {
        status: 502,
      });
    }

    // Insertar o actualizar en programas_materias
    const programasMateriasUpsert = materiasUnicas.map((materia, idx) => {
      const claveNorm = normalizaClave(materia.clave);
      return {
        materia_id: claveToIdMap.get(claveNorm) || null,
        programa_id: id,
        tipo: materiasProgramaUnicas[idx].tipo,
        etapa: materiasProgramaUnicas[idx].etapa,
      };
    }).filter(pm => pm.materia_id !== null);

    if (programasMateriasUpsert.length > 0) {
      const { error: errorPrograma } = await supabase
        .from('programas_materias')
        .upsert(programasMateriasUpsert, { onConflict: 'materia_id,programa_id' })
        .select('id, materia_id');

      if (errorPrograma) {
        return new Response(JSON.stringify({ error: 'Error al insertar en programas_materias', detalle: errorPrograma.message, supabase: errorPrograma }), {
          status: 500,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, materias: materias.length, programas: materiasPrograma.length }), {
      status: 200,
    });
  } catch (e) {
    console.error('Error en parse-materias:', e);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
    });
  }
}