'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Filter,
  MoreVertical,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { TP, TPFilter } from '@/types/firestore';
import { getTPs, deleteTP, updateTP } from '@/lib/firestore';

export default function TPsList() {
  const { userDoc, loading } = useAuth();
  const router = useRouter();
  const [tps, setTps] = useState<TP[]>([]);
  const [filteredTPs, setFilteredTPs] = useState<TP[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TPFilter>({
    categorie: '',
    difficulte: 0,
  });
  const [loadingTPs, setLoadingTPs] = useState(true);

  useEffect(() => {
    if (!loading && (!userDoc || !['admin', 'teacher_pro', 'teacher_free'].includes(userDoc.role))) {
      router.push('/');
    }
  }, [userDoc, loading, router]);

  useEffect(() => {
    loadTPs();
  }, []);

  useEffect(() => {
    filterTPs();
  }, [tps, searchTerm, filter]);

  const loadTPs = async () => {
    try {
      setLoadingTPs(true);
      const res = await getTPs();
      setTps(res.docs);
    } catch (error) {
      console.error('Erreur lors du chargement des TP:', error);
    } finally {
      setLoadingTPs(false);
    }
  };

  const filterTPs = () => {
    let filtered = tps;

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(tp => 
        tp.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtres
    if (filter.categorie) {
      filtered = filtered.filter(tp => tp.categorie === filter.categorie);
    }
    if (filter.difficulte) {
      filtered = filtered.filter(tp => tp.difficulte === filter.difficulte);
    }
    if (filter.statut) {
      filtered = filtered.filter(tp => tp.statut === filter.statut);
    }

    setFilteredTPs(filtered);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce TP ?')) {
      try {
        await deleteTP(id);
        setTps(tps.filter(tp => tp.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du TP');
      }
    }
  };

  const handleToggleStatus = async (tp: TP) => {
    try {
      const newStatus = tp.statut === 'publié' ? 'brouillon' : 'publié';
      await updateTP(tp.id, { statut: newStatus });
      setTps(tps.map(t => t.id === tp.id ? { ...t, statut: newStatus } : t));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du TP');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '1': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case '2': return 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-400';
      case '3': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case '4': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case '5': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fabrication': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Electrotechnique': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Mécanique': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Hydraulique': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
      case 'Gestion de maintenance': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des TP
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gérez vos travaux pratiques et cours
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/tps/new">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau TP
              </Link>
            </Button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un TP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filter.categorie}
              onChange={(e) => setFilter({ ...filter, categorie: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Toutes les catégories</option>
              <option value="Fabrication">Fabrication</option>
              <option value="Electrotechnique">Electrotechnique</option>
              <option value="Mécanique">Mécanique</option>
              <option value="Hydraulique">Hydraulique</option>
              <option value="Gestion de maintenance">Gestion de maintenance</option>
            </select>

            <select
              value={filter.difficulte || ''}
              onChange={(e) => setFilter({ ...filter, difficulte: Number(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Tous les niveaux</option>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>

            <select
              value={filter.statut || ''}
              onChange={(e) => {
                const value = e.target.value as 'brouillon' | 'publié' | '';
                setFilter({ ...filter, statut: value || undefined });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
        </Card>

        {/* Liste des TP */}
        {loadingTPs ? (
          <div className="text-center py-8">
            <div className="text-lg">Chargement des TP...</div>
          </div>
        ) : filteredTPs.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun TP trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filter.categorie || filter.difficulte || filter.statut
                ? 'Aucun TP ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier TP.'}
            </p>
            <Button asChild>
              <Link href="/admin/tps/new">Créer un TP</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTPs.map((tp) => (
              <Card key={tp.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {tp.titre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {tp.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(tp)}
                      className={`p-2 rounded-md ${
                        tp.statut === 'publié'
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={tp.statut === 'publié' ? 'Masquer' : 'Publier'}
                    >
                      {tp.statut === 'publié' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tp.categorie)}`}>
                    {tp.categorie}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(String(tp.difficulte))}`}>
                    {tp.difficulte}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tp.statut === 'publié' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {tp.statut === 'publié' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {tp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tp.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {tp.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{tp.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/tps/${tp.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
