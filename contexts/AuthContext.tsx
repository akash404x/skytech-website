'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { mapUserProfile, normalizeUserRole } from '@/lib/firestore-mappers';
import type { UserProfile, UserRole } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  role: UserRole;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function initialRoleFor(user: FirebaseUser): UserRole {
  const bootstrapAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  return bootstrapAdminEmail && user.email?.toLowerCase() === bootstrapAdminEmail ? 'admin' : 'user';
}

async function saveUserMetadata(user: FirebaseUser, displayName?: string) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? '',
      displayName: displayName || user.displayName || user.email?.split('@')[0] || 'User',
      role: initialRoleFor(user),
      status: 'active',
      orderCount: 0,
      totalSpent: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return;
  }

  const data = userDoc.data();
  await setDoc(
    userRef,
    {
      email: user.email ?? data.email ?? '',
      displayName: displayName || user.displayName || data.displayName || user.email?.split('@')[0] || 'User',
      role: normalizeUserRole(data.role),
      status: data.status === 'suspended' ? 'suspended' : 'active',
      orderCount: typeof data.orderCount === 'number' ? data.orderCount : 0,
      totalSpent: typeof data.totalSpent === 'number' ? data.totalSpent : 0,
      lastLogin: serverTimestamp(),
    },
    { merge: true },
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      unsubscribeProfile?.();
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        await saveUserMetadata(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(
          userRef,
          (snapshot) => {
            setProfile(snapshot.exists() ? mapUserProfile(snapshot.id, snapshot.data()) : null);
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to user profile:', error);
            setProfile(null);
            setLoading(false);
          },
        );
      } catch (error) {
        console.error('Error preparing user profile:', error);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  const role = profile?.role ?? 'user';
  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || role === 'admin';

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      loading,
      role,
      isAdmin,
      isEditor,
      signIn: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signUp: async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await saveUserMetadata(userCredential.user, name);
      },
      signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await saveUserMetadata(result.user);
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
      refreshUserRole: async () => {
        if (auth.currentUser) {
          await saveUserMetadata(auth.currentUser);
        }
      },
      getIdToken: async () => {
        return auth.currentUser ? auth.currentUser.getIdToken() : null;
      },
    }),
    [isAdmin, isEditor, loading, profile, role, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
