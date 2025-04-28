import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

interface GenHorarioProps {
    id: string;
    tipo: string;
    edificio?: string;
}

export default function GenerarHorarioVista({id, tipo, edificio}: GenHorarioProps) {
    const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const horas = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
    const [clases, setClases] = useState([])

    useEffect(() => {
        const fetchClases = async () => {
            const { data, error } = await supabase
            .from('clases')
            .select('*')
    
            if(error) return error
            setClases(data)
        }
        fetchClases();
    }, [])

    useEffect(() => {
        const fetchGrupoNum = async () => {
            const updatedClases = await Promise.all(
                clases.map(async (clase) => {
                    const { data, error } = await supabase
                        .from('grupos')
                        .select('nombre')
                        .eq('id', clase.grupo_id)
                        .single(); // Usar single() para obtener un solo resultado
    
                    if (error) {
                        console.error(`Error fetching group name for grupo_id ${clase.grupo_id}:`, error);
                        return clase; // Devuelve la clase original si hay un error
                    }
    
                    return { ...clase, grupo_nombre: data?.nombre }; // Agrega el nombre del grupo a la clase
                })
            );
    
            setClases(updatedClases); // Actualiza el estado con las clases modificadas
        };
    
        if (clases.length > 0) {
            fetchGrupoNum();
        }
    }, [clases]);

    useEffect(() => {
        const canal = supabase
          .channel('clases-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'clases' }, async (payload) => {
            console.log("Cambio detectado en clases:", payload);
      
            const { data: clasesActualizadas } = await supabase.from('clases').select('*');
      
            setClases(clasesActualizadas);
          })
          .subscribe();
      
        return () => {
          supabase.removeChannel(canal);
        };
      }, []);

    return(
        <table className="col-8 table table-bordered text-center align-middle">
              <thead>
                <tr>
                  <th>Hora / Día</th>
                  {dias.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {horas.map(hora => (
                  <tr key={hora}>
                    <th>{hora}:00 - {parseInt(hora) + 1}:00</th>
                    {dias.map(dia => {
                      let claseCelda
                      if(tipo=='profesor'){
                        claseCelda = clases.find(c => c.profesor_id == id && c.dia == dia && c.hora == hora);
                      }
                      else if(tipo=='salon'){
                        claseCelda = clases.find(c => c.salon == id && c.edificio == edificio && c.dia == dia && c.hora == hora);
                      }

                      return (
                        <td
                          key={dia + hora}
                          className={'p-2'}
                        >
                          {claseCelda ? (
                            <div className={`${claseCelda?.virtual=='síncrona' ? 'text-danger' : claseCelda?.virtual=='asíncrona' ? 'text-warning' : 'text-black'}`}>
                              {claseCelda.grupo_nombre ? claseCelda.grupo_nombre : ''}<br />
                              {claseCelda.materia_nombre}<br/>
                              {claseCelda.tipo}<br/>
                              {tipo == 'profesor' ? claseCelda.edificio+' '+claseCelda.salon : claseCelda.profesor_nombre}
                            </div>
                          ) : ''}
                        </td>
                      );
                    })}
                    
                  </tr>
                ))}
              </tbody>
            </table>
    )
}