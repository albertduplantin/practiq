'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTP, getTPComments, createComment, updateProgress } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { TP, Comment } from '@/types/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ChevronLeft, Clock, Tag, Star, MessageCircle, CheckCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function TPDetailPage() {
  const params = useParams();
  const { user, userDoc } = useAuth();
  const [tp, setTp] = useState<TP | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [progressStatus, setProgressStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');

  useEffect(() => {
    const fetchData = async () => {
      if (params.id) {
        const tpData = await getTP(params.id as string);
        if (tpData) {
          setTp(tpData);
          const commentsData = await getTPComments(params.id as string);
          setComments(commentsData);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleStartTP = async () => {
    if (user && tp) {
      await updateProgress(user.uid, tp.id, {
        contentId: tp.id,
        userId: user.uid,
        type: 'tp',
        status: 'in_progress',
        timeSpent: 0
      });
      setProgressStatus('in_progress');
    }
  };

  const handleCompleteTP = async () => {
    if (user && tp) {
      await updateProgress(user.uid, tp.id, {
        contentId: tp.id,
        userId: user.uid,
        type: 'tp',
        status: 'completed',
        completedAt: new Date(),
        timeSpent: 0 // TODO: track actual time
      });
      setProgressStatus('completed');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userDoc || !tp || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await createComment({
        tpId: tp.id,
        userId: user.uid,
        userDisplayName: userDoc.displayName,
        content: newComment,
        isModerated: false,
        isDeleted: false,
        likes: 0
      });
      setNewComment('');
      // Reload comments
      const commentsData = await getTPComments(tp.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fabrication': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Électrotechnique': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
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

  if (!tp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TP non trouvé</h1>
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
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/cours">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux cours
            </Link>
          </Button>

          <Card className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tp.categorie)}`}>
                {tp.categorie}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 flex items-center gap-1">
                Difficulté: <div className="flex">{getDifficultyStars(tp.difficulte)}</div>
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {tp.titre}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tp.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Par {tp.auteurNom}</span>
              </div>
              {tp.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{tp.tags.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Progress Actions */}
            {user && (
              <div className="flex gap-3">
                {progressStatus === 'not_started' && (
                  <Button onClick={handleStartTP} className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Commencer le TP
                  </Button>
                )}
                {progressStatus === 'in_progress' && (
                  <Button onClick={handleCompleteTP} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Marquer comme terminé
                  </Button>
                )}
                {progressStatus === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">TP terminé</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Content */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contenu du TP</h2>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: tp.descriptionHtml }}
          />
        </Card>

        {/* Video */}
        {tp.youtubeId && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Vidéo explicative</h2>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${tp.youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </Card>
        )}

        {/* PDF */}
        {tp.pdfUrl && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Document PDF</h2>
            <Button asChild>
              <a href={tp.pdfUrl} target="_blank" rel="noopener noreferrer">
                Télécharger {tp.pdfFileName || 'le PDF'}
              </a>
            </Button>
          </Card>
        )}

        {/* Comments Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Commentaires ({comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                placeholder="Posez une question ou partagez votre expérience..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <Button type="submit" disabled={submittingComment || !newComment.trim()}>
                {submittingComment ? 'Envoi...' : 'Publier le commentaire'}
              </Button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">
                <Link href="/login" className="text-primary hover:underline">
                  Connectez-vous
                </Link> pour laisser un commentaire
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Aucun commentaire pour le moment. Soyez le premier à commenter !
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.userDisplayName}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        {!comment.isModerated && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded">
                            En attente de modération
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
