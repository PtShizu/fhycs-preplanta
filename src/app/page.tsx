'use client';

import React, { useEffect, useState } from 'react';
import Nav from './Nav';
import Image from 'next/image';
import styles from './page.module.css';
import facultad from '../../facultad.jpg'
import { supabase } from '@/lib/supabase-client';
import toast from 'react-hot-toast';

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Verificamos si ya hay una sesión activa
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email);
        toast.success('Sesión iniciada con éxito');
      }
    });

    // También puedes escuchar cambios en la sesión:
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    const redirectTo = `${window.location.origin}`; // detecta si estás en localhost o en producción
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
  
    if (error) console.error('Error al iniciar sesión:', error.message);
    
    else toast.success('Redirigiendo a Google para iniciar sesión...');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error.message);
    setUserEmail(null); // Limpiar el estado del email del usuario
    toast.success('Sesión cerrada con éxito');
  }
  

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

          <div className={styles.overlay}>
          
            {userEmail ? (
              <>
                <h1 className={styles.title}>Inicio de sesión exitoso</h1>
                <h4 className="text-white">Sesión iniciada como: <div className='text-success'>{userEmail}</div></h4>
                <h4></h4>
                <h4></h4>
                <h4></h4>
                <button className='btn btn-danger w-25 translate-middle position-relative start-50' onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
              <h1 className={styles.title}>Login</h1>
              <button className='btn btn-success w-25 translate-middle position-relative start-50' onClick={handleLogin}>
                Iniciar sesión
              </button>
              </>
            )}

            <p className='position-relative text-center' style={{color: '#FFFFFF', fontSize: '20px'}}>
            Aplicación diseñada por estudiantes de FCQI. 
            <br />
            Hernandez Vazquez Brandon Jahir
            <br />
            Hu Zhen Alberto
            <br />
            Montes Reyes Juan Manuel
            <br />
            Moreno Astorga Ruben Julian
            <br />
            Romero Flores Zulma Adiene
            <br />
            Soriano de Avila Maria Sharai
            <br />
            Dudas o sugerencias: 
            <b> ruben.julian.moreno.astorga@uabc.edu.mx</b>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
}
