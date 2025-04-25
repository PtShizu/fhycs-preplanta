// src/app/salones/editar/page.tsx
'use client'; // Necesario por los hooks y eventos

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';
import UploadPDFMaterias from '@/components/UploadPDFMaterias';
import { supabase } from '@/lib/supabase-client';

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

  const [formData, setFormData] = useState({
    nombre: '',
    numero_grupo: '',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [materias, setMateriasData] = useState<any[]>([])

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
        setMateriasData(data);
      } catch (error) {
        console.error(error);
        router.push('/programas_educativos'); // Redirige si hay error
    }};

    fetchMaterias();
  }, [id]);

  const updateSemestre = async (id: string, semestre: number) => {
    try {
      const { data, error } = await supabase
        .from('programas_materias')
        .update({ semestre })
        .eq('id', id);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/programas_educativos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign(formData)),
    });
    if (res.ok) {
        router.refresh();
      router.push('/programas_educativos'); // Redirige al listado
    }
  };

  return (
    <div>
        <Nav></Nav>
        <div className="container position-absolute start-0">
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
            <table className="w-full border mt-4">
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
                    <td className="px-2 py-1 capitalize">{m.tipo}</td>
                    <td className="px-2 py-1 capitalize">{m.etapa ?? '—'}</td>
                    <td className="px-2 py-1 text-center">{m.materias.horas_clase}</td>
                    <td className="px-2 py-1 text-center">{m.materias.horas_taller}</td>
                    <td className="px-2 py-1 text-center">{m.materias.horas_lab}</td>
                    <td className="px-2 py-1 text-center">{m.materias.hpc}</td>
                    <td className="px-2 py-1 text-center">{m.materias.hcl}</td>
                    <td className="px-2 py-1 text-center">{m.materias.he}</td>
                    <td className="px-2 py-1 text-center">{m.materias.creditos}</td>
                    <td className="px-2 py-1 text-center">
                      <input 
                      type="number"
                      min={1}
                      defaultValue={m.semestre}
                      className="form-control"
                      onChange={(e) => {
                        enforceMinMax(e.target);
                        if (e.target.value === "") return;
                        updateSemestre(m.id, parseInt(e.target.value));
                      }}
                      />
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            
            <button type="submit" className="btn btn-primary me-2 mt-3" onClick={handleSubmit}>
            Guardar
            </button>
            <Link href="/programas_educativos" className="btn btn-danger mt-3">
            Cancelar
            </Link>
        </form>
        </div>
    </div>
    
  );
}