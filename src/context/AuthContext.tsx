'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/firebase/config";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { getUser } from "@/lib/firestore";
import { UserDoc } from "@/types/firestore";

type AuthContextType = {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userData = await getUser(currentUser.uid);
          setUserDoc(userData);
        } catch (error) {
          console.error('Erreur lors du chargement du profil utilisateur:', error);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
