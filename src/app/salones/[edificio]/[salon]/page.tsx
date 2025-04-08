// src/app/salones/editar/page.tsx
'use client'; // Necesario por los hooks y eventos

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';

export default function EditarSalon({params}: any) {
  const router = useRouter();
  const edificioProp = params.edificio;
  const salonProp = params.salon;

  const [formData, setFormData] = useState({
    edificio: '',
    num: '',
    capacidad: ''
  });

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const response = await fetch(`/api/salones?edificio=${edificioProp}&salon=${salonProp}`);
        if (!response.ok) throw new Error('Error al cargar salón');
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error(error);
        router.push('/salones'); // Redirige si hay error
    }};

    fetchSalon();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/salones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
        router.refresh();
      router.push('/salones'); // Redirige al listado
    }
  };

  return (
    <div>
        <Nav></Nav>
        <div className="container position-absolute start-0">
        <h1 className='mt-3'>Editar Salón</h1>
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
            <label className="form-label">Edificio</label>
            <input
                type="text"
                defaultValue={formData.edificio}
                className="form-control"
                onChange={(e) => setFormData({...formData, edificio: e.target.value})}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Número</label>
            <input
                type="text"
                defaultValue={formData.num}
                className="form-control"
                onChange={(e) => setFormData({...formData, num: e.target.value})}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Capacidad</label>
            <input
                type="number"
                defaultValue={formData.capacidad}
                className="form-control"
                onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                required
            />
            </div>
            <button type="submit" className="btn btn-primary me-2 mt-3" onClick={handleSubmit}>
            Guardar
            </button>
            <Link href="/salones" className="btn btn-danger mt-3">
            Cancelar
            </Link>
        </form>
        </div>
    </div>
    
  );
}