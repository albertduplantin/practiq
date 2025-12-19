'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserProgress, getUserStats, getTPs } from '@/lib/firestore';
import { Progress, ProgressStats, TP } from '@/types/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [recentTPs, setRecentTPs] = useState<TP[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [userProgress, userStats, tpsData] = await Promise.all([
            getUserProgress(user.uid),
            getUserStats(user.uid),
            getTPs()
          ]);
          setProgress(userProgress);
          setStats(userStats);
          setRecentTPs(tpsData.docs.slice(0, 6));
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoadingData(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const getProgressPercentage = () => {
    if (!stats || stats.totalTps === 0) return 0;
    return Math.round((stats.completedTps / stats.totalTps) * 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fabrication': return 'bg-blue-500';
      case 'Électrotechnique': return 'bg-purple-500';
      case 'Mécanique': return 'bg-orange-500';
      case 'Hydraulique': return 'bg-cyan-500';
      case 'Gestion de maintenance': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user || !userDoc) {
    return null;
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
            Bienvenue {userDoc.displayName} ! Suivez votre progression.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  TP Disponibles
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalTps || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  TP Terminés
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.completedTps || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  En cours
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.inProgressTps || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Score moyen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.averageScore ? `${Math.round(stats.averageScore)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression globale
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Complétion des TP
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getProgressPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Temps total passé</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats?.timeSpent ? `${Math.round(stats.timeSpent)} min` : '0 min'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progression par catégorie
            </h2>
            <div className="space-y-3">
              {stats?.categoryStats && Object.entries(stats.categoryStats).length > 0 ? (
                Object.entries(stats.categoryStats).map(([category, data]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {data.completed}/{data.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${getCategoryColor(category)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucune progression pour le moment
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent TPs */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              TP Disponibles
            </h2>
            <Button asChild variant="outline">
              <Link href="/cours">Voir tous les TP</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTPs.map((tp) => {
              const userProgress = progress.find(p => p.contentId === tp.id && p.type === 'tp');
              return (
                <Card key={tp.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {tp.titre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {tp.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    {userProgress && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        userProgress.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}>
                        {userProgress.status === 'completed' ? 'Terminé' : 'En cours'}
                      </span>
                    )}
                    <Button asChild size="sm" variant="outline" className="ml-auto">
                      <Link href={`/tps/${tp.id}`}>
                        {userProgress ? 'Continuer' : 'Commencer'}
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
