// src/app/profesores/crear/page.tsx
'use client'; // Necesario por los hooks y eventos

import Link from 'next/link';
import Nav from '@/app/Nav';
import UploadPDF from '@/app/pdfPrueba/page';

export default function CrearSalon() {
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