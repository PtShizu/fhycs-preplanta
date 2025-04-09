// components/UploadPDF.tsx
'use client';

import { useState } from 'react';

export default function UploadPDF() {
  const [resultado, setResultado] = useState<any>(null);

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
      const res = await fetch('/api/pdf-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64 }),
      })

      const data = await res.json()
      setResultado(data);
    }

    reader.readAsDataURL(file)
  }
  

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="application/pdf" onChange={handleSelect} />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Subir PDF
      </button>

      {resultado && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <h3 className="font-bold">Resultado:</h3>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
