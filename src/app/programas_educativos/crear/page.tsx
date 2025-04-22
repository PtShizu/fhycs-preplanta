// src/app/programas_educativos/crear/page.tsx
'use client'; // Necesario por los hooks y eventos

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';

export default function CrearSalon() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/programas_educativos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
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
        <h1 className='mt-3'>Agregar Programa Educativo</h1>
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
                type="text"
                className="form-control"
                value={formData.nombre}
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