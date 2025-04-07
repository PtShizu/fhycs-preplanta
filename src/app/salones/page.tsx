import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";

export const revalidate = 0;

export default async function Salones() {
    const { data: salones } = await supabase.from('salones').select('*');

    return (
        <main>
            <Nav></Nav>
          
          <div className="salones container position-absolute start-0">
            <h1 className="mt-3">Salones</h1>
            <Link href="/salones/crear" className="btn btn-success">
                + Agregar Salón
            </Link>
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Edificio</th>
                            <th scope="col">Número</th>
                            <th scope="col">Capacidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salones?.map(salon =>(
                            <tr className="salon" key={salon.id}>
                                <th scope="row">{salon.edificio}</th>
                                <td>{salon.num}</td>
                                <td>{salon.capacidad}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> 
        </main>
      );
}