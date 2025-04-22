// components/UploadPDF.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    id: string;
}

export default function UploadPDFMaterias({ id }: Props) {
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
      const base64 = (reader.result as string).split(',')[1] // solo el contenido
      const res = await fetch('/api/parse-materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, id: id}),
      })
      if (res.ok) {
        router.refresh();
      }
    }

    reader.readAsDataURL(file)
    router.refresh();
  }

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="application/pdf" onChange={handleSelect} />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Subir PDF
      </button>
    </div>
  );
}
