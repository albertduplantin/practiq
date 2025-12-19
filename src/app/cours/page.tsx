'use client';

import { useEffect, useState } from 'react';
import { getTPs, getCourses } from '@/lib/firestore';
import { TP, Course } from '@/types/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, Search, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function CoursPage() {
  const [tps, setTps] = useState<TP[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | 'courses' | 'tps'>('all');

  useEffect(() => {
    const fetchData = async () => {
      const [tpsData, coursesData] = await Promise.all([
        getTPs(),
        getCourses()
      ]);
      setTps(tpsData.docs);
      setCourses(coursesData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const categories = Array.from(new Set(tps.map(tp => tp.categorie)));

  const filteredTPs = tps.filter(tp => {
    const matchesSearch = tp.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || tp.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCourses = courses.filter(course => {
    return course.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Cours & Travaux Pratiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explorez nos cours et TP pour le BAC pro MSPC
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'all' | 'courses' | 'tps')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tout afficher</option>
              <option value="courses">Cours uniquement</option>
              <option value="tps">TP uniquement</option>
            </select>
          </div>
        </Card>

        {/* Courses Section */}
        {(viewMode === 'all' || viewMode === 'courses') && filteredCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              Parcours de formation
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        COURS
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {course.titre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {course.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {course.tpsIds.length} TP{course.tpsIds.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button asChild className="mt-4">
                    <Link href={`/cours/${course.id}`}>Voir le cours</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TPs Section */}
        {(viewMode === 'all' || viewMode === 'tps') && filteredTPs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Travaux Pratiques
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTPs.map((tp) => (
                <Card key={tp.id} className="p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {tp.categorie}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Niveau {tp.difficulte}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {tp.titre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {tp.description}
                    </p>
                    {tp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tp.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href={`/tps/${tp.id}`}>Voir le TP</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {(() => {
          const shouldShowCourses = viewMode === 'all' || viewMode === 'courses';
          const shouldShowTPs = viewMode === 'all' || viewMode === 'tps';
          const hasNoCourses = shouldShowCourses && filteredCourses.length === 0;
          const hasNoTPs = shouldShowTPs && filteredTPs.length === 0;
          const noResults = hasNoCourses && hasNoTPs;
          
          return noResults && (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun résultat
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier vos critères de recherche
              </p>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}
