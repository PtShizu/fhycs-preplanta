import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import GenericDeleteBttn from "@/components/GenericDeleteBttn";

export const revalidate = 0;

export default async function Salones() {
    const { data: profesores } = await supabase.from('profesores').select('*').order("nombre");

    return (
        <main>
            <Nav></Nav>
          
          <div className="salones container position-absolute start-0">
            <h1 className="mt-3">Profesores</h1>
            <Link href="/profesores/crear" className="btn btn-success">
                + Agregar Profesor
            </Link>
                <table className="table mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Número de empleado</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Correo</th>
                            <th scope="col">Coordina</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {profesores?.map(profesor =>(
                            <tr className="profesor" key={profesor.id}>
                                <th scope="row">{profesor.num_empleado}</th>
                                <td>{profesor.nombre}</td>
                                <td>{profesor.correo}</td>
                                <td>{profesor.coordina}</td>
                                <td className="w-25">
                                    <div className="container">
                                        <button className="btn btn-secondary me-2"><Link href={"/profesores/"+profesor.id}>Editar</Link></button>
                                        <GenericDeleteBttn id={profesor.id} api={"profesores"}/>
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