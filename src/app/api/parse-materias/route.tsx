// pages/api/parse-materias.ts
import pdf from 'pdf-parse/lib/pdf-parse'
import { supabase } from '@/lib/supabase-client'

type Materia = {
  nombre: string
  horas_clase: number
  horas_taller: number
  horas_lab: number
  hpc: number
  hcl: number
  he: number
  creditos: number
}

type MateriaPrograma = {
  nombre: string
  tipo: 'obligatoria' | 'optativa'
  etapa: 'básica' | 'disciplinaria' | 'terminal' | null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { file, id } = body

    if (!file) {
        return new Response(JSON.stringify({ error: 'Falta el archivo' }), {
        status: 400,
        })
    }

    const pdfBuffer = Buffer.from(file, 'base64')
    const data = await pdf(pdfBuffer)
    const text = data.text
    const lines = text.split('\n')

    let etapaActual: MateriaPrograma['etapa'] = null
    let tipoActual: MateriaPrograma['tipo'] = 'obligatoria'

    const materias: Materia[] = []
    const materiasPrograma: MateriaPrograma[] = []

    const etapaMap: Record<string, MateriaPrograma['etapa']> = {
        'ETAPA BÁSICA': 'básica',
        'ETAPA BASICA': 'básica',
        'ETAPA DISCIPLINARIA': 'disciplinaria',
        'ETAPA TERMINAL': 'terminal',
    }

    let i = 0

    while (i < lines.length) {
        const line = lines[i].trim()
      
        // ——— Detección de etapa y tipo (igual que antes) ———
        if (etapaMap[line]) {
          etapaActual = etapaMap[line]
          tipoActual = 'obligatoria'
          i++
          continue
        }
        if (/^OPTATIVAS ?( ETAPA \w+)?$/i.test(line)) {
            tipoActual = 'optativa'
          
            const match = line.toUpperCase().match(/ETAPA\s+(\w+)/)
            if (match) {
              const etapa = match[1].toLowerCase()
              if (['basica', 'básica', 'disciplinaria', 'terminal'].includes(etapa)) {
                etapaActual = etapa as MateriaPrograma['etapa']
              }
            } else {
              etapaActual = null // Optativas sin etapa
            }
          
            i++
            continue
          }
          
      
        // ——— Línea que empieza con clave de 6 dígitos ———
        const claveMatch = line.match(/^(\d{6})(.+)?$/)
        if (!claveMatch) { i++; continue }
      
        // Extraer clave y nombre
        //const clave = claveMatch[1]
        let nombre = (claveMatch[2] || '').trim()
        i++
      
        // Concatenar líneas de nombre hasta llegar a la línea de datos numéricos
        while (
          i < lines.length &&
          !/^\s*(?:\d+|--)\s+[^\s]/.test(lines[i])  // detecta inicio de datos: número o '--' + espacio + algo
        ) {
          nombre += ' ' + lines[i].trim()
          i++
        }
      
        // Ahora lines[i] debería ser la línea de datos
        let datosLine = (lines[i] || '').trim()
        // Normaliza todos los espacios/tab a un solo espacio
        datosLine = datosLine.replace(/\s+/g, ' ')
        const parts = datosLine.split(' ')
      
        let hc: string, hl: string, ht: string, hpc: string, hcl: string, he: string, creditos: string
      
        if (parts.length === 7) {
          // Caso esperado: [HC, HL, HT, HPC, HCL, HE, CR]
          [hc, hl, ht, hpc, hcl, he, creditos] = parts
        } else if (parts.length === 6) {
          // PDF-parse pegó HE+CR en un solo token como '206'
          [hc, hl, ht, hpc, hcl, /* combinado */] = parts
          const combinado = parts[5]
          // Separa todo salvo los últimos 2 dígitos como HE, y los últimos 2 como créditos
          he = combinado.slice(0, combinado.length - 2)
          creditos = combinado.slice(-2)
        } else {
          console.warn('Formato inesperado en datos de materia:', parts)
          i++
          continue
        }
      
        // Validar que crédito es numérico
        if (!/^\d{1,2}$/.test(creditos)) {
          console.warn('Créditos inválidos:', creditos, 'en línea:', datosLine)
          i++
          continue
        }
      
        // Construir el objeto Materia
        materias.push({
          nombre,
          horas_clase: parseInt(hc === '--' ? '0' : hc),
          horas_taller: parseInt(ht === '--' ? '0' : ht),
          horas_lab:   parseInt(hl === '--' ? '0' : hl),
          hpc:         parseInt(hpc === '--' ? '0' : hpc),
          hcl:         parseInt(hcl === '--' ? '0' : hcl),
          he:          parseInt(he === '--' ? '0' : he),
          creditos:    parseInt(creditos),
        })
      
        materiasPrograma.push({
          nombre,
          tipo: tipoActual,
          etapa: etapaActual,
        })
      
        i++
      }

    // 1. Verificar materias existentes
    const { data: materiasExistentes, error: errorExist } = await supabase
    .from('materias')
    .select('id, nombre')

    if (errorExist) {
        return new Response(JSON.stringify({ error: 'error al obtener materias' }), {
            status: 500,
          })
    }

    const existentesMap = new Map(materiasExistentes.map((m) => [m.nombre.toLowerCase(), m.id]))

    // 2. Insertar nuevas materias (solo si no existen)
    const nuevasMaterias = materias.filter((m) => !existentesMap.has(m.nombre.toLowerCase()))

    if (nuevasMaterias.length > 0) {
        const { data: insertadas, error: errorInsert } = await supabase
        .from('materias')
        .insert(nuevasMaterias)
        .select('id, nombre')

        if (errorInsert) {
        return new Response(JSON.stringify({ error: 'error al insertar nuevas materias' }), {
                status: 501,
            })
        }

        insertadas?.forEach((m) => {
        existentesMap.set(m.nombre.toLowerCase(), m.id)
        })
    }

    // 3. Insertar en programas_materias
    const materiasRelacionadas = materiasPrograma.map((m) => ({
    programa_id: id,
    materia_id: existentesMap.get(m.nombre.toLowerCase()),
    tipo: m.tipo,
    etapa: m.etapa,
    semestre: null,
    }))

    const { error: errorBorradoRelacion } = await supabase
    .from('programas_materias')
    .delete()
    .eq('programa_id', id)

    if (errorBorradoRelacion) {
        return new Response(JSON.stringify({ error: 'error al borrar materias relacionadas' }), {
            status: 502,
          })
    }

    const { error: errorRelacion } = await supabase
    .from('programas_materias')
    .insert(materiasRelacionadas)

    if (errorRelacion) {
        return new Response(JSON.stringify({ error: 'error al insertar materias relacionadas' }), {
            status: 502,
          })
    }

    return new Response(JSON.stringify({ message: 'Materias insertadas correctamente' }), {
        status: 200,
      })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Error al procesar el PDF' }), {
      status: 503,
    })
  }
}
