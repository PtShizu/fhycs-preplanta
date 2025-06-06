'use client';

import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import Link from "next/link";
import GenericDeleteBttn from "@/components/GenericDeleteBttn";
import GenerarHorarioVista from "@/components/GenerarHorarioVista";

export default function Profesores() {
    const [profesores, setProfesores] = useState([]);
    const [selectedProfesorId, setSelectedProfesorId] = useState(null); // Estado para el profesor seleccionado
    const [search, setSearch] = useState('');
    const [filteredProfesores, setFilteredProfesores] = useState([]);

    useEffect(() => {
        const fetchProfesores = async () => {
            const { data, error } = await supabase.from('profesores').select('*').order("nombre");
            if (error) {
                console.error("Error fetching profesores:", error);
            } else {
                setProfesores(data || []);
            }
        };

        fetchProfesores();
    }, []);

    useEffect(() => {
        if(search == ''){
            setFilteredProfesores(profesores);
        }
        else{
        setFilteredProfesores(profesores.filter(profesor =>
            Object.values(profesor).some(value =>
                value && value.toString().toLowerCase().includes(search.toLowerCase())
            )))
        }
    }, [profesores, search]);

    return (
        <main>
            <Nav></Nav>
          
          <div className="salones container position-absolute start-0">
            <h1 className="mt-3">Profesores</h1>
            <Link href="/profesores/crear" className="btn btn-success">
                + Agregar Profesor
            </Link>
            <input
                type="text"
                className="form-control mt-3"
                placeholder="Buscar profesor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
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
                        {filteredProfesores.map(profesor =>(
                            <tr className="profesor" key={profesor.id}>
                                <th scope="row">{profesor.num_empleado}</th>
                                <td>{profesor.nombre}</td>
                                <td>{profesor.correo}</td>
                                <td>{profesor.coordina}</td>
                                <td className="w-25">
                                    <div className="container">
                                        <Link className="btn btn-secondary me-2" href={"/profesores/"+profesor.id}>Editar</Link>
                                        <GenericDeleteBttn id={profesor.id} api={"profesores"}/>
                                        <>
                                            <button
                                                className="btn btn-success ms-2"
                                                onClick={() => setSelectedProfesorId(profesor.id)} // Establece el profesor seleccionado
                                            >
                                                Ver Horario
                                            </button>

                                            <Modal
                                                className="modal-xl"
                                                show={selectedProfesorId === profesor.id} // Muestra el modal solo para el profesor seleccionado
                                                onHide={() => setSelectedProfesorId(null)} // Cierra el modal
                                            >
                                                <Modal.Body className="modal-header modal-body modal-header-full" style={{width: '100%'}}>
                                                    <GenerarHorarioVista id={profesor.id} tipo='profesor' />
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