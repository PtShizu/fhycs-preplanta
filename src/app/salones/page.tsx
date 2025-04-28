'use client';

import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import GenerarHorarioVista from "@/components/GenerarHorarioVista";

export default function Salones() {
    const [salones, setSalones] = useState([]);
    const [selectedSalon, setSelectedSalon] = useState(null); // Estado para el profesor seleccionado

    useEffect(() => {
        const fetchSalones = async () => {
            const { data, error } = await supabase.from('salones').select('*').order("num");
            if (error) {
                console.error("Error fetching salones:", error);
            } else {
                setSalones(data || []);
            }
        };

        fetchSalones();
    }, []);

    useEffect(() => {
        console.log(selectedSalon)
    }, [selectedSalon])

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
                        {salones.map(salon =>(
                            <tr className="salon" key={salon.edificio+salon.num}>
                                <th scope="row">{salon.edificio}</th>
                                <td>{salon.num}</td>
                                <td>{salon.capacidad}</td>
                                <td className="w-25">
                                    <div className="container">
                                        <button className="btn btn-secondary me-2"><Link href={"/salones/"+salon.edificio+"/"+salon.num}>Editar</Link></button>
                                        <DeleteButton edificio={salon.edificio} num={salon.num}/>
                                        <>
                                            <button
                                                className="btn btn-success ms-2"
                                                onClick={() => setSelectedSalon(salon.edificio+salon.num)} // Establece el salon seleccionado
                                            >
                                                Ver Horario
                                            </button>

                                            <Modal
                                                show={selectedSalon == salon.edificio+salon.num} // Muestra el modal solo para el salon seleccionado
                                                onHide={() => setSelectedSalon(null)} // Cierra el modal
                                            >
                                                <Modal.Body className="modal-header modal-header-full">
                                                    <GenerarHorarioVista id={salon.num} tipo='salon' edificio={salon.edificio}/>
                                                </Modal.Body>
                                            </Modal>
                                        </>
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