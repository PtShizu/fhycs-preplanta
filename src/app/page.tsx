import { supabase } from '@/lib/supabase-client';
import React from 'react';
import Link from 'next/link';
import Nav from './Nav';

export default async function Home() {

  return (
    <div>
      <Nav/>
    </div>
  );
}