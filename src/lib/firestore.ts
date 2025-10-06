// Utilitaires Firestore

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { TP, UserDoc, Progress, Comment, TPFilter, ProgressStats } from '@/types/firestore';

// Collections
export const COLLECTIONS = {
  TPS: 'tps',
  USERS: 'users',
  PROGRESS: 'progress',
  COMMENTS: 'comments',
  COURSES: 'courses'
} as const;

// Helpers génériques
export const getCollection = (collectionName: string) => collection(db, collectionName);
export const getDocument = (collectionName: string, docId: string) => doc(db, collectionName, docId);

// TP
export const getTPs = async (filter?: TPFilter, lastDoc?: QueryDocumentSnapshot<DocumentData>) => {
  let q = query(
    getCollection(COLLECTIONS.TPS),
    where('statut', '==', 'publié'),
    orderBy('ordre', 'asc')
  );

  if (filter?.categorie) {
    q = query(q, where('categorie', '==', filter.categorie));
  }
  if (filter?.difficulte) {
    q = query(q, where('difficulte', '==', filter.difficulte));
  }
  if (filter?.auteurId) {
    q = query(q, where('auteurId', '==', filter.auteurId));
  }
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  q = query(q, limit(20));

  const snapshot = await getDocs(q);
  return {
    docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TP)),
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
};

export const getTP = async (tpId: string): Promise<TP | null> => {
  const docRef = getDocument(COLLECTIONS.TPS, tpId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TP : null;
};

export const deleteTP = async (tpId: string): Promise<void> => {
  const docRef = getDocument(COLLECTIONS.TPS, tpId);
  await deleteDoc(docRef);
};

export const createTP = async (tpData: Omit<TP, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(getCollection(COLLECTIONS.TPS), {
    ...tpData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const updateTP = async (tpId: string, tpData: Partial<TP>) => {
  const docRef = getDocument(COLLECTIONS.TPS, tpId);
  await updateDoc(docRef, {
    ...tpData,
    updatedAt: new Date()
  });
};

// Users
export const getUser = async (userId: string): Promise<UserDoc | null> => {
  const docRef = getDocument(COLLECTIONS.USERS, userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as UserDoc : null;
};

export const createUser = async (userData: Omit<UserDoc, 'id' | 'createdAt' | 'lastLoginAt'>) => {
  const docRef = await addDoc(getCollection(COLLECTIONS.USERS), {
    ...userData,
    createdAt: new Date(),
    lastLoginAt: new Date()
  });
  return docRef.id;
};

export const updateUser = async (userId: string, userData: Partial<UserDoc>) => {
  const docRef = getDocument(COLLECTIONS.USERS, userId);
  await updateDoc(docRef, {
    ...userData,
    lastLoginAt: new Date()
  });
};

// Progress
export const getUserProgress = async (userId: string) => {
  const q = query(
    getCollection(COLLECTIONS.PROGRESS),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Progress));
};

export const updateProgress = async (userId: string, tpId: string, progressData: Partial<Progress>) => {
  const progressId = `${userId}_${tpId}`;
  const docRef = getDocument(COLLECTIONS.PROGRESS, progressId);
  
  try {
    await updateDoc(docRef, {
      ...progressData,
      updatedAt: new Date()
    });
  } catch {
    // Si le document n'existe pas, le créer
    await addDoc(getCollection(COLLECTIONS.PROGRESS), {
      id: progressId,
      userId,
      tpId,
      ...progressData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

// Comments
export const getTPComments = async (tpId: string) => {
  const q = query(
    getCollection(COLLECTIONS.COMMENTS),
    where('tpId', '==', tpId),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

export const createComment = async (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(getCollection(COLLECTIONS.COMMENTS), {
    ...commentData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Stats
export const getUserStats = async (userId: string): Promise<ProgressStats> => {
  const progress = await getUserProgress(userId);
  const allTPs = await getTPs();
  
  const completed = progress.filter(p => p.status === 'completed');
  const inProgress = progress.filter(p => p.status === 'in_progress');
  
  const categoryStats: { [key: string]: { completed: number; total: number } } = {};
  
  // Calculer les stats par catégorie
  allTPs.docs.forEach(tp => {
    if (!categoryStats[tp.categorie]) {
      categoryStats[tp.categorie] = { completed: 0, total: 0 };
    }
    categoryStats[tp.categorie].total++;
    
    const userProgress = progress.find(p => p.tpId === tp.id);
    if (userProgress?.status === 'completed') {
      categoryStats[tp.categorie].completed++;
    }
  });
  
  return {
    totalTps: allTPs.docs.length,
    completedTps: completed.length,
    inProgressTps: inProgress.length,
    averageScore: completed.length > 0 ? completed.reduce((sum, p) => sum + (p.score || 0), 0) / completed.length : 0,
    timeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
    categoryStats
  };
};
