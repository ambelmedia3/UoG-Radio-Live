import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  favorites: string[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAuthReady: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setIsAuthReady(true);
          } else {
            // Create user profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              role: currentUser.email === 'ambeluendalew@gmail.com' ? 'admin' : 'user',
              favorites: [],
            };
            setDoc(userRef, newProfile).then(() => {
              setProfile(newProfile);
              setIsAuthReady(true);
            });
          }
        });
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === 'admin' || user?.email === 'ambeluendalew@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, isAuthReady, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
