import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import GenericDeleteBttn from "@/components/GenericDeleteBttn";

export const revalidate = 0;

export default async function Salones() {
    const { data: programas } = await supabase.from('programas_educativos').select('*').order("nombre");

    return (
        <main>
            <Nav></Nav>
          
          <div className="programas_educativos container position-absolute start-0">
            <h1 className="mt-3">Programas Educativos</h1>
            <Link href="/programas_educativos/crear" className="btn btn-success">
                + Agregar Programa Educativo
            </Link>
                <table className="table mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Nombre</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {programas?.map(programa =>(
                            <tr className="salon" key={programa.id}>
                                <th scope="row">{programa.nombre}</th>
                                <td className="w-25">
                                    <div className="container">
                                        <button className="btn btn-secondary me-2"><Link href={"/programas_educativos/"+programa.id}>Editar</Link></button>
                                        <GenericDeleteBttn id={programa.id} api={"programas_educativos"}/>
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