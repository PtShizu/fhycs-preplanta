import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import GenericDeleteBttn from "@/components/GenericDeleteBttn";
import { BotonDescargaPDFPrograma } from "@/components/PDFBttn";

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
                            <th scope="col">Número de grupo</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {programas?.map(programa =>(
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