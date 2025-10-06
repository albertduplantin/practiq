'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import Link from 'next/link';
import { TP } from '@/types/firestore';
import { getTP, updateTP } from '@/lib/firestore';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import FileUpload from '@/components/ui/FileUpload';

export default function EditTP({ params }: { params: { id: string } }) {
  const { userDoc, loading } = useAuth();
  const router = useRouter();
  const [tp, setTp] = useState<TP | null>(null);
  const [loadingTP, setLoadingTP] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: 'Fabrication',
    difficulte: 'facile',
    youtubeId: '',
    tags: [] as string[],
    statut: 'brouillon' as const,
    pdfUrl: '',
    pdfFileName: ''
  });

  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (!loading && (!userDoc || !['admin', 'teacher_pro', 'teacher_free'].includes(userDoc.role))) {
      router.push('/');
    }
  }, [userDoc, loading, router]);

  useEffect(() => {
    if (params.id) {
      loadTP();
    }
  }, [params.id]);

  const loadTP = async () => {
    try {
      setLoadingTP(true);
      const data = await getTP(params.id);
      if (data) {
        setTp(data);
        setFormData({
          titre: data.titre,
          description: data.description,
          categorie: data.categorie,
          difficulte: String(data.difficulte),
          youtubeId: data.youtubeId || '',
          tags: data.tags || [],
          statut: data.statut,
          pdfUrl: data.pdfUrl || '',
          pdfFileName: data.pdfFileName || ''
        });
        setTagsInput(data.tags?.join(', ') || '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du TP:', error);
      setError('Erreur lors du chargement du TP');
    } finally {
      setLoadingTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Convertir les tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updatedTP: Partial<TP> = {
        ...formData,
        tags,
        updatedAt: new Date()
      };

      await updateTP(params.id, updatedTP);
      router.push('/admin/tps');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du TP');
    } finally {
      setSaving(false);
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handlePdfUpload = (url: string, fileName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      pdfUrl: url, 
      pdfFileName: fileName 
    }));
  };

  const handlePdfError = (error: string) => {
    alert(error);
  };

  if (loading || loadingTP) {
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!tp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TP non trouvé</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Le TP que vous cherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link href="/admin/tps">Retour à la liste</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline">
              <Link href="/admin/tps">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Modifier le TP
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Modifiez les informations de votre travail pratique
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Informations générales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Titre du TP *</Label>
                <Input
                  id="title"
                  value={formData.titre}
                  onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Ex: Maintenance d'un système hydraulique"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <select
                  id="category"
                  value={formData.categorie}
                  onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="Fabrication">Fabrication</option>
                  <option value="Electrotechnique">Electrotechnique</option>
                  <option value="Mécanique">Mécanique</option>
                  <option value="Hydraulique">Hydraulique</option>
                  <option value="Gestion de maintenance">Gestion de maintenance</option>
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">Niveau de difficulté *</Label>
                <select
                  id="difficulty"
                  value={formData.difficulte}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulte: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={formData.statut}
                  onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as 'brouillon' | 'publie' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="youtubeId">ID de la vidéo YouTube</Label>
              <Input
                id="youtubeId"
                value={formData.youtubeId}
                onChange={(e) => setFormData(prev => ({ ...prev, youtubeId: e.target.value }))}
                placeholder="Ex: dQw4w9WgXcQ"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                L&apos;ID de la vidéo se trouve dans l&apos;URL YouTube (après v=)
              </p>
            </div>

            <div className="mt-6">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex: hydraulique, maintenance, pompe"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Description du TP
            </h2>
            <TipTapEditor
              content={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Décrivez les objectifs, le matériel nécessaire, les étapes à suivre..."
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Fichier PDF (optionnel)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ajoutez un fichier PDF avec les instructions détaillées du TP (max 2MB)
            </p>
            <FileUpload
              onUploadComplete={handlePdfUpload}
              onUploadError={handlePdfError}
              accept=".pdf"
              maxSize={2}
            />
            {formData.pdfUrl && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Fichier PDF : {formData.pdfFileName}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/tps">Annuler</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
