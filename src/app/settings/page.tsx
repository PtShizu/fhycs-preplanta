'use client';

import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import toast from "react-hot-toast";

export default function Salones() {

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas ELIMINAR TODAS LAS CLASES?\nESTA ACCIÓN NO SE PUEDE DESHACER')) return;
        const { error } = await supabase.from('clases').delete().not('id', 'is', null);
        if(error){
            toast.error('Error al eliminar las clases');
            return error;
        }
        else{
            toast.success('Clases eliminadas');
        }
    }
    return (
        <main>
            <Nav></Nav>
          
          <div className="grupos container position-absolute start-0">
            <h1 className="mt-3">Ajustes</h1>
            <div>
                <button className="btn btn-danger" onClick={handleDelete}>Eliminar todas las clases</button>
            </div>
            </div> 
        </main>
      );
}
