import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";

export const revalidate = 0;

export default async function Salones() {
    const { data: updates } = await supabase.from('cambios').select('*').order("num", {ascending: false});

    return (
        <main>
            <Nav></Nav>
          
          <div className="grupos container-flex position-absolute start-0">
            <h1 className="mt-3">Cambios</h1>
                <table className="table mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Versión</th>
                            <th scope="col">Descripción</th>
                            <th scope="col">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {updates?.map(update =>(
                            <tr className="salon" key={update.id}>
                                <th scope="row">{update.num}</th>
                                <td>
                                    {update.desc.split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </td>
                                <td className="w-25">
                                    {update.created_at}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> 
        </main>
      );
}
