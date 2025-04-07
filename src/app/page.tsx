import { supabase } from '@/lib/supabase-client';

export default async function Home() {
  // Fetch en el servidor (no necesita useEffect)
  const { data: salones } = await supabase.from('salones').select('*');

  return (
    <main>
      <h1>Salones</h1>
      <ul>
        {salones?.map((salon) => (
          <li key={salon.id}>
            {salon.edificio} - {salon.num}
          </li>
        ))}
      </ul>
    </main>
  );
}