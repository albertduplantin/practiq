'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCourse, getTP, getUserProgress } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { Course, TP, Progress } from '@/types/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [tps, setTps] = useState<TP[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (params.id) {
        const courseData = await getCourse(params.id as string);
        if (courseData) {
          setCourse(courseData);
          
          // Load all TPs in this course
          const tpPromises = courseData.tpsIds.map(id => getTP(id));
          const tpData = await Promise.all(tpPromises);
          setTps(tpData.filter((tp): tp is TP => tp !== null));
          
          // Load user progress if logged in
          if (user) {
            const userProgress = await getUserProgress(user.uid);
            setProgress(userProgress);
          }
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, user]);

  const getTPProgress = (tpId: string) => {
    return progress.find(p => p.contentId === tpId && p.type === 'tp');
  };

  const getCompletionPercentage = () => {
    if (tps.length === 0) return 0;
    const completed = tps.filter(tp => {
      const prog = getTPProgress(tp.id);
      return prog?.status === 'completed';
    }).length;
    return Math.round((completed / tps.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <Button asChild>
            <Link href="/cours">Retour aux cours</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/cours">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Link>
        </Button>

        {/* Course Header */}
        <Card className="p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {course.titre}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {course.description}
          </p>
          
          {course.descriptionHtml && (
            <div 
              className="prose dark:prose-invert max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: course.descriptionHtml }}
            />
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Par {course.auteurNom}</span>
            <span>•</span>
            <span>{tps.length} TP{tps.length > 1 ? 's' : ''}</span>
          </div>

          {user && tps.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Votre progression
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getCompletionPercentage()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full transition-all duration-500"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
          )}
        </Card>

        {/* TPs List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Travaux Pratiques
          </h2>
          
          {tps.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucun TP dans ce cours pour le moment
            </p>
          ) : (
            <div className="space-y-4">
              {tps.map((tp, index) => {
                const tpProgress = getTPProgress(tp.id);
                return (
                  <Card key={tp.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {tp.titre}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {tp.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                {tp.categorie}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                Niveau {tp.difficulte}
                              </span>
                              {tpProgress && (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                                  tpProgress.status === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                }`}>
                                  {tpProgress.status === 'completed' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      Terminé
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-3 w-3" />
                                      En cours
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/tps/${tp.id}`}>
                              {tpProgress ? 'Continuer' : 'Commencer'}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
