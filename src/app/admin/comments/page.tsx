'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Comment } from '@/types/firestore';
import { getAllComments, updateComment, deleteComment } from '@/lib/firestore';

export default function CommentsManagementPage() {
  const { userDoc, loading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    if (!loading && (!userDoc || !['admin', 'teacher_pro', 'teacher_free'].includes(userDoc.role))) {
      router.push('/');
    }
  }, [userDoc, loading, router]);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const commentsData = await getAllComments();
      setComments(commentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      await updateComment(commentId, { isModerated: true });
      setComments(comments.map(c => c.id === commentId ? { ...c, isModerated: true } : c));
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation du commentaire');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        await deleteComment(commentId);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du commentaire');
      }
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'pending') return !comment.isModerated;
    if (filter === 'approved') return comment.isModerated;
    return true;
  });

  const pendingCount = comments.filter(c => !c.isModerated).length;

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Modération des Commentaires
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Approuvez ou supprimez les commentaires des étudiants
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex gap-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Tous ({comments.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="relative"
            >
              En attente
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              Approuvés ({comments.filter(c => c.isModerated).length})
            </Button>
          </div>
        </Card>

        {/* Comments List */}
        {loadingComments ? (
          <div className="text-center py-8">
            <div className="text-lg">Chargement des commentaires...</div>
          </div>
        ) : filteredComments.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun commentaire
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'pending' && 'Aucun commentaire en attente de modération'}
              {filter === 'approved' && 'Aucun commentaire approuvé'}
              {filter === 'all' && 'Aucun commentaire pour le moment'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.userDisplayName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {comment.isModerated ? (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Approuvé
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                          <AlertCircle className="h-3 w-3" />
                          En attente
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <Link
                        href={`/tps/${comment.tpId}`}
                        className="text-primary hover:underline"
                      >
                        Voir le TP →
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!comment.isModerated && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(comment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
