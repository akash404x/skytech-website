import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth, adminDb } from './firebase-admin';
import { normalizeAccountStatus, normalizeUserRole } from './firestore-mappers';
import type { UserProfile, UserRole } from './types';

export interface AuthenticatedUser {
  token: DecodedIdToken;
  profile: UserProfile;
}

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser> {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;

  if (!token) {
    throw new Response('Missing Firebase ID token', { status: 401 });
  }

  const decoded = await adminAuth.verifyIdToken(token);
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  const userData = userDoc.data() ?? {};

  const profile: UserProfile = {
    uid: decoded.uid,
    email: typeof userData.email === 'string' ? userData.email : decoded.email ?? '',
    displayName:
      typeof userData.displayName === 'string'
        ? userData.displayName
        : decoded.name ?? decoded.email?.split('@')[0] ?? 'User',
    role: normalizeUserRole(userData.role),
    status: normalizeAccountStatus(userData.status),
    orderCount: typeof userData.orderCount === 'number' ? userData.orderCount : 0,
    totalSpent: typeof userData.totalSpent === 'number' ? userData.totalSpent : 0,
    createdAt: userData.createdAt as UserProfile['createdAt'],
    lastLogin: userData.lastLogin as UserProfile['lastLogin'],
  };

  if (profile.status !== 'active') {
    throw new Response('Account is suspended', { status: 403 });
  }

  return { token: decoded, profile };
}

export function assertRole(profile: UserProfile, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(profile.role)) {
    throw new Response('Insufficient permissions', { status: 403 });
  }
}
