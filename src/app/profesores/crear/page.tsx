// src/app/profesores/crear/page.tsx
'use client'; // Necesario por los hooks y eventos

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/Nav';
import UploadPDF from '@/app/pdfPrueba/page';

export default function CrearSalon() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    num_empleado: '',
    correo: '',
    otros_programas: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profesores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
        router.refresh();
      router.push('/profesores'); // Redirige al listado
    }
  };

  return (
    <div>
        <Nav></Nav>
        <div className="container position-absolute start-0">
        <h1 className='mt-3'>Agregar Profesor</h1>
            <UploadPDF/>
            <Link href="/profesores" className="btn btn-danger mt-3">
            Cancelar
            </Link>
        </div>
    </div>
    
  );
}