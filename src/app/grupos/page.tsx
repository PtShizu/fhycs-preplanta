'use client';

import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import GenericDeleteBttn from "@/components/GenericDeleteBttn";
import { useState, useEffect } from "react";

export default function Salones() {
    const [grupos, setGrupos] = useState([])
    const [search, setSearch] = useState('');
    const [filteredGrupos, setFilteredGrupos] = useState([]);

    useEffect(() => {
        const fetchProfesores = async () => {
            const { data, error } = await supabase.from('grupos').select('*').order("nombre");
            if (error) {
                console.error("Error fetching grupos:", error);
            } else {
                setGrupos(data || []);
            }
        };

        fetchProfesores();
    }, []);

    useEffect(() => {
            if(search == ''){
                setFilteredGrupos(grupos);
            }
            else{
            setFilteredGrupos(grupos.filter(profesor =>
                Object.values(profesor).some(value =>
                    value && value.toString().toLowerCase().includes(search.toLowerCase())
                )))
            }
        }, [grupos, search]);
    return (
        <main>
            <Nav></Nav>
          
          <div className="grupos container position-absolute start-0">
            <h1 className="mt-3">Grupos</h1>
            <Link href="/grupos/crear" className="btn btn-success">
                + Agregar Grupo
            </Link>
            <input
                type="text"
                className="form-control mt-3"
                placeholder="Buscar grupo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
                <table className="table mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Número</th>
                            <th scope="col">Etapa</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGrupos?.map(grupo =>(
                            <tr className="salon" key={grupo.id}>
                                <th scope="row">{grupo.nombre}</th>
                                <td>{grupo.etapa}</td>
                                <td className="w-25">
                                    <div className="container">
                                        <Link className="btn btn-secondary me-2" href={"/grupos/"+grupo.id}>Editar</Link>
                                        <GenericDeleteBttn id={grupo.id} api={"grupos"}/>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> 
        </main>
      );
}
