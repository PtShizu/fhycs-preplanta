'use client';

import { supabase } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import path from 'path';

export default function PageProtector(){
    const router = useRouter();
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [coordina, setCoordina] = useState<string | null>(null);

    useEffect(() => {
        // Verificamos si ya hay una sesión activa
        supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            setUserEmail(user.email);
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

    useEffect(() => {
        const fetchCoordina = async () => {
            const { data, error } = await supabase.from('profesores').select('*').eq('correo', userEmail).single();
            if (error) {
                console.error("Error fetching profesores:", error);
            } else {
                setCoordina(data?.coordina ?? null);
            }
        };

        if(userEmail)
        fetchCoordina();
    }, [userEmail]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            if(userEmail !== null){
                if(coordina === null && pathname!='/'){
                    toast.error('No tienes permiso para acceder a esa página')
                    router.push('/');
                }
                else if(coordina != 'Facultad' && pathname=='/settings'){
                    toast.error('No tienes permiso para acceder a esa página')
                    router.push('/');
                }
            }
        }
        else if(!user && pathname!='/'){
            toast.error('Inicia sesión primero')
            router.push('/');
        }
        });
    }, [pathname, coordina]);

    return(null);
}