'use client'

import { crearDocDefinitionPrograma } from "./GenerarHorarioPDF"
import { obtenerDatosPrograma } from "@/lib/pdf-gen/obtenerDatosPrograma"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.vfs;

export function BotonDescargaPDFPrograma({ programaId, nombrePrograma }: { programaId: number, nombrePrograma: string }) {
  const handleClick = async () => {
    const res = await obtenerDatosPrograma(programaId)
    const datosPorGrupo = res
    console.log(datosPorGrupo)
    const docDefinition = crearDocDefinitionPrograma(nombrePrograma, datosPorGrupo)
    pdfMake.createPdf(docDefinition).download(`${nombrePrograma}_horarios.pdf`)
  }

  return <button className="btn btn-success ms-2" onClick={handleClick}>Descargar PDF</button>
}
