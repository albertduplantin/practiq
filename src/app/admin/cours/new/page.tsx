'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { createCourse, getTPs } from '@/lib/firestore';
import { TP } from '@/types/firestore';
import dynamic from 'next/dynamic';

const TipTapEditor = dynamic(() => import('@/components/editor/TipTapEditor').then(mod => ({ default: mod.TipTapEditor })), { ssr: false });

export default function NewCoursePage() {
  const { userDoc, loading } = useAuth();
  const router = useRouter();
  const [allTPs, setAllTPs] = useState<TP[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    descriptionHtml: '',
    tpsIds: [] as string[],
    statut: 'brouillon' as 'brouillon' | 'publié',
    ordre: 0
  });

  useEffect(() => {
    if (!loading && (!userDoc || !['admin', 'teacher_pro', 'teacher_free'].includes(userDoc.role))) {
      router.push('/');
    }
  }, [userDoc, loading, router]);

  useEffect(() => {
    loadTPs();
  }, []);

  const loadTPs = async () => {
    try {
      const tpsData = await getTPs();
      setAllTPs(tpsData.docs);
    } catch (error) {
      console.error('Erreur lors du chargement des TP:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDoc) return;

    setSubmitting(true);
    try {
      await createCourse({
        titre: formData.titre,
        description: formData.description,
        descriptionHtml: formData.descriptionHtml,
        auteurId: userDoc.id,
        auteurNom: userDoc.displayName,
        tpsIds: formData.tpsIds,
        statut: formData.statut,
        ordre: formData.ordre
      });
      router.push('/admin/cours');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création du cours');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTP = (tpId: string) => {
    setFormData(prev => ({
      ...prev,
      tpsIds: prev.tpsIds.includes(tpId)
        ? prev.tpsIds.filter(id => id !== tpId)
        : [...prev.tpsIds, tpId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!userDoc || !['admin', 'teacher_pro', 'teacher_free'].includes(userDoc.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/admin/cours">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Link>
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Créer un nouveau cours
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="titre">Titre du cours *</Label>
              <Input
                id="titre"
                required
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Introduction à la maintenance industrielle"
              />
            </div>

            <div>
              <Label htmlFor="description">Description courte *</Label>
              <Textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Une brève description du cours"
              />
            </div>

            <div>
              <Label htmlFor="descriptionHtml">Description détaillée</Label>
              <TipTapEditor
                content={formData.descriptionHtml}
                onChange={(html) => setFormData({ ...formData, descriptionHtml: html })}
              />
            </div>

            <div>
              <Label>TP inclus dans ce cours</Label>
              <div className="mt-3 space-y-2 max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {allTPs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Aucun TP disponible
                  </p>
                ) : (
                  allTPs.map((tp) => (
                    <label
                      key={tp.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tpsIds.includes(tp.id)}
                        onChange={() => toggleTP(tp.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {tp.titre}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {tp.categorie} - Niveau {tp.difficulte}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {formData.tpsIds.length} TP sélectionné{formData.tpsIds.length > 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <Label htmlFor="ordre">Ordre d&apos;affichage</Label>
              <Input
                id="ordre"
                type="number"
                min="0"
                value={formData.ordre}
                onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Les cours sont affichés dans l&apos;ordre croissant
              </p>
            </div>

            <div>
              <Label htmlFor="statut">Statut</Label>
              <select
                id="statut"
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'brouillon' | 'publié' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="brouillon">Brouillon</option>
                <option value="publié">Publié</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Création...' : 'Créer le cours'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/cours">Annuler</Link>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
