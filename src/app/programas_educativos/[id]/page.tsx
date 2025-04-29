// src/app/salones/editar/page.tsx
'use client'; // Necesario por los hooks y eventos

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';
import UploadPDFMaterias from '@/components/UploadPDFMaterias';
import { supabase } from '@/lib/supabase-client';
import SelectMaterias from '@/components/SelectMaterias';
import { toast } from 'react-hot-toast';

function enforceMinMax(el) {
  if (el.value != "") {
    if (parseInt(el.value) < parseInt(el.min)) {
      el.value = el.min;
    }
    if (parseInt(el.value) > parseInt(el.max)) {
      el.value = el.max;
    }
  }
}

export default function EditarSalon({params}: {params: Promise<{id: string}>}) {
  const router = useRouter();
  const { id } = use(params);
  const [nuevasMaterias, setNuevasMaterias] = useState([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<number[]>([]);
  const [materiasExistentes, setMateriasExistentes] = useState([]);
  const [materiasPrograma, setMateriasPrograma] = useState([]);
  const prevMateriasSeleccionadas = useRef<number[]>([]);

  const [formData, setFormData] = useState({
    nombre: '',
    numero_grupo: '',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [materias, setMateriasData] = useState<any[]>([])

  useEffect(() => {
    const fetchMateriasPrograma = async () => {
      try {
        const { data } = await supabase
        .from('programas_materias')
        .select('*')
        .eq('programa_id', id)

        setMateriasPrograma(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMateriasPrograma();
  }, [id]);

  useEffect(() => {
    const removeDuplicateMaterias = async () => {
      for (const m of materiasPrograma) {
        const materiasRepetidas = materiasPrograma.filter((materia) => materia.materia_id == m.materia_id);
        if (materiasRepetidas.length > 1) {
          console.log(materiasRepetidas)
          for (const materia of materiasRepetidas.slice(1)) { // Ignorar la primera ocurrencia
            try {
              const { error } = await supabase
                .from('programas_materias')
                .delete()
                .eq('id', materia.id);
              if (error) {
                console.error('Error al eliminar materia repetida:', error);
              }
            } catch (error) {
              console.error('Error al procesar materia repetida:', error);
            }
          }
        }
      }
    };

    removeDuplicateMaterias();
  }, [materiasPrograma]);

  useEffect(() => {
    const fetchMateriasExistentes = async () => {
      try{
        const { data } = await supabase
        .from('materias')
        .select('*')
        .not('id', 'in', `(${materiasPrograma.map((m) => m.materia_id).join(',')})`)
        setMateriasExistentes(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMateriasExistentes();
  }, [materiasPrograma]);

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const response = await fetch(`/api/programas_educativos?id=${id}`);
        if (!response.ok) throw new Error('Error al cargar programa educativo');
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error(error);
        router.push('/programas_educativos'); // Redirige si hay error
    }};

    fetchSalon();
  }, [params, router]);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const { data } = await supabase
        .from('programas_materias')
        .select(`
            id,
            tipo,
            etapa,
            semestre,
            materia_id,
            materias (
            id,
            clave,
            nombre,
            horas_clase,
            horas_taller,
            horas_lab,
            hpc,
            hcl,
            he,
            creditos
            )
        `)
        .eq('programa_id', id)
        .order('tipo')
        .order('etapa', { ascending: true }) // Opcional
        .order('semestre', { ascending: true }) // Opcional
        setMateriasData(data);
      } catch (error) {
        console.error(error);
        router.push('/programas_educativos'); // Redirige si hay error
    }};

    fetchMaterias();
  }, [id]);

  useEffect(() => {
    const fetchMateriaNueva = async (id: number) => {
      try {
        const { data } = await supabase
          .from('materias')
          .select(`
            id,
            clave,
            nombre,
            horas_clase,
            horas_taller,
            horas_lab,
            hpc,
            hcl,
            he,
            creditos
          `)
          .eq('id', id)
          .single();
  
        console.log(data);
        if (data) handleNuevaMateriaVacia(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    const prev = prevMateriasSeleccionadas.current;
    const current = materiasSeleccionadas;
  
    // Comparar si se agregó una nueva materia
    if (current.length > prev.length) {
      const nuevoId = current.find(id => !prev.includes(id));
      if (nuevoId !== undefined) {
        fetchMateriaNueva(nuevoId);
      }
    }
  
    // Actualizar ref para la próxima comparación
    prevMateriasSeleccionadas.current = current;
  
  }, [materiasSeleccionadas]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = async (id: string, column: string, value: any) => {
    try {
      if(column === 'delete'){
        const { data, error } = await supabase
          .from('programas_materias')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from('programas_materias')
        .update({ [column]: value }) // Usar un objeto dinámico para la columna
        .eq('id', id);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating ${column}:`, error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nuevasMaterias.length > 0) {
      console.log('nuevasMaterias', nuevasMaterias);
  
      // 1. Insertar las materias nuevas (las que no tienen materia_id)
      const materiasParaInsertar = nuevasMaterias.filter(m => m.materia_id === null).map(m => ({
        clave: m.clave,
        nombre: m.nombre,
        horas_clase: m.horas_clase,
        horas_taller: m.horas_taller,
        horas_lab: m.horas_lab,
        hpc: m.hpc,
        hcl: m.hcl,
        he: m.he,
        creditos: m.creditos
      }));
  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let nuevasIds: any[] = [];
      if (materiasParaInsertar.length > 0) {
        const { data, error: error2 } = await supabase
          .from('materias')
          .insert(materiasParaInsertar)
          .select('id, clave');
        
        if (error2) {
          console.error('Error inserting materias:', error2);
          return;
        }
  
        nuevasIds = data || [];
      }
  
      // 2. Construir lista de materias ACTUALIZADA
      const materiasActualizadas = nuevasMaterias.map(m => {
        if (m.materia_id !== null) {
          return m; // Ya tiene ID
        } else {
          const nuevaMateria = nuevasIds.find(n => n.clave === m.clave);
          return { ...m, materia_id: nuevaMateria?.id || null };
        }
      });
  
      // 3. Insertar en programas_materias usando materiasActualizadas
      const { error: error3 } = await supabase
        .from('programas_materias')
        .insert(materiasActualizadas.map(m => ({
          materia_id: m.materia_id,
          programa_id: id,
          tipo: m.tipo,
          etapa: m.etapa,
          semestre: m.semestre
        })));
  
      if (error3) {
        console.error('Error inserting nuevas materias:', error3);
        return;
      }
    }
  
    // 4. Actualizar el programa educativo
    const res = await fetch('/api/programas_educativos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign(formData)),
    });
  
    if (res.ok) {
      router.refresh();
      router.push('/programas_educativos');
    }
  };

  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNuevaMateriaVacia = (data?: any) => {
    toast.success('Materia agregada')
    setNuevasMaterias((prev) => [
      ...prev,
      {
        materia_id: data?.id || null,
        clave: data?.clave || '',
        nombre: data?.nombre || null,
        tipo: data?.tipo || 'obligatoria',
        etapa: data?.etapa || null,
        horas_clase: data?.horas_clase || null,
        horas_taller: data?.horas_taller || null,
        horas_lab: data?.horas_lab || null,
        hpc: data?.hpc || null,
        hcl: data?.hcl || null,
        he: data?.he || null,
        creditos: data?.creditos || null,
        semestre: data?.semestre || null
      },
    ]);
  }

  return (
    <div>
        <Nav></Nav>
        <div className="container-flex position-absolute start-0">
        <h1 className='mt-3'>Editar Programa Educativo</h1>
        <UploadPDFMaterias id={id}/>
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
                type="text"
                defaultValue={formData.nombre}
                className="form-control"
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Número de grupo</label>
            <input
                type="text"
                defaultValue={formData.numero_grupo}
                className="form-control"
                onChange={(e) => setFormData({...formData, numero_grupo: e.target.value})}
                required
            />
            </div>
            <h2>Agregar materias existentes</h2>
            <div className="mb-4">
                    <SelectMaterias
                      materias={materiasExistentes}
                      value={materiasSeleccionadas}
                      onChange={setMateriasSeleccionadas}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-12">
                      <table className="w-full table border mt-4">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 text-left">Clave</th>
                            <th className="px-2 py-1 text-left">Nombre</th>
                            <th className="px-2 py-1">Tipo</th>
                            <th className="px-2 py-1">Etapa</th>
                            <th className="px-2 py-1 text-center">HC</th>
                            <th className="px-2 py-1 text-center">HT</th>
                            <th className="px-2 py-1 text-center">HL</th>
                            <th className="px-2 py-1 text-center">HPC</th>
                            <th className="px-2 py-1 text-center">HCL</th>
                            <th className="px-2 py-1 text-center">HE</th>
                            <th className="px-2 py-1">Créditos</th>
                            <th className="px-2 py-1">Semestre</th>
                          </tr>
                        </thead>
                        <tbody>
                        {nuevasMaterias.map((materia, index) => (
                          <tr key={index} className="border-t">
                            {/* Aquí puedes agregar los campos de entrada para la nueva materia */}
                            {/* Por simplicidad, se usan campos de texto, pero puedes usar selectores o autocompletar según sea necesario */}
                            {Object.keys(materia).map((key) => {
                              if (key === 'materia_id') return null; // Ignorar el campo id
                              return (
                                <td key={key} className="px-2 py-1 text-center" style={{
                                  width: key === 'clave' ? '8%' : key === 'nombre' ? '27%' : key === 'tipo' ? '10%' : key === 'etapa' ? '11%' : key === 'semestre' ? '3%' : key === 'horas_clase' || key === 'horas_taller' || key === 'horas_lab' || key === 'hpc' || key === 'hcl' || key === 'he' || key === 'creditos' ? '6%' : undefined,
                                }}>
                                  {materia.materia_id ? (
                                      key === 'horas_clase' || 
                                      key === 'horas_taller' ||
                                      key === 'horas_lab' ||
                                      key === 'hpc' ||
                                      key === 'hcl' ||
                                      key === 'he' ||
                                      key === 'creditos' ? (
                                        materia[key]
                                      ) : (
                                        key === 'tipo' || key === 'etapa' ? (
                                          <select
                                            defaultValue={materia[key] ?? ''}
                                            className="form-control"
                                            onChange={(e) => {
                                              const newMaterias = [...nuevasMaterias];
                                              newMaterias[index][key] = e.target.value;
                                              setNuevasMaterias(newMaterias);
                                            }}
                                          >
                                            {key === 'tipo' ? (
                                              <>
                                                <option value="obligatoria">obligatoria</option>
                                                <option value="optativa">optativa</option>
                                              </>
                                            ) : (
                                              <>
                                                <option value="-">-</option>
                                                <option value="básica">básica</option>
                                                <option value="disciplinaria">disciplinaria</option>
                                                <option value="terminal">terminal</option>
                                              </>
                                            )}
                                          </select>
                                        ) : (
                                        <input
                                          type={key === 'semestre' ? 'number' : 'text'}
                                          className="form-control"
                                          value={materia[key] || ''}
                                          onChange={(e) => {
                                            const newMaterias = [...nuevasMaterias];
                                            newMaterias[index][key] = e.target.value;
                                            setNuevasMaterias(newMaterias);
                                          }}
                                          {...(key === 'clave' ? require : key === 'nombre' ? require : false)}
                                        />
                                      ))
                                  ) : (
                                    key === 'tipo' || key === 'etapa' ? (
                                      <select
                                        defaultValue={materia[key] ?? ''}
                                        className="form-control"
                                        onChange={(e) => {
                                          const newMaterias = [...nuevasMaterias];
                                          newMaterias[index][key] = e.target.value;
                                          setNuevasMaterias(newMaterias);
                                        }}
                                      >
                                        {key === 'tipo' ? (
                                          <>
                                            <option value="obligatoria">obligatoria</option>
                                            <option value="optativa">optativa</option>
                                          </>
                                        ) : (
                                          <>
                                            <option value="-">-</option>
                                            <option value="básica">básica</option>
                                            <option value="disciplinaria">disciplinaria</option>
                                            <option value="terminal">terminal</option>
                                          </>
                                        )}
                                      </select>
                                    ) : (
                                    <input
                                      type={key === 'semestre' || 
                                        key === 'horas_clase' || 
                                        key === 'horas_taller' ||
                                        key === 'horas_lab' ||
                                        key === 'hpc' ||
                                        key === 'hcl' ||
                                        key === 'he' ||
                                        key === 'creditos' ? 'number' : 'text'}
                                      className="form-control"
                                      value={materia[key] || ''}
                                      onChange={(e) => {
                                        const newMaterias = [...nuevasMaterias];
                                        newMaterias[index][key] = e.target.value;
                                        setNuevasMaterias(newMaterias);
                                      }}
                                      {...(key === 'clave' ? require : key === 'nombre' ? require : false)}
                                    />
                            ))}
                                  
                                </td>
                              );
                            })}
                            <td key={index}>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => {
                                console.log('nuevasMaterias', nuevasMaterias);
                                const materiaId = nuevasMaterias[index]?.materia_id; // Guarda primero el id
                                console.log('materiaId', materiaId);
                                const nuevas = nuevasMaterias.filter((_, i) => i !== index); // Luego elimina
                                setNuevasMaterias(nuevas);
                                if (materiaId) {
                                  setMateriasSeleccionadas(prev => prev.filter(m => m !== materiaId)); // Luego actualiza
                                }
                              }}
                            >
                              ✕
                            </button>
                                </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-success mt-1"
                    onClick={() => handleNuevaMateriaVacia()}
                  >
                    + Agregar materia vacía
                  </button>
            <div className='row g-2'>
              <div className='col-11'>
                <table className="w-full table border mt-4">
                <thead>
                    <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left">Clave</th>
                    <th className="px-2 py-1 text-left">Nombre</th>
                    <th className="px-2 py-1">Tipo</th>
                    <th className="px-2 py-1">Etapa</th>
                    <th className="px-2 py-1">HC</th>
                    <th className="px-2 py-1">HT</th>
                    <th className="px-2 py-1">HL</th>
                    <th className="px-2 py-1">HPC</th>
                    <th className="px-2 py-1">HCL</th>
                    <th className="px-2 py-1">HE</th>
                    <th className="px-2 py-1">Créditos</th>
                    <th className="px-2 py-1">Semestre</th>
                    </tr>
                </thead>
                <tbody>
                    {materias.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-2 py-1">{m.materias.clave}</td>
                        <td className="px-2 py-1">{m.materias.nombre}</td>
                        <td className="px-2 py-1 capitalize" style={{width: '10%'}}>
                          <select
                          defaultValue={m.tipo ?? ''}
                          className="form-control"
                          onChange={(e) => {
                            updateField(m.id, 'tipo', e.target.value);
                          }}
                          >
                          <option value="obligatoria">obligatoria</option>
                          <option value="optativa">optativa</option>
                          </select>
                        </td>
                        <td className="px-2 py-1 capitalize">
                        <select
                          defaultValue={m.etapa ?? '-'}
                          className="form-control"
                          onChange={(e) => {
                            updateField(m.id, 'etapa', e.target.value);
                          }}
                          >
                          <option value="-">-</option>
                          <option value="básica">básica</option>
                          <option value="disciplinaria">disciplinaria</option>
                          <option value="terminal">terminal</option>
                          </select>
                        </td>
                        <td className="px-2 py-1 text-center">{m.materias.horas_clase}</td>
                        <td className="px-2 py-1 text-center">{m.materias.horas_taller}</td>
                        <td className="px-2 py-1 text-center">{m.materias.horas_lab}</td>
                        <td className="px-2 py-1 text-center">{m.materias.hpc}</td>
                        <td className="px-2 py-1 text-center">{m.materias.hcl}</td>
                        <td className="px-2 py-1 text-center">{m.materias.he}</td>
                        <td className="px-2 py-1 text-center">{m.materias.creditos}</td>
                        <td className="px-2 py-1 text-center" style={{width: '3%'}}>
                          <input 
                          type="number"
                          min={1}
                          defaultValue={m.semestre}
                          className="form-control"
                          onChange={(e) => {
                            enforceMinMax(e.target);
                            updateField(m.id, 'semestre', parseInt(e.target.value));
                          }}
                          />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => {
                              updateField(m.id, 'delete', m.id);
                              setMateriasData((prev) => prev.filter((materia) => materia.id !== m.id));
                            }}
                          >
                            ✕
                          </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
              </div>
              <div className='col'>
                <button type="submit" className="btn btn-primary me-2 mt-3" onClick={handleSubmit}>
                Agregar
                </button>
                <Link href="/programas_educativos" className="btn btn-danger mt-3">
                Cancelar
                </Link>
              </div>
            </div>
        </form>
        </div>
    </div>
    
  );
}
