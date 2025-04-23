'use client';

import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import { supabase } from '@/lib/supabase-client';

export default function Home() {
  const [programa, setPrograma] = useState('Ciencias de la comunicación');
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [edificio, setEdificio] = useState('');
  const [salones, setSalones] = useState([]); // todos los salones
  const [clases, setClases] = useState([]);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState('')
  
  const [clase, setClase] = useState({
    profesor_id: '',
    materia_id: '',
    tipo: '', // clase, taller, laboratorio
    grupo_id: '',
    dia: '',
    hora: '',
    edificio: '',
    salon: ''
  });
  const [celda, setCelda] = useState(null);

  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const horas = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: gruposData } = await supabase.from('grupos').select('*');
      const { data: profesoresData } = await supabase.from('profesores').select('*');
      const { data: materiasData } = await supabase.from('materias').select('*');
      const { data: clasesData } = await supabase.from('clases').select('*');
      const { data: salonesData } = await supabase.from('salones').select('*');
      setSalones(salonesData);
      setGrupos(gruposData);
      setProfesores(profesoresData);
      setMaterias(materiasData);
      setClases(clasesData);
    };
    fetchData();
  }, []);

  const manejarSeleccionGrupo = (e) => {
    const grupoId = e.target.value;
    const grupo = grupos.find(g => g.id == grupoId);
    setGrupoSeleccionado(grupo);
    setClase(prev => ({ ...prev, grupo_id: grupo.id.toString() }));
  };

  const manejarClickCelda = (dia, hora) => {
    const claseExistente = clases.find(c => c.grupo_id === grupoSeleccionado.id && c.dia === dia && c.hora === hora);
    setCelda(claseExistente);
    setClase(prev => ({ ...prev, dia, hora }));
    if (claseExistente) {
      setClase({ ...claseExistente });
    }
    console.log(celda)
    console.log(clase)
  };

  const manejarAgregar = async () => {
    if (Object.values(clase).some(val => val === '')) return;
    await supabase.from('clases').insert([clase]);
    const { data: nuevasClases } = await supabase.from('clases').select('*');
    setClases(nuevasClases);
    setClase({
      profesor_id: '', materia_id: '', tipo: '', grupo_id: '', dia: '', hora: '', edificio: '', salon: ''
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
    <div className="container">
      <Nav />

      <div className="mt-4">
        <select className="form-select" onChange={manejarSeleccionGrupo}>
          <option>Selecciona un grupo</option>
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
                          setCeldaSeleccionada(dia+hora)
                        }}
                      >
                        {claseCelda ? `Materia ${claseCelda.materia_id}` : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="row g-3 mt-3">
            <div className="col-md-4">
              <select className="form-select" value={clase.profesor_id} onChange={e => setClase({ ...clase, profesor_id: e.target.value })}>
                <option value="">Selecciona profesor</option>
                {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={clase.materia_id} onChange={e => setClase({ ...clase, materia_id: e.target.value })}>
                <option value="">Selecciona materia</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={clase.tipo} onChange={e => setClase({ ...clase, tipo: e.target.value })}>
                <option value="">Tipo</option>
                <option value="clase">Clase</option>
                <option value="taller">Taller</option>
                <option value="laboratorio">Laboratorio</option>
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
  );
}