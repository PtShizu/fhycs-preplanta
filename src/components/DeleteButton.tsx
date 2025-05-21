'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { useSessionContext, useUser } from '@supabase/auth-helpers-react';

interface DeleteButtonProps {
    edificio: string;
    num: string;
}

export default function DeleteButton({edificio, num}: DeleteButtonProps){
    const router = useRouter();
    const user = useUser();
    const { isLoading } = useSessionContext();

    if (isLoading) return <div>Cargando...</div>;

    return(
        <button className="btn btn-danger" type="button" onClick={async () => {
          if (!window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) return;
          if (!user) return <div>No autenticado</div>;
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