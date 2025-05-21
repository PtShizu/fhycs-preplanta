// components/UploadPDF.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase-client';

type Resultado = {
  id?: number
  pdf?: boolean
  nombre: string | null
  num_empleado: string | null
  correo: string | null
  disponibilidad: Record<string, string[]>
  asignaturas_interes: { asignatura: string; requerimientos: string[] }[]
  cursos: string[]
  plataformas: string[]
  otros_programas?: string
}

export default function UploadPDF() {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado>(null);
  const [existente, setExistente] = useState(false);

  const [file, setFile] = useState<File | null>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const loadToastId = toast.loading('Cargando PDF...')
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
    toast.success('Cargado!', {id: loadToastId})
  }

  const handleUpload = async () => {
    if (!file) return toast.error('Selecciona un archivo!')
    const loadToastId = toast.loading('Cargando PDF...')

    const reader = new FileReader()

    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1] // solo el contenido
      const res = await fetch('/api/pdf-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64 }),
      })

      const data = await res.json()
      setResultado(data);
    }

    toast.success('Cargado!', {id: loadToastId})
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    const loadToastId = toast.loading('Cargando profesor...')
    const res = await fetch('/api/profesores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultado),
    });
    if (res.ok) {
      toast.success('Carga exitosa!', {id: loadToastId})
      router.refresh();
      router.push('/profesores'); // Redirige al listado
    }
    else{
      toast.error('Profesor ya registrado!', {id: loadToastId});
    }
  };
  const handleUpdate = async () => {
    if (!window.confirm('¿El profesor ya está registrado, quieres actualizar su información?')) return;
    console.log(resultado)
    const loadToastId = toast.loading('Cargando profesor...')
    const res = await fetch('/api/profesores', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultado),
    });
    if (res.ok) {
      toast.success('Actualización exitosa!', {id: loadToastId})
      router.refresh();
      router.push('/profesores'); // Redirige al listado
    }
    else{
      toast.error('Hubo un error con el formato!', {id: loadToastId});
    }
  };

  useEffect(() => {
    const fetchProfesor = async () => {
        const { data, error } = await supabase.from('profesores').select('*').eq('nombre', resultado.nombre).single()
        if (error) {
            console.error("Error fetching profesor:", error);
        } else {
            if(data){
              setResultado({...resultado, id: data.id, pdf: true});
              setExistente(true);
            }
        }
    };
    if(resultado?.nombre)
    fetchProfesor();
  }, [resultado?.nombre]);

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="application/pdf" onChange={handleSelect} />
      <button onClick={handleUpload} className="bg-secondary text-white px-4 py-2 rounded">
        Subir PDF
      </button>
      {resultado && (
        <button onClick={!existente ? handleSubmit : handleUpdate} className="bg-secondary text-white px-4 py-2 rounded">
          Agregar profesor
        </button>
      )}
    </div>
  );
}
