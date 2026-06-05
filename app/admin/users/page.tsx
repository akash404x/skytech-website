'use client';

import { collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { Mail, Search, Send, Shield, UserCheck, Users, UserX, X } from 'lucide-react';
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
  
  // Bulk email state
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

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

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUserIds(filteredUsers.map(u => u.uid));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (uid: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, uid]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(id => id !== uid));
    }
  };

  const handleSendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    if (!sendToAll && selectedUserIds.length === 0) {
      toast.error('Please select at least one user or choose "Send to All Users"');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/admin/users/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          sendToAll,
          selectedUserIds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Bulk email sent successfully');
        setShowBulkEmailModal(false);
        setEmailSubject('');
        setEmailMessage('');
        setSelectedUserIds([]);
        setSelectAll(false);
        setSendToAll(false);
      } else {
        toast.error(data.error || 'Failed to send bulk email');
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      toast.error('Failed to send bulk email');
    } finally {
      setSendingEmail(false);
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
        <p className="mt-2 text-slate-300">View registered users and manage role-based access</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="tech-glass-panel rounded-3xl p-5 border-cyan-500/10 bg-slate-950/90">
          <p className="text-sm text-cyan-200">Registered Users</p>
          <p className="mt-2 text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="tech-glass-panel rounded-3xl p-5 border-cyan-500/10 bg-slate-950/90">
          <p className="text-sm text-cyan-200">Active Users</p>
          <p className="mt-2 text-2xl font-bold text-white">{activeUsers}</p>
        </div>
        <div className="tech-glass-panel rounded-3xl p-5 border-cyan-500/10 bg-slate-950/90">
          <p className="text-sm text-cyan-200">Admins</p>
          <p className="mt-2 text-2xl font-bold text-white">{adminUsers}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 pl-10 pr-4"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkEmailModal(true)}
            className="tech-button flex items-center gap-2 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-200 hover:bg-cyan-500/20"
          >
            <Send className="h-4 w-4" />
            Send Bulk Email
          </button>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as 'all' | UserRole)}
            className="tech-input rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-4 py-2"
          >
            <option value="all">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
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
                <tr className="border-b border-white/10 bg-slate-950/90 text-sm text-slate-300">
                  <th className="px-6 py-4 font-semibold text-white">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-cyan-500/20 bg-slate-900/80 text-cyan-500 focus:ring-cyan-500"
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold text-white">User</th>
                  <th className="px-6 py-4 font-semibold text-white">Role</th>
                  <th className="px-6 py-4 font-semibold text-white">Status</th>
                  <th className="px-6 py-4 font-semibold text-white">Orders</th>
                  <th className="px-6 py-4 font-semibold text-white">Spent</th>
                  <th className="px-6 py-4 font-semibold text-white">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((profile) => (
                  <tr key={profile.uid} className="border-b border-white/10 text-sm hover:bg-slate-900/80">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(profile.uid)}
                        onChange={(e) => handleSelectUser(profile.uid, e.target.checked)}
                        className="h-4 w-4 rounded border-cyan-500/20 bg-slate-900/80 text-cyan-500 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 font-bold text-cyan-200">
                          {profile.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{profile.displayName}</p>
                          <p className="flex items-center gap-1 text-slate-400">
                            <Mail className="h-3 w-3 text-cyan-300" />
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
                          className="tech-input rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-3 py-2 capitalize disabled:opacity-50"
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
                          className="tech-input rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-3 py-2 capitalize disabled:opacity-50"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{profile.orderCount}</td>
                    <td className="px-6 py-4 font-semibold text-white">{formatCurrency(profile.totalSpent)}</td>
                    <td className="px-6 py-4 text-slate-300">{formatDate(profile.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Email Modal */}
      {showBulkEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="tech-glass-panel max-w-2xl w-full mx-4 rounded-2xl border border-cyan-500/20 bg-slate-950/90 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Send Bulk Email</h2>
              <button
                onClick={() => setShowBulkEmailModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-cyan-200">
                  Recipients
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={sendToAll}
                      onChange={(e) => {
                        setSendToAll(e.target.checked);
                        if (e.target.checked) {
                          setSelectedUserIds([]);
                          setSelectAll(false);
                        }
                      }}
                      className="h-4 w-4 rounded border-cyan-500/20 bg-slate-900/80 text-cyan-500 focus:ring-cyan-500"
                    />
                    Send to All Active Users ({activeUsers})
                  </label>
                  {!sendToAll && (
                    <p className="text-xs text-slate-400">
                      {selectedUserIds.length} user(s) selected
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-cyan-200">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-cyan-200">
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={6}
                  className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-4 py-3 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendBulkEmail}
                  disabled={sendingEmail}
                  className="tech-button flex-1 flex items-center justify-center gap-2 rounded-3xl bg-cyan-500 px-6 py-3 text-white font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowBulkEmailModal(false)}
                  className="tech-button flex-1 rounded-3xl border border-cyan-500/20 bg-slate-900/80 px-6 py-3 text-cyan-200 hover:bg-cyan-500/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
