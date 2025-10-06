// Types pour Firestore

export interface TP {
  id: string;
  titre: string;
  description: string;
  descriptionHtml: string; // WYSIWYG content
  categorie: 'Fabrication' | 'Électrotechnique' | 'Mécanique' | 'Hydraulique' | 'Gestion de maintenance';
  difficulte: 1 | 2 | 3 | 4 | 5; // 1 = très facile, 5 = expert
  youtubeId?: string; // ID de la vidéo YouTube
  pdfUrl?: string; // URL du PDF dans Firebase Storage
  pdfFileName?: string; // Nom du fichier PDF
  imageUrl?: string; // Image de couverture
  auteurId: string; // ID de l'enseignant qui a créé le TP
  auteurNom: string; // Nom affiché de l'auteur
  statut: 'brouillon' | 'publié';
  ordre: number; // Pour l'affichage dans la liste
  prerequis?: string[]; // IDs des TP requis
  tags: string[]; // Mots-clés pour la recherche
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface UserDoc {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher_free' | 'teacher_pro' | 'admin';
  premium: boolean; // true si teacher_pro ou admin
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export interface Progress {
  id: string; // `${userId}_${tpId}`
  userId: string;
  tpId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number; // Score du quiz si applicable
  completedAt?: Date;
  timeSpent: number; // en minutes
  notes?: string; // Notes personnelles de l'élève
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  tpId: string;
  userId: string;
  userDisplayName: string;
  content: string;
  isModerated: boolean; // true si validé par un admin
  isDeleted: boolean; // soft delete
  parentId?: string; // Pour les réponses
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  titre: string;
  description: string;
  descriptionHtml: string;
  auteurId: string;
  auteurNom: string;
  tpsIds: string[]; // IDs des TP associés
  statut: 'brouillon' | 'publié';
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types utilitaires pour les requêtes
export interface TPFilter {
  categorie?: string;
  difficulte?: number;
  statut?: 'brouillon' | 'publié';
  search?: string; // recherche dans titre/description
  auteurId?: string;
}

export interface ProgressStats {
  totalTps: number;
  completedTps: number;
  inProgressTps: number;
  averageScore: number;
  timeSpent: number;
  categoryStats: {
    [key: string]: {
      completed: number;
      total: number;
    };
  };
}
