'use client';

import React, { useEffect, useState } from 'react';
import Nav from '../Nav';
import { supabase } from '@/lib/supabase-client';
import { useSessionContext, useUser } from '@supabase/auth-helpers-react';

export default function Home() {
  const { isLoading } = useSessionContext();
  const user = useUser();

  const [programa, setPrograma] = useState({
    id: '',
    nombre: '' ,
    numero_grupo: ''
  });
  const [grupos, setGrupos] = useState([]);
  const [userData, setUserData] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [grupoSemestre, setGrupoSemestre] = useState('');
  const [profesorDisponibilidad, setProfesorDisponibilidad] = useState([]);
  const [profesorSeleccionadoDisponibilidad, setProfesorSeleccionadoDisponibilidad] = useState([]);
  const [celdasDisponibles, setCeldasDisponibles] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [programas_materias, setProgramasMaterias] = useState([]);
  const [finalMaterias, setFinalMaterias] = useState([]);
  const [edificio, setEdificio] = useState('');
  const [salones, setSalones] = useState([]); // todos los salones
  const [clases, setClases] = useState([]);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState('')
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
  const [asignaturas_interes, setAsignaturasInteres] = useState([]);
  const [profesores_interes, setProfesoresInteres] = useState([]);
  const [salonesDisponibles, setSalonesDisponibles] = useState([]);
  const [tiposClase, setTiposClase] = useState<string[]>([]);
  const [clase, setClase] = useState({
    profesor_id: '',
    profesor_nombre: '',
    materia_id: '',
    materia_nombre: '',
    grupo_id: '',
    edificio: '',
    salon: '',
    dia: '',
    hora: '',
    tipo: '' // clase, taller, laboratorio
  });
  const [celda, setCelda] = useState(null);

  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const horas = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
  let coordinaFlag = false;

  useEffect(() => {
    if (isLoading || !user) return;

    const fetchData = async () => {
      const { data: userData } = await supabase.from('profesores').select('coordina').eq('correo', user.email).single();
      const { data: profesoresData } = await supabase.from('profesores').select('*');
      const { data: materiasData } = await supabase.from('materias').select('*');
      const { data: clasesData } = await supabase.from('clases').select('*');
      const { data: profesorDisponibilidadData } = await supabase.from('disponibilidad_profesor').select('*');
      const { data: salonesData } = await supabase.from('salones').select('*');
      setUserData(userData);
      setSalones(salonesData);
      setProfesores(profesoresData);
      setMaterias(materiasData);
      setClases(clasesData);
      setProfesorDisponibilidad(profesorDisponibilidadData);
      
    };
    fetchData();
  }, [isLoading, user]);

  useEffect(() => {
    coordinaFlag = true;
    const fetchPrograma = async () => {
      if (!userData.coordina) return;
      const { data: programaData } = await supabase.from('programas_educativos').select('*').eq('nombre', userData.coordina || '').single();
      if (!programaData) {
        console.error('No se encontró el programa educativo para el usuario:', userData.coordina);
        return;
      }
      setPrograma(programaData);
    }
    if (userData) {
      fetchPrograma();
    }
  },[userData]);

  useEffect(() => {
    const fetchProgramasMaterias = async () => {
      const { data: programasMateriasData } = await supabase
        .from('programas_materias')
        .select('*')
        .eq('programa_id', programa.id);
      setProgramasMaterias(programasMateriasData);
    }
    if (programa.id) {
      fetchProgramasMaterias();
    }
  },[programa])

  useEffect(() => {
    setGrupoSemestre(grupoSeleccionado?.nombre.split('')[1]);
  }, [grupoSeleccionado]);

  useEffect(() => {
    finalMaterias.length = 0; // Limpiar el array antes de llenarlo
    if (!grupoSemestre) return; // Asegurarse de que grupoSemestre no esté vacío
    materias.forEach((materia) => {
      programas_materias.forEach((programa) => {
        if (materia.id == programa.materia_id && programa.semestre == grupoSemestre) {
          setFinalMaterias(prev => [...prev, materia]);
        }
      });
    });
  },[grupoSemestre]);

  useEffect(() => {
    if(clase.dia && clase.hora) {
      manejarDisponibilidad();
    }
  }, [clase.dia, clase.hora]);

  useEffect(() => {
    setAsignaturasInteres([]);
    const fetchAsignaturasInteres = async () => {
      const { data: asignaturasData } = await supabase.from('asignaturas_interes').select('*').eq('profesor_id', clase.profesor_id);
      materias.forEach((mat) => {
        asignaturasData.forEach((asignatura) => {
          if(asignatura.materia_id === mat.nombre) {
            setAsignaturasInteres(prev => [...prev, mat.id]);
          }
        });
      });
    };
    if (clase.profesor_id) {
      fetchAsignaturasInteres();
    }
    setProfesorSeleccionadoDisponibilidad([]);
    setCeldasDisponibles([]);
    if (!clase.profesor_id) return;
    profesorDisponibilidad.forEach((disponibilidad) => {
      if (disponibilidad.profesor_id == clase.profesor_id && clases.find(c => c.dia == disponibilidad.dia && c.hora == disponibilidad.hora && (c.grupo_id==grupoSeleccionado.id || c.profesor_id==clase.profesor_id))=== undefined) {
        setProfesorSeleccionadoDisponibilidad(prev => [...prev, {dia: `${disponibilidad.dia}`, hora: `${(disponibilidad.hora)}`}]);
        setProfesorSeleccionadoDisponibilidad(prev => [...prev, {dia: `${disponibilidad.dia}`, hora: `${(parseInt(disponibilidad.hora) + 1)==9 ? '09' : (parseInt(disponibilidad.hora) + 1)}`}]);
      }
      else if (disponibilidad.profesor_id == clase.profesor_id && clases.find(c => c.dia == disponibilidad.dia && c.hora == '08' && (c.grupo_id==grupoSeleccionado.id || c.profesor_id==clase.profesor_id))!== undefined) {
        setProfesorSeleccionadoDisponibilidad(prev => [...prev, {dia: `${disponibilidad.dia}`, hora: '09'}]);
      }
      else if(disponibilidad.profesor_id == clase.profesor_id && clases.find(c => c.dia == disponibilidad.dia && c.hora == (parseInt(disponibilidad.hora) + 1) && (c.grupo_id==grupoSeleccionado.id || c.profesor_id==clase.profesor_id)) === undefined) {
        setProfesorSeleccionadoDisponibilidad(prev => [...prev, {dia: `${disponibilidad.dia}`, hora: `${(parseInt(disponibilidad.hora) + 1)}`}]);
      }
    });
    
  }, [clase.profesor_id]);

  useEffect(() => {
    if(profesorDisponibilidad.length === 0) return;
    if(profesorSeleccionadoDisponibilidad.length === 0) return;
    dias.forEach((dia) => {
      horas.forEach((hora) => {
        profesorSeleccionadoDisponibilidad.forEach((disponibilidad) => {
          if (disponibilidad.dia === dia && disponibilidad.hora === hora) {
            setCeldasDisponibles(prev => [...prev, `${dia}${hora}`]);
          }
        });
      });
    });
    console.log(profesorSeleccionadoDisponibilidad)
  }, [profesorSeleccionadoDisponibilidad]);

  useEffect(() => {
    const materiaSelecc = async () => {
      setProfesoresInteres([]);
      const { data: materiaSeleccionada } = await supabase
        .from('materias')
        .select('*')
        .eq('id', clase.materia_id)
        .single();
  
      const nuevosTipos: string[] = [];
      if (materiaSeleccionada?.horas_clase > 0) nuevosTipos.push('clase');
      if (materiaSeleccionada?.horas_taller > 0) nuevosTipos.push('taller');
      if (materiaSeleccionada?.horas_lab > 0) nuevosTipos.push('laboratorio');
      if (materiaSeleccionada?.hpc > 0) nuevosTipos.push('hpc');
      if (materiaSeleccionada?.hlc > 0) nuevosTipos.push('hlc');
  
      setTiposClase(nuevosTipos);

      const { data: asignaturasData } = await supabase.from('asignaturas_interes').select('*').like('materia_id', '%'+materiaSeleccionada.nombre+'%');
      if(asignaturasData.length > 0) {
        profesoresDisponibles.forEach((prof) => {
          asignaturasData.forEach((asignatura) => {
            if(asignatura.profesor_id == prof.id) {
              setProfesoresInteres(prev => [...prev, prof.id]);
            }
          });
        });
      };
    };
  
    if (clase.materia_id) materiaSelecc();
    else setTiposClase([]); // Limpiar si se borra la materia seleccionada
  }, [clase.materia_id]);

  useEffect(() => {
    updateClase();
  }, [profesoresDisponibles]);

  useEffect(() => {
    if(!clase.edificio){
      setSalonesDisponibles([]);
      setClase(prev => ({ ...prev, salon: ''}))
    }
  }, [clase.edificio]);

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

  useEffect(() => {
    const canal = supabase
      .channel('disponibilidad_profesor-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disponibilidad_profesor' }, async (payload) => {
        console.log("Cambio detectado en disponibilidad de profesor:", payload);
  
        const { data: disponibilidadActualizada } = await supabase.from('disponibilidad_profesor').select('*');
  
        setClases(disponibilidadActualizada);
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const manejarClickCelda = (dia: string, hora: string) => {
    const claseExistente = clases.find(c => c.grupo_id === grupoSeleccionado.id && c.dia === dia && c.hora === hora);
    setCelda(claseExistente);
    setClase({...clase, dia: dia, hora: hora});
    manejarDisponibilidad();
  };

  const manejarGrupos = async () => {
    const { data: gruposData } = await supabase.from('grupos').select('*').like('nombre', `${programa.numero_grupo}%`);
    setGrupos(gruposData);
    setCeldaSeleccionada('');
    setClase({...clase, dia: '', hora: ''})
  };

  const manejarDisponibilidad = () => {
    const ocupadosProfesores = new Set();
    const ocupadosSalones = new Set();
  
    clases.forEach((claseFilter) => {
      if (claseFilter.dia === clase.dia && claseFilter.hora === clase.hora) {
        ocupadosProfesores.add(claseFilter.profesor_id);
        ocupadosSalones.add(`${claseFilter.edificio}-${claseFilter.salon}`);
      }
    });
  
    const retSalones = salones.filter(salon => !ocupadosSalones.has(`${salon.edificio}-${salon.num}`)
    );
  
    const retProfesores = profesores.filter((profesor) =>
      profesorDisponibilidad.some((disponibilidad) =>
        disponibilidad.profesor_id === profesor.id &&
        disponibilidad.dia === clase.dia &&
        (disponibilidad.hora === clase.hora || parseInt(disponibilidad.hora) + 1 === parseInt(clase.hora)) &&
        !ocupadosProfesores.has(profesor.id)
      )
    );
  
    setSalonesDisponibles(retSalones);
    setProfesoresDisponibles(retProfesores);
  };
  

  const updateClase = () => {
    let profDisponible = false;
    profesoresDisponibles.forEach((profesor) => {
        if(profesor.id == clase.profesor_id) {
            profDisponible = true;
        }
    });
    if (!profDisponible) {
        setClase(prev => ({ ...prev, profesor_id: '' }));
    }
  };
      
  const manejarSeleccionGrupo = (e) => {
  const grupoId = e.target.value;
  if (grupoId === 0) {
    setGrupoSeleccionado(null);
    setClase({...clase,
      profesor_id: '', profesor_nombre: '', materia_nombre: '', materia_id: '', tipo: '', dia: '', hora: '', edificio: '', salon: ''
    });
    return;
  }
  const grupo = grupos.find(g => g.id == grupoId);
  setGrupoSeleccionado(grupo);
  setClase(prev => ({ ...prev, grupo_id: grupo.id.toString(), profesor_nombre: '', materia_nombre: '', materia_id: '', profesor_id: '', tipo: '', edificio: '', salon: '' }));
};


  const manejarAgregar = async () => {
    console.log(clase);
    if (Object.values(clase).some(val => val === '')) return;

    if (clases.find(c =>
      c.dia === clase.dia && c.hora === clase.hora &&
      (c.profesor_id === clase.profesor_id || (c.edificio === clase.edificio && c.salon === clase.salon))
    )) {
      alert("Ya existe una clase a esa hora con ese profesor o salón.");
      return;
    }

    await supabase.from('clases').insert(clase);
    setClase({...clase,
      profesor_id: '', profesor_nombre: '', materia_nombre: '', materia_id: '', tipo: '', dia: '', hora: '', edificio: '', salon: ''
    });
    setCelda(null);
    setCeldaSeleccionada('');
  };

  const manejarBorrar = async () => {
    if (!celda) return;
    await supabase.from('clases').delete().eq('id', celda.id);
    setCelda(null);
    setCeldaSeleccionada('');
    setClase({...clase,
      profesor_id: '', profesor_nombre: '', materia_nombre: '', materia_id: '', tipo: '', dia: '', hora: '', edificio: '', salon: ''
    });
  };

  const isNotCoordinador = userData && programa.id === '' && !coordinaFlag; // Evalúa permisos solo si userData está disponible
  const isLoadingGrupos = !userData; // Carga grupos solo si el usuario tiene permisos y programa no está cargado
  const isCheckingCoordinador = !coordinaFlag && !user; // Solo verifica coordinador si el usuario ya está cargado

  const getEstado = () => {
    if (isCheckingCoordinador) {
      return 'No has iniciado sesión';
    }
    if (isNotCoordinador) {
      return 'No tienes permisos para ver los grupos.';
    }
    if (isLoadingGrupos) {
      return 'Cargando usuario...';
    }
    return 'Selecciona un grupo';
  };


  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <Nav />
      <div className="main">

        <div className="mt-4">
          <select className="form-select" disabled={!programa.id ? true : false} onClick={manejarGrupos} onChange={manejarSeleccionGrupo}>
            {!grupoSeleccionado && <option value={0}>
              {getEstado()}
            </option>}
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </div>

        {grupoSeleccionado && (
          <div className="row g-3 mt-4">
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
                      const claseCelda = clases.find(c => c.grupo_id === grupoSeleccionado.id && c.dia === dia && c.hora === hora);
                      return (
                        <td
                          key={dia + hora}
                          className={`p-2 ${celdaSeleccionada === dia+hora ? 'table-info' : (celdasDisponibles.includes(dia+hora)) ? 'table-success border border-secondary' : ''}`}
                          role="button"
                          onClick={() => {
                            manejarClickCelda(dia, hora);
                            setCeldaSeleccionada(dia+hora);
                          }}
                        >
                          {claseCelda ? (
                            <>
                              {claseCelda.materia_nombre}<br/>
                              {claseCelda.tipo}<br/>
                              {claseCelda.profesor_nombre}<br/>
                              {claseCelda.edificio} {claseCelda.salon}
                            </>
                          ) : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="col-4 g-3 mt-3">
              <div className="col-md-6">
                <select className="form-select" value={`${clase.profesor_id}|${clase.profesor_nombre ?? ''}`} onClick={manejarDisponibilidad} onChange={e => {
                    const [id, nombre] = e.target.value.split('|');
                    setClase({ ...clase, profesor_id: id, profesor_nombre: nombre });
                  }}>
                  <option value="">Selecciona profesor</option>
                  {
                        profesoresDisponibles.map(p => <option style={{ 
                          color: profesores_interes.includes(p.id) ? 'red' : clase.materia_id ? 'gray' : 'black',
                          }} key={p.id} value={`${p.id}|${p.nombre}`}>{p.nombre}</option>)
                  }
                </select>
              </div>
              <div className="col-md-6 mt-3">
                <select className="form-select" value={`${clase.materia_id}|${clase.materia_nombre ?? ''}`} onChange={e => {
                    const [id, nombre] = e.target.value.split('|');
                    setClase({ ...clase, materia_id: id, materia_nombre: nombre });
                  }}>
                  <option value="">Selecciona materia</option>
                  {finalMaterias.map(m => <option style={{ color: asignaturas_interes.includes(m.id) ? 'red' : clase.profesor_id ? 'gray' : 'black'}} key={m.id} value={`${m.id}|${m.nombre}`}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-6 mt-3">
                <select className='form-select' disabled={!clase.materia_id} value={clase.tipo} onChange={(e) => setClase(prev => ({ ...prev, tipo: e.target.value }))}>
                    <option value="">Tipo de clase</option>
                    {tiposClase.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div className='col-md-6 mt-3'>
                <select className="form-select" value={clase.edificio} onChange={(e) => {
                  const value = e.target.value;
                  setEdificio(value);
                  setClase(prev => ({ ...prev, edificio: value, salon: '' }));
                }}>
                  <option value="">Edificio</option>
                  {[...new Set(salones.map(s => s.edificio))].map(ed => (
                    <option key={ed}>{ed}</option>
                  ))}
                </select>
              </div>
              <div className='col-md-6 mt-3'>
                <select className='form-select'
                  disabled={!clase.edificio}
                  onChange={(e) => setClase(prev => ({ ...prev, salon: e.target.value }))}
                >
                  <option value="">Salón</option>
                  {salonesDisponibles.filter(s => s.edificio === edificio).map(salon => (
                    <option key={salon.num}>{salon.num}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 gap-3">
              <button className="btn btn-success" onClick={manejarAgregar} disabled={Object.values(clase).some(val => val === '') || celda}>
                Agregar
              </button>
              <button className="btn btn-danger ms-3" onClick={manejarBorrar} disabled={!celda}>
                Borrar
              </button>
            </div>
            </div>

            
          </div>
        )}
      </div>
    </div>
  );
}