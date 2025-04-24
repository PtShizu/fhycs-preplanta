'use client';

import React, { useEffect, useState } from 'react';
import Nav from '../Nav';
import { supabase } from '@/lib/supabase-client';

export default function Home() {
  const [programa, setPrograma] = useState({
    nombre: '' ,
    numero_grupo: ''
  });
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [profesorDisponibilidad, setProfesorDisponibilidad] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [edificio, setEdificio] = useState('');
  const [salones, setSalones] = useState([]); // todos los salones
  const [clases, setClases] = useState([]);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState('')
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
  const [tiposClase, setTiposClase] = useState<string[]>([]);
  const [clase, setClase] = useState({
    profesor_id: '',
    materia_id: '',
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

  useEffect(() => {
    const fetchData = async () => {
      const { data: programasData } = await supabase.from('programas_educativos').select('nombre, numero_grupo').eq('nombre', "Ciencias de la comunicación").single();
      const { data: profesoresData } = await supabase.from('profesores').select('*');
      const { data: materiasData } = await supabase.from('materias').select('*');
      const { data: clasesData } = await supabase.from('clases').select('*');
      const { data: profesorDisponibilidadData } = await supabase.from('disponibilidad_profesor').select('*');
      const clasesConNombres = await Promise.all(
        clasesData.map(async (clase) => {
          const { data: materia } = await supabase
            .from('materias')
            .select('nombre')
            .eq('id', clase.materia_id) // Use the ID
            .single();
    
          const { data: profesor } = await supabase
            .from('profesores')
            .select('nombre')
            .eq('id', clase.profesor_id) // Use the ID
            .single();
    
          return {
            ...clase,
            materia_nombre: materia?.nombre || 'Desconocido', // Store the name separately
            profesor_nombre: profesor?.nombre || 'Desconocido',
          };
        })
      );
      const { data: salonesData } = await supabase.from('salones').select('*');
      setPrograma(programasData);
      setSalones(salonesData);
      setProfesores(profesoresData);
      setMaterias(materiasData);
      setClases(clasesConNombres);
      setProfesorDisponibilidad(profesorDisponibilidadData);
      
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Clase actualizada:", clase);
    manejarDisponibilidad();
  }, [clase.dia, clase.hora]);

  useEffect(() => {
    const actualizarNombres = async () => {
      const nuevasClases = await Promise.all(
        clases.map(async (clase) => {
          const { data: materia } = await supabase
            .from('materias')
            .select('nombre')
            .eq('id', clase.materia_id)
            .single();
  
          const { data: profesor } = await supabase
            .from('profesores')
            .select('nombre')
            .eq('id', clase.profesor_id)
            .single();
  
          return {
            ...clase,
            materia_id: materia?.nombre || clase.materia_id,
            profesor_id: profesor?.nombre || clase.profesor_id,
          };
        })
      );
  
      setClases(nuevasClases);
    };
  
    if (clases.length > 0) {
      actualizarNombres();
    }
  }, [clases.length]); // Solo se ejecuta cuando cambia la longitud del array

  useEffect(() => {
    const materiaSelecc = async () => {
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
    };
  
    if (clase.materia_id) materiaSelecc();
    else setTiposClase([]); // Limpiar si se borra la materia seleccionada
  }, [clase.materia_id]);

  useEffect(() => {
    console.log("Profesor actualizado: ", clase.profesor_id);
    manejarDisponibilidad();
  }, [clase.profesor_id]);

  useEffect(() => {
    updateClase();
  }, [profesoresDisponibles])

  const manejarClickCelda = (dia: string, hora: string) => {
    const claseExistente = clases.find(c => c.grupo_id === grupoSeleccionado.id && c.dia === dia && c.hora === hora);
    setCelda(claseExistente);
    setClase({...clase, dia: dia, hora: hora});
    manejarDisponibilidad();
  };

  const manejarGrupos = async () => {
    const { data: gruposData } = await supabase.from('grupos').select('*').like('nombre', `${programa.numero_grupo}%`);
    setGrupos(gruposData);
  };

  const manejarDisponibilidad = () => {
    const retProfesores = [];
    for (let i = 0; i < profesores.length; i++) {
      profesorDisponibilidad.forEach((disponibilidad) => {
        if (disponibilidad.dia === clase.dia && (disponibilidad.hora === clase.hora || (parseInt(disponibilidad.hora) + 1) === parseInt(clase.hora))) {
          retProfesores.push(profesores[i]);
        }});
    }
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
      return;
    }
    const grupo = grupos.find(g => g.id == grupoId);
    setGrupoSeleccionado(grupo);
    setClase(prev => ({ ...prev, grupo_id: grupo.id.toString() }));
  };

  const manejarAgregar = async () => {
    if (Object.values(clase).some(val => val === '')) return;
    await supabase.from('clases').insert(clase);
    const { data: nuevasClases } = await supabase.from('clases').select('*');
    setClases(nuevasClases);
    setClase({
      profesor_id: '', materia_id: '', tipo: '', grupo_id: clase.grupo_id, dia: clase.dia, hora: clase.hora, edificio: '', salon: ''
    });
    setCelda(null);
  };

  const manejarBorrar = async () => {
    if (!celda) return;
    await supabase.from('clases').delete().eq('id', celda.id);
    const { data: nuevasClases } = await supabase.from('clases').select('*');
    setClases(nuevasClases);
    setCelda(null);
    setClase({
      profesor_id: '', materia_id: '', tipo: '', grupo_id: '', dia: '', hora: '', edificio: '', salon: ''
    });
  };

  return (
    <div>
      <Nav />
      <div className="container">

        <div className="mt-4">
          <select className="form-select" onClick={manejarGrupos} onChange={manejarSeleccionGrupo}>
            {!grupoSeleccionado && <option value={0}>Selecciona un grupo</option>}
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </div>

        {grupoSeleccionado && (
          <div className="mt-4">
            <table className="table table-bordered text-center align-middle">
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
                          className={`p-2 ${celdaSeleccionada === dia+hora ? 'table-primary' : ''}`}
                          role="button"
                          onClick={() => {
                            manejarClickCelda(dia, hora);
                            setCeldaSeleccionada(dia+hora);
                          }}
                        >
                          {claseCelda ? (
                            <>
                              {claseCelda.materia_id}<br/>
                              {claseCelda.tipo}<br/>
                              {claseCelda.profesor_id}<br/>
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

            <div className="row g-3 mt-3">
              <div className="col-md-4">
                <select className="form-select" value={clase.profesor_id} onClick={manejarDisponibilidad} onChange={e => setClase({ ...clase, profesor_id: e.target.value })}>
                  <option value="">Selecciona profesor</option>
                  {
                    profesoresDisponibles.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <select className="form-select" value={clase.materia_id} onChange={e => setClase({ ...clase, materia_id: e.target.value })}>
                  <option value="">Selecciona materia</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <select className='form-select' disabled={!clase.materia_id} value={clase.tipo} onChange={(e) => setClase(prev => ({ ...prev, tipo: e.target.value }))}>
                    <option value="">Tipo de clase</option>
                    {tiposClase.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div className='col-md-4'>
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
              <div className='col-md-4'>
                <select className='form-select'
                  disabled={!edificio}
                  onChange={(e) => setClase(prev => ({ ...prev, salon: e.target.value }))}
                >
                  <option value="">Salón</option>
                  {salones.filter(s => s.edificio === edificio).map(salon => (
                    <option key={salon.num}>{salon.num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 d-flex gap-3">
              <button className="btn btn-success" onClick={manejarAgregar} disabled={Object.values(clase).some(val => val === '')}>
                Agregar
              </button>
              <button className="btn btn-danger" onClick={manejarBorrar} disabled={!celda}>
                Borrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}