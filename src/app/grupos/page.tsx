import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import GenericDeleteBttn from "@/components/GenericDeleteBttn";

export const revalidate = 0;

export default async function Salones() {
    const { data: grupos } = await supabase.from('grupos').select('*').order("nombre");

    return (
        <main>
            <Nav></Nav>
          
          <div className="grupos container position-absolute start-0">
            <h1 className="mt-3">Grupos</h1>
            <Link href="/grupos/crear" className="btn btn-success">
                + Agregar Grupo
            </Link>
                <table className="table mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Número</th>
                            <th scope="col">Etapa</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {grupos?.map(grupo =>(
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
