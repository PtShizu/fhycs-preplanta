// src/app/profesores/id/page.tsx para editar
'use client'; // Necesario por los hooks y eventos

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';
import { supabase } from '@/lib/supabase-client';
import { useSessionContext, useUser } from '@supabase/auth-helpers-react';
import UploadPDF from '@/app/pdfPrueba/page';

function estaActivo(dia: string, rango: string, disponibilidad: {profesor_id: number, dia: string, hora: string}[]) {
  let found = false;
  disponibilidad.forEach((date) => {
    if(date.dia==dia && date.hora==rango){
      found = true;
    }
  })
  return found;
}

export default function EditarSalon({params}: {params: Promise<{id: string}>}) {
  const { isLoading } = useSessionContext();
  const user = useUser();
  const router = useRouter();
  const { id } = use(params);
  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const realrangos = ['08','10','12','14','16','18','20'];
  const [programas, setProgramas] = useState([{
    id: '',
    nombre: ''
  }]);


  const [formData, setFormData] = useState({
    id: id,
    pdf: false,
    nombre: '',
    num_empleado: '',
    correo: '',
    coordina: '',
    disponibilidad: [{profesor_id: 0, dia: '', hora: ''}],
    asignaturas_interes: [{profesor_id: 0, materia_id: '', requerimientos: ''}],
    cursos: [{profesor_id: 0, nombre: ''}],
    plataformas: [{profesor_id: 0, nombre: ''}],
    otros_programas: ''
  });

  useEffect(() => {
    const fetchProfesor = async () => {
      try {
        const response = await fetch(`/api/profesores?id=${id}`);
        if (!response.ok) throw new Error('Error al cargar salón');
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error(error);
        router.push('/profesores'); // Redirige si hay error
    }};

    fetchProfesor();
  }, [params, router]);

  useEffect(() => {
    const fetchProgramas = async () => {
      const { data: programas } = await supabase.from('programas_educativos').select('*').order("nombre");
      setProgramas(programas);
    }

    fetchProgramas();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profesores', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign(formData)),
    });
    if (res.ok) {
        router.refresh();
      router.push('/profesores'); // Redirige al listado
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  if (!user) return <div>Acceso denegado</div>;

  return (
    <div>
        <Nav></Nav>
        <div className="container position-absolute start-0">
        <h1 className='mt-3'>Editar Profesor</h1>
        <UploadPDF/>
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
                type="text"
                defaultValue={formData.nombre || ''}
                className="form-control"
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Número de empleado</label>
            <input
                type="text"
                defaultValue={formData.num_empleado || ''}
                className="form-control"
                onChange={(e) => setFormData({...formData, num_empleado: e.target.value})}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
                type="text"
                defaultValue={formData.correo || ''}
                className="form-control"
                onChange={(e) => setFormData({...formData, correo: e.target.value})}
                required
            />
            </div>
            {user?.email == 'subdireccion.fhycstij@uabc.edu.mx' || user?.email == 'ruben.julian.moreno.astorga@uabc.edu.mx' || user?.email == 'direccion.fhycstij@uabc.edu.mx' || user?.email == 'diana.merchant@uabc.edu.mx' ? 
            <div className="mb-3">
            <label className="form-label">Coordina</label>
            <div className='dropdown'>
              <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {formData.coordina}
              </button>
              <ul className="dropdown-menu">
                <li><button className='dropdown-item' type='button' onClick={() => setFormData({...formData, coordina: ''})}>RESET</button></li>
                {programas.map(programa => (
                  <li key={programa.id}><button className='dropdown-item' type='button' onClick={() => setFormData({...formData, coordina: programa.nombre})}>{programa.nombre}</button></li>
                ))}
              </ul>
            </div>
            </div>
            : <div/>
            }
            <table className="table table-bordered text-center align-middle mt-3">
              <thead className="table-light">
                <tr>
                  <th scope="col">Hora/Día</th>
                  {dias.map((dia) => (
                    <th key={dia} scope="col" className="text-capitalize">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {realrangos.map((realrangos) => (
                  <tr key={realrangos}>
                    <th scope="row">{realrangos+"-"+(parseInt(realrangos)+2)}</th>
                    {dias.map((dia) => {
                      const activo = estaActivo(dia, realrangos, formData.disponibilidad);
                      return (
                        <td
                          key={dia + realrangos}
                          role="button"
                          className={`border ${activo ? 'bg-success text-white' : 'bg-white'} p-2`}
                          onClick={() => {
                            const copia = formData.disponibilidad;
                            const position = copia.findIndex((element) => element.profesor_id==parseInt(id) && element.dia==dia && element.hora==realrangos)
                            if (activo) {
                              copia.splice(position, 1);
                            } else {
                              copia.push({profesor_id: parseInt(id), dia: dia, hora: realrangos});
                            }
                            setFormData({ ...formData, disponibilidad: copia });
                            console.log(formData.disponibilidad);
                          }}
                        >
                          {activo ? '✔' : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='mb-3 mt-5'>
            <label className='form-label'><b>Asignaturas de interés</b></label>
            {formData.asignaturas_interes.map((asig, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Asignatura"
                  value={asig.materia_id || ''}
                  onChange={(e) => {
                    const updated = [...formData.asignaturas_interes];
                    updated[index].materia_id = e.target.value;
                    setFormData({ ...formData, asignaturas_interes: updated });
                  }}
                  required
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Requerimientos"
                  value={asig.requerimientos || ''}
                  onChange={(e) => {
                    const updated = [...formData.asignaturas_interes];
                    updated[index].requerimientos = e.target.value;
                    setFormData({ ...formData, asignaturas_interes: updated });
                  }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    const nuevas = formData.asignaturas_interes.filter((_, i) => i !== index);
                    setFormData({ ...formData, asignaturas_interes: nuevas });
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="btn btn-sm btn-outline-success mt-1"
              onClick={() => {
                setFormData({
                  ...formData,
                  asignaturas_interes: [...formData.asignaturas_interes, { profesor_id: parseInt(id), materia_id: '', requerimientos: '' }]
                });
              }}
            >
              + Agregar asignatura
            </button>
          </div>
          <div className='mb-3 mt-5'>
            <label className='form-label'><b>Cursos</b></label>
            {formData.cursos.map((curso, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <input 
                  key={index}
                  type="text"
                  className="form-control mb-2"
                  value={curso.nombre || ''}
                  onChange={(e) => {
                    const updated = [...formData.cursos];
                    updated[index].nombre = e.target.value;
                    setFormData({...formData, cursos: updated});
                  }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    const nuevas = formData.cursos.filter((_, i) => i !== index);
                    setFormData({ ...formData, cursos: nuevas });
                  }}
                >
                  ✕
                </button>
              </div>
              
            ))}
            <button 
              type="button" 
              className="btn btn-sm btn-outline-success"
              onClick={() => {
                setFormData({
                  ...formData,
                  cursos: [...formData.cursos, { profesor_id: parseInt(id), nombre: '' }]
                });
              }}
            >
              + Agregar curso
            </button>
          </div>
          <div className='mb-3 mt-5'>
            <label className='form-label'><b>Plataformas</b></label>
            {formData.plataformas.map((plat, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <input 
                  key={index}
                  type="text"
                  className="form-control mb-2"
                  value={plat.nombre || ''}
                  onChange={(e) => {
                    const updated = [...formData.plataformas];
                    updated[index].nombre = e.target.value;
                    setFormData({...formData, plataformas: updated});
                  }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    const nuevas = formData.plataformas.filter((_, i) => i !== index);
                    setFormData({ ...formData, plataformas: nuevas });
                  }}
                >
                  ✕
                </button>
              </div>
              
            ))}
            <button 
              type="button" 
              className="btn btn-sm btn-outline-success"
              onClick={() => {
                setFormData({
                  ...formData,
                  plataformas: [...formData.plataformas, { profesor_id: parseInt(id), nombre: '' }]
                });
              }}
            >
              + Agregar plataforma
            </button>
          </div>
          <div className='mb-3 mt-5'>
            <label className='form-label'><b>Otros programas</b></label>
            <textarea
              className='form-control'
              value={formData.otros_programas || ''}
              onChange={(e) => setFormData({...formData, otros_programas: e.target.value})}
            />
          </div>
            <button type="submit" className="btn btn-primary me-2 mt-3 mb-5" onClick={handleSubmit}>
            Guardar
            </button>
            <Link href="/profesores" className="btn btn-danger mt-3 mb-5">
            Cancelar
            </Link>
        </form>
        </div>
    </div>
    
  );
}