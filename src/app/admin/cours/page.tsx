'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/types/firestore';
import { getCourses, deleteCourse, updateCourse } from '@/lib/firestore';

export default function CoursesManagementPage() {
  const { userDoc, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!loading && (!userDoc || !['admin', 'teacher_pro', 'teacher_free'].includes(userDoc.role))) {
      router.push('/');
    }
  }, [userDoc, loading, router]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await deleteCourse(id);
        setCourses(courses.filter(course => course.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du cours');
      }
    }
  };

  const handleToggleStatus = async (course: Course) => {
    try {
      const newStatus = course.statut === 'publié' ? 'brouillon' : 'publié';
      await updateCourse(course.id, { statut: newStatus });
      setCourses(courses.map(c => c.id === course.id ? { ...c, statut: newStatus } : c));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du cours');
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
                Gestion des Cours
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Créez et gérez des parcours d&apos;apprentissage
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/cours/new">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Cours
              </Link>
            </Button>
          </div>
        </div>

        {/* Liste des cours */}
        {loadingCourses ? (
          <div className="text-center py-8">
            <div className="text-lg">Chargement des cours...</div>
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer votre premier cours pour organiser vos TP.
            </p>
            <Button asChild>
              <Link href="/admin/cours/new">Créer un cours</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {course.titre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(course)}
                      className={`p-2 rounded-md ${
                        course.statut === 'publié'
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={course.statut === 'publié' ? 'Masquer' : 'Publier'}
                    >
                      {course.statut === 'publié' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.statut === 'publié' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {course.statut === 'publié' ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {course.tpsIds.length} TP{course.tpsIds.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Par {course.auteurNom}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/cours/${course.id}/edit`}>
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
