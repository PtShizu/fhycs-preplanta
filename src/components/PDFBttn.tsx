'use client'

import { crearDocDefinitionPrograma } from "./GenerarHorarioPDF"
import obtenerDatosPrograma from "@/app/actions/obtenerDatosPrograma"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import { useUser } from "@supabase/auth-helpers-react"
pdfMake.vfs = pdfFonts.vfs;

export function BotonDescargaPDFPrograma({ programaId, nombrePrograma }: { programaId: number, nombrePrograma: string }) {
  const user = useUser();

  const handleClick = async () => {
    const res = await obtenerDatosPrograma(programaId)
    const datosPorGrupo = res
    console.log(datosPorGrupo)
    const docDefinition = crearDocDefinitionPrograma(nombrePrograma, datosPorGrupo, user?.email=='subdireccion.fhycstij@uabc.edu.mx')
    pdfMake.createPdf(docDefinition).download(`${nombrePrograma}_horarios.pdf`)
  }

  return <button className="btn btn-success ms-2" onClick={handleClick}>Descargar PDF</button>
}
