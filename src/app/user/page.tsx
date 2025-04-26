'use client'

import { useSessionContext, useUser } from '@supabase/auth-helpers-react';

export default function UserProfile() {
  const { isLoading } = useSessionContext();
  const user = useUser();

  if (isLoading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}