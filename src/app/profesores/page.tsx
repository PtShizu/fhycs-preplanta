import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export const revalidate = 0;

export default async function Salones() {
    const { data: salones } = await supabase.from('salones').select('*').order("edificio").order("num");

    return (
        <main>
            <Nav></Nav>
          
          <div className="salones container position-absolute start-0">
            <h1 className="mt-3">Salones</h1>
            <Link href="/salones/crear" className="btn btn-success">
                + Agregar Salón
            </Link>
                <table className="table mt-3">
                    <thead>
                        <tr className="ptbs-3">
                            <th scope="col">Edificio</th>
                            <th scope="col">Número</th>
                            <th scope="col">Capacidad</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {salones?.map(salon =>(
                            <tr className="salon" key={salon.edificio+salon.num}>
                                <th scope="row">{salon.edificio}</th>
                                <td>{salon.num}</td>
                                <td>{salon.capacidad}</td>
                                <td className="w-25">
                                    <div className="container">
                                        <button className="btn btn-secondary me-2"><Link href={"/salones/"+salon.edificio+"/"+salon.num}>Editar</Link></button>
                                        <DeleteButton edificio={salon.edificio} num={salon.num}/>
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