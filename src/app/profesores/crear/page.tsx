// src/app/profesores/crear/page.tsx
'use client'; // Necesario por los hooks y eventos

import Link from 'next/link';
import Nav from '@/app/Nav';
import UploadPDF from '@/app/pdfPrueba/page';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function CrearSalon() {
  const router = useRouter();
  const handleSubmit = async () => {
    const { error } = await supabase.from('profesores').insert(
      { nombre: '', num_empleado: '', correo: '', coordina: null, otros_programas: null },
    );
    if (error) {
      console.error('Error inserting data:', error);
    } else {
      router.push('/profesores');
    }
  };

  return (
    <div>
        <Nav></Nav>
        <div className="container position-absolute start-0">
        <h1 className='mt-3'>Agregar Profesor</h1>
            <UploadPDF/>
            <button className="btn btn-primary me-2 mt-3" onClick={handleSubmit}>
            Crear vacío
            </button>
            <Link href="/profesores" className="btn btn-danger mt-3">
            Cancelar
            </Link>
        </div>
    </div>
    
  );
}