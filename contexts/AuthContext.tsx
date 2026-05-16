'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const ADMIN_EMAIL = 'akashsingh404x@gmail.com';

export type UserRole = 'user' | 'editor' | 'admin';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  role: UserRole;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if user is admin
export const isAdminUser = (email: string | null | undefined): boolean => {
  return email === ADMIN_EMAIL;
};

// Helper function to save user metadata to Firestore
const saveUserMetadata = async (user: FirebaseUser) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user document with role field
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        role: isAdminUser(user.email) ? 'admin' : 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        orderCount: 0
      });
    } else {
      // Update last login and ensure role field exists
      const userData = userDoc.data();
      await setDoc(userRef, {
        lastLogin: serverTimestamp(),
        role: userData.role || 'user'
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving user metadata:', error);
  }
};

// Helper function to fetch user role from Firestore
const fetchUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Ensure role is always a valid UserRole, default to 'user'
      const userRole = userData.role;
      if (userRole === 'admin' || userRole === 'editor' || userRole === 'user') {
        return userRole;
      }
      return 'user';
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
  }
  return 'user';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [role, setRole] = useState<UserRole>('user');

  const refreshUserRole = async () => {
    if (user) {
      const userRole = await fetchUserRole(user.uid);
      setRole(userRole);
      setIsAdmin(userRole === 'admin');
      setIsEditor(userRole === 'editor' || userRole === 'admin');
      localStorage.setItem('userRole', userRole);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch role from Firestore
        const userRole = await fetchUserRole(currentUser.uid);
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
        setIsEditor(userRole === 'editor' || userRole === 'admin');
        
        // Store role in localStorage for persistence
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userEmail', currentUser.email || '');
        
        // Save user metadata to Firestore
        await saveUserMetadata(currentUser);
      } else {
        setRole('user');
        setIsAdmin(false);
        setIsEditor(false);
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user's display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isEditor, role, signIn, signUp, signInWithGoogle, signOut, refreshUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
