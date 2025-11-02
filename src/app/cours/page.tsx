'use client';

import { useEffect, useState } from 'react';
import { getTPs } from '@/lib/firestore';
import { TP } from '@/types/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CoursPage() {
  const [tps, setTps] = useState<TP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTPs = async () => {
      const result = await getTPs();
      setTps(result.docs);
      setLoading(false);
    };
    fetchTPs();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-center">Cours & TP</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tps.map((tp) => (
          <Card key={tp.id} className="p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{tp.titre}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {tp.description}
              </p>
            </div>
            <Button asChild className="mt-auto">
              <Link href={`/tps/${tp.id}`}>Voir le TP</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
