// pages/api/pdf-parse.tsx
import pdfParse from 'pdf-parse/lib/pdf-parse'

type Disponibilidad = { [key: string]: string[] }

type Resultado = {
  nombre: string | null
  num_empleado: string | null
  correo: string | null
  disponibilidad: Disponibilidad
  asignaturas_interes: { asignatura: string; requerimientos: string }[]
  cursos: string[]
  plataformas: string[]
  otros_programas?: string
}

const clean = (s: string | null | undefined): string | null =>
  s ? s.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : null

function extraerBloqueAsignaturas(textoCompleto: string): string[] {
  const inicio = textoCompleto.indexOf("Asignaturas de interés por impartir")
  if (inicio === -1) return []

  // Recorta desde esa posición
  const desdeAsignaturas = textoCompleto.slice(inicio)

  // Encuentra dónde podría terminar
  const fin =
    desdeAsignaturas.indexOf("MARQUE") != -1
      ? desdeAsignaturas.indexOf("MARQUE")
      : desdeAsignaturas.length

  const bloque = desdeAsignaturas.slice(0, fin)
  return bloque.split("\n").map((l) => l.trim()).filter((l) => l.length > 0)
}

function parsearAsignaturasYRequerimientos(lineas: string[]) {
  const resultado: { asignatura: string; requerimientos: string }[] = []

  let i = 0
  while (i < lineas.length) {
    const linea = lineas[i]

    if (linea.match(/(Pizarrón|cañón|pizarrones|Dos|Requerimientos)/i)) {
      const match = linea.match(/^(.+?)\s+(Pizarrón.*|Dos.*|Cañón)$/i)
      if (match) {
        resultado.push({
          asignatura: match[1].trim(),
          requerimientos: match[2].trim(),
        })
      }
      i++
      continue
    }

    const asignatura = linea
    const siguiente = lineas[i + 1] || ""

    if (siguiente.match(/(Pizarrón|cañón|pizarrones|Dos|Requerimientos)/i)) {
      resultado.push({
        asignatura,
        requerimientos: siguiente.trim(),
      })
      i += 2
    } else {
      resultado.push({ asignatura, requerimientos: null })
      i++
    }
  }

  return resultado
}



export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { file } = body

    if (!file) {
      return new Response(JSON.stringify({ error: 'Falta el archivo' }), {
        status: 400,
      })
    }

    const pdfBuffer = Buffer.from(file, 'base64')
    const data = await pdfParse(pdfBuffer)
    const text = data.text

    const getBetween = (text: string, start: string, end: string): string | null => {
      try {
        return text.split(start)[1].split(end)[0].trim()
      } catch {
        return null
      }
    }

    const nombre = clean(getBetween(text, 'Nombre:', 'No. Empleado:'))
    const num_empleado = clean(getBetween(text, 'No. Empleado:', 'Tel. Particular:'))
    const correo = clean(getBetween(text, 'Correo electrónico:', 'Tel. Celular:'))

    const horas = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-24']
    const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    const disponibilidad: Disponibilidad = dias.reduce((acc, dia) => ({ ...acc, [dia]: [] }), {})

    const lines = text.split('\n')
    lines.forEach(line => {
      horas.forEach(hora => {
        if (line.startsWith(hora)) {
          const partes = line.trim().split(/\s+/)
          const bloques = partes.slice(2)
          while (bloques.length < dias.length) bloques.push('')
          dias.forEach((dia, i) => {
            if (bloques[i]?.toUpperCase() === 'X') {
              disponibilidad[dia].push(hora)
            }
          })
        }
      })
    })

    const cursos: string[] = []
    const cursoMatch = text.match(/CURSOS DE ACTUALIZACIÓN.*?(\d{4}-\d{1})\s*(.*?)\s*(¿Imparte|¿En qué|Indique|Imparte clases|Programas|$)/s)
    if (cursoMatch) {
      cursos.push(...cursoMatch[2].split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean))
    }

    const plataformas: string[] = []
    if (text.includes('Google Classroom')) plataformas.push('Google Classroom')
    if (text.includes('Zotero')) plataformas.push('Zotero')
    if (text.includes('Sj Syntax Tree')) plataformas.push('Sj Syntax Tree')

    const otrosMatch = text.match(/¿Imparte clases en otro programa académico\?.*?Indique en cuales:\s*(.*)/s)
    const otros_programas = otrosMatch?.[1]?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()

    // Buscar requerimientos por asignatura
    const lineasAsignatura = extraerBloqueAsignaturas(text)
    const requerimientos_asignatura = parsearAsignaturasYRequerimientos(lineasAsignatura)

    const result: Resultado = {
      nombre,
      num_empleado,
      correo,
      disponibilidad,
      asignaturas_interes: requerimientos_asignatura,
      cursos,
      plataformas,
      otros_programas,
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Error al procesar el PDF' }), {
      status: 500,
    })
  }
}