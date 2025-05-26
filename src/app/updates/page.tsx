import React from "react";
import { supabase } from "@/lib/supabase-client";
import Nav from "../Nav";
import { Badge } from 'react-bootstrap';

export const revalidate = 0;

export default async function Salones() {
    const { data: updates } = await supabase.from('cambios').select('*').order("num", {ascending: false});

    return (
        <main>
            <Nav></Nav>
            <div className="">
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h2 className="card-title text-dark mb-4"><i className="bi bi-arrow-repeat me-2"></i>Historial de Cambios</h2>
                        <table className="table table-bordered align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th scope="col">Versión</th>
                                    <th scope="col">Cambios y pendientes</th>
                                    <th scope="col">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {updates?.map((update) => (
                                    <tr key={update.id}>
                                        <th scope="row">
                                            <Badge bg="primary" className="fs-6">{update.num}</Badge>
                                        </th>
                                        <td style={{whiteSpace: 'pre-line'}}>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <div className="card border-success mb-2">
                                                        <div className="card-header bg-success text-white py-1 px-2"><i className="bi bi-check-circle me-1"></i>Cambios realizados</div>
                                                        <div className="card-body py-2 px-2">
                                                          {update.desc_realizados
                                                            ? update.desc_realizados.split(/\r?\n\r?\n/).map((block, idx) => (
                                                                <div key={idx} style={{marginBottom: '0.75em'}}>
                                                                  {block.split(/\r?\n/).map((line, i) => (
                                                                    <div key={i}>{line}</div>
                                                                  ))}
                                                                </div>
                                                              ))
                                                            : <span className="text-muted">Sin cambios realizados</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card border-warning mb-2">
                                                        <div className="card-header bg-warning text-dark py-1 px-2"><i className="bi bi-exclamation-circle me-1"></i>Pendientes</div>
                                                        <div className="card-body py-2 px-2">
                                                          {update.desc_pendientes
                                                            ? update.desc_pendientes.split(/\r?\n\r?\n/).map((block, idx) => (
                                                                <div key={idx} style={{marginBottom: '0.75em'}}>
                                                                  {block.split(/\r?\n/).map((line, i) => (
                                                                    <div key={i}>{line}</div>
                                                                  ))}
                                                                </div>
                                                              ))
                                                            : <span className="text-muted">Sin pendientes</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="w-10 text-nowrap">
                                            <i className="bi bi-calendar-event me-1"></i>
                                            {new Date(update.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
      );
}
