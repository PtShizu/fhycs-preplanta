'use client';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Nav.module.css"
import logouabc from "../../logouabc.png"
import logo from "../../logo.png"

function Nav() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          {/* <Image src={logouabc} alt="Logo UABC" width={80} height={100} /> */}
          <div className={styles.title}>
            <h1>Universidad Autónoma de Baja California</h1>
            <h2>Facultad de Humanidades y Ciencias Sociales</h2>
          </div>
          <Image src={logo} alt="Logo FHCS" width={90} height={90} />
        </div>

        {/* Menú Bootstrap */}
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <Link href="/" passHref legacyBehavior>
              <span className="navbar-brand cursor-pointer">FHyCS</span>
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/" className="nav-link">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link href="/horarios" className="nav-link">Horarios</Link>
            </li>
            <li className="nav-item">
              <Link href="/salones" className="nav-link">Salones</Link>
            </li>
            <li className="nav-item">
              <Link href="/profesores" className="nav-link">Profesores</Link>
            </li>
            <li className="nav-item">
              <Link href="/grupos" className="nav-link">Grupos</Link>
            </li>
            <li className="nav-item">
              <Link href="/programas_educativos" className="nav-link">Programas Educativos</Link>
            </li>
            <li className="nav-item">
              <Link href="/ayuda" className="nav-link">Ayuda</Link>
            </li>
            <li className="nav-item position-relative top-50 start-100">
              <Link href="/updates" className="nav-link">Actualizaciones</Link>
            </li>
            <li className="nav-item position-relative top-50 start-100">
              <Link href="/settings" className="nav-link">Ajustes</Link>
            </li>
          </ul>
          
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Nav;
