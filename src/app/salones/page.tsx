import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";

export default async function Salones() {
    const { data: salones } = await supabase.from('salones').select('*');

    return (
        <main>
            <Nav></Nav>
          <h1>Salones</h1>
          <Link href="/salones/crear" className="btn btn-success">
            + Agregar Salón
        </Link>
          <div className="salones">
                <table className="table-dark table-bordered w-50">
                    <thead>
                        <tr>
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