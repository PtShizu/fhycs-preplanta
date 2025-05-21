'use client';

import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import GenericDeleteBttn from "@/components/GenericDeleteBttn";
import { BotonDescargaPDFPrograma } from "@/components/PDFBttn";
import { useState, useEffect } from 'react'

export default function Salones() {
    const [programas, setProgramas] = useState([]);
    const [search, setSearch] = useState('');
        const [filteredProgramas, setFilteredProgramas] = useState([]);
    
        useEffect(() => {
            const fetchProfesores = async () => {
                const { data, error } = await supabase.from('programas_educativos').select('*').order("nombre");
                if (error) {
                    console.error("Error fetching programas educativos:", error);
                } else {
                    setProgramas(data || []);
                }
            };
    
            fetchProfesores();
        }, []);
    
        useEffect(() => {
                if(search == ''){
                    setFilteredProgramas(programas);
                }
                else{
                setFilteredProgramas(programas.filter(profesor =>
                    Object.values(profesor).some(value =>
                        value && value.toString().toLowerCase().includes(search.toLowerCase())
                    )))
                }
            }, [programas, search]);

    return (
        <main>
            <Nav></Nav>
          
          <div className="programas_educativos container position-absolute start-0">
            <h1 className="mt-3">Programas Educativos</h1>
            <Link href="/programas_educativos/crear" className="btn btn-success">
                + Agregar Programa Educativo
            </Link>
            <input
                type="text"
                className="form-control mt-3"
                placeholder="Buscar programa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
                <table className="table mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Nombre</th>
                            <th scope="col">Número de grupo</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProgramas?.map(programa =>(
                            <tr className="salon" key={programa.id}>
                                <th scope="row">{programa.nombre}</th>
                                <th scope="row">{programa.numero_grupo}</th>
                                <td className="w-25">
                                    <div className="container-flex">
                                        <Link className="btn btn-secondary me-2" href={"/programas_educativos/"+programa.id}>Editar</Link>
                                        <GenericDeleteBttn id={programa.id} api={"programas_educativos"}/>
                                        <BotonDescargaPDFPrograma programaId={programa.id} nombrePrograma={programa.nombre}/>
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