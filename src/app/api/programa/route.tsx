// app/api/programa/[id]/route.ts
import { NextResponse } from 'next/server'
import { obtenerDatosPrograma } from '@/lib/pdf-gen/obtenerDatosPrograma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const programaId = parseInt(params.id)
  const datos = await obtenerDatosPrograma(programaId)
  return NextResponse.json(datos)
}
