// components/UploadPDF.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {toast} from 'react-hot-toast';

interface UploadProps {
    id: string;
}

export default function UploadPDFMaterias({ id }: UploadProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return alert('Selecciona un archivo primero')

    const reader = new FileReader()

    reader.onloadend = async () => {
      const loadToastId = toast.loading('Cargando materias...')
      const base64 = (reader.result as string).split(',')[1] // solo el contenido
      const res = await fetch('/api/parse-materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, id: id}),
      })
      if (res.ok) {
        toast.success('Materias cargadas correctamente!', {id: loadToastId})
        toast.success('Por favor recargue la página para ver los cambios')
        router.refresh();
      }
    }

    reader.readAsDataURL(file)
    router.refresh();
  }

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="application/pdf" onChange={handleSelect} />
      <button onClick={handleUpload} className="bg-secondary text-white px-4 py-2 rounded">
        Subir PDF
      </button>
    </div>
  );
}
