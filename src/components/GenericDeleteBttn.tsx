'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { useSessionContext, useUser } from '@supabase/auth-helpers-react';

interface DeleteButtonProps {
    id: string;
    api: string;
}

export default function GenericDeleteBttn({id, api}: DeleteButtonProps){
    const { isLoading } = useSessionContext();
    const user = useUser();
    const router = useRouter();

    if (isLoading) return <div>Cargando...</div>;

    return(
        <button className="btn btn-danger" type="button" onClick={async () => {
          if (!user) return <div>No autenticado</div>;
            try {
                const response = await fetch('/api/'+api, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ id }),
                });
                
                if (!response.ok) throw new Error('Error al eliminar');
                
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