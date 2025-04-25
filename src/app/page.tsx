
'use client';

import React from 'react';
import Nav from './Nav';
import Image from 'next/image';
import styles from './page.module.css';
import facultad from '../../facultad.jpg'
import { supabase } from '@/lib/supabase-client';

export default function Home() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error al iniciar sesión:', error.message);
  };

  return (
    <div>
      <Nav />
      <div className={styles.heroContainer}>
        <Image
          src={facultad}
          alt="Fondo agua"
          fill
          priority
          className={styles.backgroundImage}
        />
        <div className={styles.overlay}>
          <h1 className={styles.title}>Bienvenido a la FHYCS</h1>
          <h5 className={styles.subtitle}>
            Facultad de Humanidades y Ciencias Sociales
          </h5>
          <button className='btn btn-success' onClick={handleLogin}>
            Iniciar sesión
          </button>
        <div className={styles.overlay}>
          <h1 className={styles.title}>LICENCIATURAS</h1>
          <ul className={styles.list}>
            <li>Lic. en Ciencias de la Comunicación</li>
            <li>Lic. en Filosofía</li>
            <li>Lic. en Historia</li>
            <li>Lic. en Lengua y Literatura de Hispanoamérica</li>
            <li>Lic. en Sociología</li>
            <li>Lic. en Docencia de la Lengua y Literatura</li>
            <li>Lic. en Docencia de la Matemática</li>
            <li>Lic. en Asesoría Psicopedagógica</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  );
}
