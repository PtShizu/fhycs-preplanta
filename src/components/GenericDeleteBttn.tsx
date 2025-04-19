'use client';

import React from "react";
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    id: string;
    api: string;
}

export default function GenericDeleteBttn({id, api}: DeleteButtonProps){
    const router = useRouter();

    return(
        <button className="btn btn-danger" type="button" onClick={async () => {
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