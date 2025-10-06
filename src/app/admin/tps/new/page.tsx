'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { createTP } from '@/lib/firestore';
import { TP } from '@/types/firestore';

const CATEGORIES = [
  'Fabrication',
  'Électrotechnique', 
  'Mécanique',
  'Hydraulique',
  'Gestion de maintenance'
] as const;

const DIFFICULTES = [1, 2, 3, 4, 5] as const;

export default function NewTP() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    descriptionHtml: '',
    categorie: 'Fabrication' as const,
    difficulte: 1 as const,
    youtubeId: '',
    tags: '',
    statut: 'brouillon' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const tpData: Omit<TP, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        auteurId: user.uid,
        auteurNom: user.displayName || user.email || 'Anonyme',
        ordre: 0, // Sera calculé plus tard
        prerequis: [],
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      const tpId = await createTP(tpData);
      router.push(`/admin/tps/${tpId}`);
    } catch (error) {
      console.error('Erreur lors de la création du TP:', error);
      alert('Erreur lors de la création du TP');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nouveau TP
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un nouveau travail pratique pour vos élèves
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titre">Titre du TP *</Label>
                    <Input
                      id="titre"
                      value={formData.titre}
                      onChange={(e) => handleChange('titre', e.target.value)}
                      placeholder="Ex: Maintenance d'un système hydraulique"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description courte</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Description courte du TP (visible dans la liste)"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categorie">Catégorie *</Label>
                      <select
                        id="categorie"
                        value={formData.categorie}
                        onChange={(e) => handleChange('categorie', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800"
                        required
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="difficulte">Difficulté *</Label>
                      <select
                        id="difficulte"
                        value={formData.difficulte}
                        onChange={(e) => handleChange('difficulte', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800"
                        required
                      >
                        {DIFFICULTES.map(diff => (
                          <option key={diff} value={diff}>
                            {diff} - {diff === 1 ? 'Très facile' : diff === 2 ? 'Facile' : diff === 3 ? 'Moyen' : diff === 4 ? 'Difficile' : 'Expert'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="youtubeId">ID de la vidéo YouTube</Label>
                    <Input
                      id="youtubeId"
                      value={formData.youtubeId}
                      onChange={(e) => handleChange('youtubeId', e.target.value)}
                      placeholder="Ex: dQw4w9WgXcQ"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Seulement l&apos;ID de la vidéo (pas l&apos;URL complète)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleChange('tags', e.target.value)}
                      placeholder="Ex: hydraulique, maintenance, sécurité"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contenu détaillé</h2>
                <Label>Description complète *</Label>
                <div className="mt-2">
                  <TipTapEditor
                    content={formData.descriptionHtml}
                    onChange={(content) => handleChange('descriptionHtml', content)}
                    placeholder="Décrivez le TP en détail, les objectifs, le matériel nécessaire, les étapes..."
                  />
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Publication</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="statut">Statut</Label>
                    <select
                      id="statut"
                      value={formData.statut}
                      onChange={(e) => handleChange('statut', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="publié">Publié</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        'Création...'
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Créer le TP
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ressources</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Vous pourrez ajouter des fichiers PDF et images après la création du TP.
                </p>
                <Button variant="outline" disabled className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF (bientôt)
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
