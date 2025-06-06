// src/app/salones/crear/page.tsx
'use client'; // Necesario por los hooks y eventos

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';

export default function CrearSalon() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    edificio: '',
    num: '',
    capacidad: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/salones', {
      method: 'POST',
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
        <h1 className='mt-3'>Agregar Salón</h1>
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
            <label className="form-label">Edificio</label>
            <input
                type="text"
                className="form-control"
                value={formData.edificio}
                onChange={(e) => setFormData({...formData, edificio: e.target.value})}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Número</label>
            <input
                type="text"
                className="form-control"
                value={formData.num}
                onChange={(e) => setFormData({...formData, num: e.target.value})}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Capacidad</label>
            <input
                type="number"
                className="form-control"
                value={formData.capacidad}
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