'use client';

import { collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { Mail, Search, Shield, UserCheck, Users, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { mapUserProfile } from '@/lib/firestore-mappers';
import { formatCurrency, formatDate, toDate } from '@/lib/format';
import type { AccountStatus, UserProfile, UserRole } from '@/lib/types';

const ROLES: UserRole[] = ['admin', 'editor', 'user'];
const STATUSES: AccountStatus[] = ['active', 'suspended'];

export default function AdminUsers() {
  const router = useRouter();
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [savingUid, setSavingUid] = useState<string | null>(null);

  const mainAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return undefined;

    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs
          .map((document) => mapUserProfile(document.id, document.data()))
          .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0));
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return users.filter((profile) => {
      const matchesSearch =
        profile.displayName.toLowerCase().includes(search) || profile.email.toLowerCase().includes(search);
      const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchQuery, users]);

  const updateUser = async (profile: UserProfile, payload: Partial<Pick<UserProfile, 'role' | 'status'>>) => {
    const isMainAdmin = mainAdminEmail && profile.email.toLowerCase() === mainAdminEmail;

    if (isMainAdmin && payload.role && payload.role !== 'admin') {
      toast.error('Cannot remove admin role from the bootstrap admin');
      return;
    }

    if (isMainAdmin && payload.status === 'suspended') {
      toast.error('Cannot suspend the bootstrap admin');
      return;
    }

    if (profile.uid === user?.uid && payload.status === 'suspended') {
      toast.error('You cannot suspend your own account');
      return;
    }

    setSavingUid(profile.uid);
    try {
      await updateDoc(doc(db, 'users', profile.uid), payload);
      toast.success('User updated');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setSavingUid(null);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  const activeUsers = users.filter((profile) => profile.status === 'active').length;
  const adminUsers = users.filter((profile) => profile.role === 'admin').length;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Users</h1>
        <p className="mt-2 text-gray-600">View registered users and manage role-based access</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="tech-glass-panel rounded-lg p-5">
          <p className="text-sm text-gray-500">Registered Users</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="tech-glass-panel rounded-lg p-5">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{activeUsers}</p>
        </div>
        <div className="tech-glass-panel rounded-lg p-5">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{adminUsers}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as 'all' | UserRole)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Users appear here when they sign up or sign in." />
      ) : (
        <div className="tech-glass-panel overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Orders</th>
                  <th className="px-6 py-4 font-semibold">Spent</th>
                  <th className="px-6 py-4 font-semibold">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((profile) => (
                  <tr key={profile.uid} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {profile.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{profile.displayName}</p>
                          <p className="flex items-center gap-1 text-gray-500">
                            <Mail className="h-3 w-3" />
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <select
                          value={profile.role}
                          disabled={savingUid === profile.uid}
                          onChange={(event) => updateUser(profile, { role: event.target.value as UserRole })}
                          className="rounded-lg border border-gray-300 px-3 py-2 capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {profile.status === 'active' ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-red-600" />}
                        <select
                          value={profile.status}
                          disabled={savingUid === profile.uid}
                          onChange={(event) => updateUser(profile, { status: event.target.value as AccountStatus })}
                          className="rounded-lg border border-gray-300 px-3 py-2 capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{profile.orderCount}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(profile.totalSpent)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(profile.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
