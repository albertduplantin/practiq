'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { getUser } from "@/lib/firestore";
import { UserDoc } from "@/types/firestore";

type AuthContextType = {
  user: { uid: string; email: string | null } | null;
  userDoc: UserDoc | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Clerk user to our user format
  const user = clerkUser ? {
    uid: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || null
  } : null;

  useEffect(() => {
    const loadUserDoc = async () => {
      if (!isLoaded) {
        return;
      }

      if (clerkUser) {
        try {
          const userData = await getUser(clerkUser.id);
          setUserDoc(userData);
        } catch (error) {
          console.error('Erreur lors du chargement du profil utilisateur:', error);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    };

    loadUserDoc();
  }, [clerkUser, isLoaded]);

  const logout = async () => {
    await signOut();
  };

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
