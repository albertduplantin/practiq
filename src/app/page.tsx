'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Bienvenue sur <span className="text-primary">Practiq</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Plateforme de cours et TP pour le BAC pro MSPC - Maintenance des Systèmes de Production Connectés
          </p>
          
          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Connecté en tant que <span className="font-semibold text-primary">{user.email}</span>
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={logout} variant="outline">
                  Déconnexion
                </Button>
                <Button asChild>
                  <Link href="/cours">Voir les cours</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">S&apos;inscrire</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Pourquoi choisir Practiq ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cours structurés</h3>
              <p className="text-gray-600 dark:text-gray-300">
                TP organisés par niveau de difficulté et catégorie (Fabrication, Électrotechnique, Mécanique, Hydraulique, Gestion de maintenance)
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vidéos intégrées</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Accès direct aux vidéos YouTube et ressources PDF pour un apprentissage complet
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi de progression</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Suivez votre avancement et recevez des suggestions de TP adaptés à votre niveau
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}