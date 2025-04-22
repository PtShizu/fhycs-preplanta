// src/app/salones/editar/page.tsx
'use client'; // Necesario por los hooks y eventos

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';

export default function EditarSalon({params}: {params: Promise<{id: string}>}) {
  const router = useRouter();
  const { id } = use(params);

  const [formData, setFormData] = useState({
    nombre: '',
  });

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