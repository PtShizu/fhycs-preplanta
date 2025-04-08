'use client';

import React from "react";
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    edificio: string;
    num: string;
}

export default function DeleteButton({edificio, num}: DeleteButtonProps){
    const router = useRouter();

    return(
        <button className="btn btn-danger" type="button" onClick={async () => {
            try {
                const response = await fetch('/api/salones', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ edificio, num }),
                });
                
                if (!response.ok) throw new Error('Error al eliminar salón');
                
                const data = await response.json();
                router.refresh();
                return data;
              } catch (error) {
                console.error('Error:', error);
                throw error;
              }
        }}>
            Eliminar
        </button>
    );
}