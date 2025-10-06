'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats] = useState({
    totalTPs: 0,
    publishedTPs: 0,
    totalUsers: 0,
    completedTPs: 0
  });

  useEffect(() => {
    if (!loading && (!user || !['admin', 'teacher_pro', 'teacher_free'].includes(user.role || ''))) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user || !['admin', 'teacher_pro', 'teacher_free'].includes(user.role || '')) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez vos cours et TP pour les élèves de BAC pro MSPC
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total TP
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTPs}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  TP Publiés
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.publishedTPs}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Élèves
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  TP Terminés
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completedTPs}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Gestion des TP
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez et gérez vos travaux pratiques pour les élèves.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/admin/tps/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau TP
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/tps">
                  Voir tous les TP
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Gestion des utilisateurs
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Gérez les rôles et permissions des utilisateurs.
            </p>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Voir les utilisateurs
                </Link>
              </Button>
              {user.role === 'admin' && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/settings">
                    Paramètres
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
