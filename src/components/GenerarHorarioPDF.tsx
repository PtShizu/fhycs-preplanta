export function crearDocDefinitionPrograma(nombrePrograma: string, datosPorGrupo: any[], subdirector: boolean) {
    const contenido: any[] = [
      {
        text: `UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA\nFACULTAD DE HUMANIDADES Y CIENCIAS SOCIALES`,
        style: 'header'
      },
      {
        text: `HORARIO PRE-PLANTA DE ${nombrePrograma.toUpperCase()} 2025-1`,
        style: 'subheader',
      }
    ]
  
    for (let i = 0; i < datosPorGrupo.length; i++) {
      const grupoData = datosPorGrupo[i];
      const isLastElement = i === datosPorGrupo.length - 1;
      const header = [
        { text: 'CLAVE ASIGNAT.', style: 'tableHeader' },
        { text: 'DESCRIPCIÓN MAESTRO', style: 'tableHeader' },
        { text: 'EDIFICIO', style: 'tableHeader' },
        { text: 'SALÓN', style: 'tableHeader' },
        { text: 'CAP ASG', style: 'tableHeader' },
        { text: 'CR.', style: 'tableHeader' },
        { text: 'LUNES', style: 'tableHeader' },
        { text: 'MARTES', style: 'tableHeader' },
        { text: 'MIÉRCOLES', style: 'tableHeader' },
        { text: 'JUEVES', style: 'tableHeader' },
        { text: 'VIERNES', style: 'tableHeader' },
        { text: 'SÁBADO', style: 'tableHeader' }
      ]
  
      const rows = grupoData.datos.map((d: any) => [
        d.clave,
        [
          { text: d.materia_nombre, bold: true },
          { text: d.tipo=='optativa' ? '(optativa)' : '', bold: true },
          { text: d.profesor_nombre }
        ],
        d.edificio,
        d.salon,
        d.capacidad,
        d.creditos,
        d.horarios.LUNES || '',
        d.horarios.MARTES || '',
        d.horarios.MIÉRCOLES || '',
        d.horarios.JUEVES || '',
        d.horarios.VIERNES || '',
        d.horarios.SÁBADO || ''
      ])
  
      contenido.push(
        { text: `Grupo ${grupoData.grupo}`, style: 'group' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [header, ...rows]
          },
          layout: 'grid',
          margin: [0, 0, 0, 10],
          alignment: 'center'
        }
      )
      if(!isLastElement)
        contenido.push({text:'', pageBreak:'after'})
    }
  
    return {
      pageOrientation: 'landscape',
      content: contenido,
      styles: {
        header: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 0],
        },
        subheader: {
          fontSize: 10,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        group: {
          fontSize: 11,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 10],
        },
        tableHeader: {
          bold: true,
          fillColor: '#2da624',
          alignment: 'center',
        },
      },
      defaultStyle: {
        fontSize: 9,
      },
    }
  }
  