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
    const [search, setSearch] = useState('');
    const [filteredSalones, setFilteredSalones] = useState([]);

    useEffect(() => {
        const fetchSalones = async () => {
            const { data, error } = await supabase.from('salones').select('*').order('edificio').order("num");
            if (error) {
                console.error("Error fetching salones:", error);
            } else {
                setSalones(data || []);
            }
        };

        fetchSalones();
    }, []);

    useEffect(() => {
        if(search == ''){
            setFilteredSalones(salones);
        }
        else{
        setFilteredSalones(salones.filter(profesor =>
            Object.values(profesor).some(value =>
                value && value.toString().toLowerCase().includes(search.toLowerCase())
            )))
        }
    }, [salones, search]);

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
            <input
                type="text"
                className="form-control mt-3"
                placeholder="Buscar salón..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
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
                        {filteredSalones.map(salon =>(
                            <tr className="salon" key={salon.edificio+salon.num}>
                                <th scope="row">{salon.edificio}</th>
                                <td>{salon.num}</td>
                                <td>{salon.capacidad}</td>
                                <td className="w-25">
                                    <div className="container">
                                        <Link className="btn btn-secondary me-2" href={"/salones/"+salon.edificio+"/"+salon.num}>Editar</Link>
                                        <DeleteButton edificio={salon.edificio} num={salon.num}/>
                                        <>
                                            <button
                                                className="btn btn-success ms-2"
                                                onClick={() => setSelectedSalon(salon.edificio+salon.num)} // Establece el salon seleccionado
                                            >
                                                Ver Horario
                                            </button>

                                            <Modal
                                                className="modal-xl"
                                                show={selectedSalon == salon.edificio+salon.num} // Muestra el modal solo para el salon seleccionado
                                                onHide={() => setSelectedSalon(null)} // Cierra el modal
                                            >
                                                <Modal.Body className="modal-header modal-body modal-header-full" style={{width: '100%'}}>
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