'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Search, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RichTextEditor from '@/components/RichTextEditor';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: any;
}

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
  status: string;
  source: string;
}

interface MergedRecipient {
  id: string;
  email: string;
  type: 'user' | 'subscriber';
  name?: string;
  role?: string;
  subscribedAt?: any;
  status?: string;
  source?: string;
}

export default function SendBulkMessagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [selectAllSubscribers, setSelectAllSubscribers] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroImage: '',
    ctaText: '',
    ctaUrl: '',
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'registered' | 'subscribers'>('all');

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const usersUnsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setLoading(false);
      }
    );

    const subscribersQuery = query(collection(db, 'newsletter_subscribers'));
    const subscribersUnsubscribe = onSnapshot(
      subscribersQuery,
      (snapshot) => {
        const subscribersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Subscriber[];
        setSubscribers(subscribersData);
      },
      (error) => {
        console.error('Error fetching subscribers:', error);
      }
    );

    return () => {
      usersUnsubscribe();
      subscribersUnsubscribe();
    };
  }, []);

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
    setSelectAllUsers(newSelection.size === filteredUsers.length);
  };

  const toggleSelectAllUsers = () => {
    if (selectAllUsers) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
    setSelectAllUsers(!selectAllUsers);
  };

  const toggleSubscriberSelection = (subscriberId: string) => {
    const newSelection = new Set(selectedSubscribers);
    if (newSelection.has(subscriberId)) {
      newSelection.delete(subscriberId);
    } else {
      newSelection.add(subscriberId);
    }
    setSelectedSubscribers(newSelection);
    setSelectAllSubscribers(newSelection.size === filteredSubscribers.length);
  };

  const toggleSelectAllSubscribers = () => {
    if (selectAllSubscribers) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(filteredSubscribers.map(s => s.id)));
    }
    setSelectAllSubscribers(!selectAllSubscribers);
  };

  const toggleMergedSelection = (email: string) => {
    const newSelection = new Set(selectedEmails);
    if (newSelection.has(email)) {
      newSelection.delete(email);
    } else {
      newSelection.add(email);
    }
    setSelectedEmails(newSelection);
    setSelectAll(newSelection.size === filteredMergedRecipients.length);
    
    // Sync with individual selections
    const user = users.find(u => u.email === email);
    if (user) {
      if (newSelection.has(email)) {
        setSelectedUsers(prev => new Set(prev).add(user.id));
      } else {
        setSelectedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(user.id);
          return newSet;
        });
      }
    }
    
    const subscriber = subscribers.find(s => s.email === email);
    if (subscriber) {
      if (newSelection.has(email)) {
        setSelectedSubscribers(prev => new Set(prev).add(subscriber.id));
      } else {
        setSelectedSubscribers(prev => {
          const newSet = new Set(prev);
          newSet.delete(subscriber.id);
          return newSet;
        });
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails(new Set());
      setSelectedUsers(new Set());
      setSelectedSubscribers(new Set());
    } else {
      const allEmails = new Set(filteredMergedRecipients.map(r => r.email));
      setSelectedEmails(allEmails);
      
      // Sync with individual selections
      const userIds = new Set(filteredMergedRecipients
        .filter(r => r.type === 'user')
        .map(r => r.id));
      setSelectedUsers(userIds);
      
      const subscriberIds = new Set(filteredMergedRecipients
        .filter(r => r.type === 'subscriber')
        .map(r => r.id));
      setSelectedSubscribers(subscriberIds);
    }
    setSelectAll(!selectAll);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.phone && user.phone.includes(searchQuery));
    return matchesSearch;
  });

  const filteredSubscribers = subscribers.filter(sub => {
    return sub.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Create merged recipient list with deduplication
  const mergedRecipients: MergedRecipient[] = (() => {
    const emailMap = new Map<string, MergedRecipient>();
    
    // Add users
    users.forEach(user => {
      emailMap.set(user.email, {
        id: user.id,
        email: user.email,
        type: 'user',
        name: user.name,
        role: user.role,
      });
    });
    
    // Add subscribers (only if email doesn't already exist)
    subscribers.forEach(sub => {
      if (!emailMap.has(sub.email)) {
        emailMap.set(sub.email, {
          id: sub.id,
          email: sub.email,
          type: 'subscriber',
          subscribedAt: sub.subscribedAt,
          status: sub.status,
          source: sub.source,
        });
      }
    });
    
    return Array.from(emailMap.values());
  })();

  // Filter merged recipients by search
  const filteredMergedRecipients = mergedRecipients.filter(recipient => {
    return recipient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recipient.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get all unique emails from both users and subscribers
  const allRecipients = Array.from(new Set([
    ...users.map(u => u.email),
    ...subscribers.map(s => s.email)
  ]));

  const getRecipientCount = () => {
    switch (recipientType) {
      case 'all':
        return allRecipients.length;
      case 'registered':
        return filteredUsers.length;
      case 'subscribers':
        return filteredSubscribers.length;
      default:
        return 0;
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error('Subject is required');
      return;
    }

    if (!formData.message.trim() || formData.message === '<p></p>') {
      toast.error('Message is required');
      return;
    }

    let recipients: string[] = [];
    
    switch (recipientType) {
      case 'all':
        if (selectedEmails.size === 0) {
          toast.error('Please select at least one recipient');
          return;
        }
        recipients = Array.from(selectedEmails);
        break;
      case 'registered':
        if (selectedUsers.size === 0) {
          toast.error('Please select at least one user');
          return;
        }
        recipients = filteredUsers
          .filter(u => selectedUsers.has(u.id))
          .map(u => u.email);
        break;
      case 'subscribers':
        if (selectedSubscribers.size === 0) {
          toast.error('Please select at least one subscriber');
          return;
        }
        recipients = filteredSubscribers
          .filter(s => selectedSubscribers.has(s.id))
          .map(s => s.email);
        break;
    }

    if (recipients.length === 0) {
      toast.error('No recipients selected');
      return;
    }

    if (!confirm(`Send this message to ${recipients.length} recipient(s)?`)) {
      return;
    }

    try {
      setSending(true);
      
      // Upload attachments first
      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          // For now, we'll use base64 for demo. In production, upload to storage
          return new Promise<{ name: string; url: string; size: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                name: file.name,
                url: reader.result as string,
                size: `${(file.size / 1024).toFixed(1)} KB`,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await fetch('/api/admin/send-bulk-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject: formData.subject,
          message: formData.message,
          heroTitle: formData.heroTitle,
          heroSubtitle: formData.heroSubtitle,
          heroDescription: formData.heroDescription,
          heroImage: formData.heroImage,
          ctaButton: formData.ctaText && formData.ctaUrl ? {
            text: formData.ctaText,
            url: formData.ctaUrl,
          } : undefined,
          attachments: attachmentData,
          isHtml: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Message sent to ${data.sentCount} recipient(s)`);
        setFormData({ 
          subject: '', 
          message: '', 
          heroTitle: '', 
          heroSubtitle: '', 
          heroDescription: '',
          heroImage: '', 
          ctaText: '', 
          ctaUrl: '' 
        });
        setAttachments([]);
        setSelectedUsers(new Set());
        setSelectedSubscribers(new Set());
        setSelectedEmails(new Set());
        setSelectAllUsers(false);
        setSelectAllSubscribers(false);
        setSelectAll(false);
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Send Bulk Message</h1>
          <p className="text-gray-400">Send email to multiple users at once</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recipient Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-white/10 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Recipients
            </h2>

            {/* Recipient Type */}
            <div className="mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setRecipientType('all')}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    recipientType === 'all'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-900/50 text-gray-400 border border-white/10'
                  }`}
                >
                  {selectedEmails.size > 0 
                    ? `Selected (${selectedEmails.size})` 
                    : `All (${allRecipients.length})`
                  }
                </button>
                <button
                  onClick={() => setRecipientType('registered')}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    recipientType === 'registered'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-900/50 text-gray-400 border border-white/10'
                  }`}
                >
                  {selectedUsers.size > 0 
                    ? `Selected (${selectedUsers.size})` 
                    : `Registered Users (${filteredUsers.length})`
                  }
                </button>
                <button
                  onClick={() => setRecipientType('subscribers')}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    recipientType === 'subscribers'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-900/50 text-gray-400 border border-white/10'
                  }`}
                >
                  {selectedSubscribers.size > 0 
                    ? `Selected (${selectedSubscribers.size})` 
                    : `Subscribers (${filteredSubscribers.length})`
                  }
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder={recipientType === 'subscribers' ? "Search subscribers..." : recipientType === 'all' ? "Search all recipients..." : "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none"
              />
            </div>

            {/* Quick Actions */}
            {recipientType === 'all' && filteredMergedRecipients.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    setSelectedEmails(new Set());
                    setSelectedUsers(new Set());
                    setSelectedSubscribers(new Set());
                    setSelectAll(false);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 transition"
                >
                  Deselect All
                </button>
              </div>
            )}

            {recipientType === 'subscribers' && filteredSubscribers.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={toggleSelectAllSubscribers}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    setSelectedSubscribers(new Set());
                    setSelectAllSubscribers(false);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 transition"
                >
                  Deselect All
                </button>
              </div>
            )}

            {recipientType === 'registered' && filteredUsers.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={toggleSelectAllUsers}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    setSelectedUsers(new Set());
                    setSelectAllUsers(false);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-white text-sm hover:bg-slate-900/70 transition"
                >
                  Deselect All
                </button>
              </div>
            )}

            {/* Recipient List */}
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : recipientType === 'all' ? (
                filteredMergedRecipients.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No recipients found</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-slate-900/30 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-400">Select All ({filteredMergedRecipients.length})</span>
                    </div>
                    {filteredMergedRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        onClick={() => toggleMergedSelection(recipient.email)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer ${
                          selectedEmails.has(recipient.email)
                            ? 'bg-cyan-500/10 border border-cyan-500/20'
                            : 'bg-slate-900/30 border border-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmails.has(recipient.email)}
                          onChange={() => toggleMergedSelection(recipient.email)}
                          className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{recipient.email}</p>
                          <p className="text-xs text-gray-400">
                            {recipient.type === 'user' 
                              ? `${recipient.name} • ${recipient.role}`
                              : `Subscriber • ${recipient.status}`
                            }
                          </p>
                        </div>
                        <span className={`text-xs ${recipient.type === 'user' ? 'text-purple-400' : 'text-cyan-400'}`}>
                          {recipient.type === 'user' ? 'User' : 'Subscriber'}
                        </span>
                        {selectedEmails.has(recipient.email) && (
                          <Check className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>
                    ))}
                  </>
                )
              ) : recipientType === 'subscribers' ? (
                filteredSubscribers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No subscribers found</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-slate-900/30 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectAllSubscribers}
                        onChange={toggleSelectAllSubscribers}
                        className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-400">Select All ({filteredSubscribers.length})</span>
                    </div>
                    {filteredSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubscriberSelection(sub.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer ${
                          selectedSubscribers.has(sub.id)
                            ? 'bg-cyan-500/10 border border-cyan-500/20'
                            : 'bg-slate-900/30 border border-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.has(sub.id)}
                          onChange={() => toggleSubscriberSelection(sub.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{sub.email}</p>
                          <p className="text-xs text-gray-400">Subscribed: {sub.subscribedAt ? new Date(sub.subscribedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <span className="text-xs text-cyan-400">{sub.status}</span>
                        {selectedSubscribers.has(sub.id) && (
                          <Check className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>
                    ))}
                  </>
                )
              ) : (
                <>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No users found</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 p-3 bg-slate-900/30 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectAllUsers}
                          onChange={toggleSelectAllUsers}
                          className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-400">Select All ({filteredUsers.length})</span>
                      </div>
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => toggleUserSelection(user.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer ${
                            selectedUsers.has(user.id)
                              ? 'bg-cyan-500/10 border border-cyan-500/20'
                              : 'bg-slate-900/30 border border-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                          <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                          {selectedUsers.has(user.id) && (
                            <Check className="h-4 w-4 text-cyan-400" />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Selected Count */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                {recipientType === 'all' 
                  ? `Selected: ${selectedEmails.size} / Total: ${filteredMergedRecipients.length}`
                  : recipientType === 'registered'
                  ? `Selected: ${selectedUsers.size} / Total: ${filteredUsers.length}`
                  : `Selected: ${selectedSubscribers.size} / Total: ${filteredSubscribers.length}`
                }
              </p>
            </div>
          </motion.div>

          {/* Message Composition */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-cyan-400" />
                Compose Message
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none px-4 py-3"
                  />
                </div>

                {/* Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Hero Title (Optional)</label>
                    <input
                      type="text"
                      value={formData.heroTitle}
                      onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                      placeholder="e.g., Exciting News!"
                      className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Hero Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={formData.heroSubtitle}
                      onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                      placeholder="e.g., Check out what's new"
                      className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none px-4 py-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hero Description (Optional)</label>
                  <textarea
                    value={formData.heroDescription}
                    onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                    placeholder="Brief description for the hero section"
                    rows={2}
                    className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none px-4 py-3 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hero Image URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.heroImage}
                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message *</label>
                  <RichTextEditor
                    content={formData.message}
                    onChange={(content) => setFormData({ ...formData, message: content })}
                    placeholder="Write your message here..."
                  />
                </div>

                {/* CTA Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">CTA Button Text (Optional)</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      placeholder="e.g., Visit Website"
                      className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">CTA Button URL (Optional)</label>
                    <input
                      type="text"
                      value={formData.ctaUrl}
                      onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                      placeholder="https://theskytechnology.in"
                      className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/30 focus:outline-none px-4 py-3"
                    />
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Attachments (Optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                    className="w-full rounded-lg bg-slate-900/50 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
                  />
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2"
                        >
                          <span className="text-sm text-gray-300">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold py-3 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
