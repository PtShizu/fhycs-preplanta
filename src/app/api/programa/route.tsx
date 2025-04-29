// app/api/programa/[id]/route.ts
import { NextResponse } from 'next/server'
import { POST } from '../pdf-gen/route'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const programaId = parseInt(params.id)
  const datos = await POST(programaId)
  return NextResponse.json(datos)
}
