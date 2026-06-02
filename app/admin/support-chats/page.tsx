'use client';

import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { MessageSquare, Search, Shield, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { mapChat } from '@/lib/firestore-mappers';
import SupportChat from '@/components/SupportChat';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import type { Chat } from '@/lib/types';

export default function AdminSupportChats() {
  const { isAdmin, isEditor } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState<'all' | 'open' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chatsQuery = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const chatItems = snapshot.docs.map((document) => mapChat(document.id, document.data()));
        setChats(chatItems);
        setLoading(false);
        if (!selectedChatId && chatItems.length > 0) {
          setSelectedChatId(chatItems[0].id);
        }
      },
      (error) => {
        console.error('Failed to load support chats:', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const filteredChats = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return chats.filter((chat) => {
      const matchesSearch =
        chat.orderNumber.toLowerCase().includes(normalized) ||
        chat.userName.toLowerCase().includes(normalized) ||
        chat.userEmail.toLowerCase().includes(normalized) ||
        chat.lastMessage.toLowerCase().includes(normalized);
      const matchesFilter = filterOpen === 'all' || chat.status === filterOpen;
      return matchesSearch && matchesFilter;
    });
  }, [chats, filterOpen, search]);

  const currentChat = selectedChatId ? chats.find((item) => item.id === selectedChatId) ?? null : null;

  const markResolved = async () => {
    if (!currentChat) return;
    await updateDoc(doc(db, 'chats', currentChat.id), {
      status: 'resolved',
      updatedAt: serverTimestamp(),
    });
  };

  if (!isAdmin && !isEditor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="tech-heading-gradient text-3xl font-bold">Support Chats</h1>
          <p className="mt-2 text-slate-400">Manage all customer conversations and reply instantly.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
            Active chats: <span className="font-semibold text-white">{chats.length}</span>
          </div>
          <div className="rounded-2xl border border-cyan-500/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-300">
            {chats.filter((chat) => chat.unreadCount > 0).length} unread messages
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-[0_0_36px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <MessageSquare className="h-5 w-5 text-cyan-300" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Chat queue</p>
              <p className="text-sm text-slate-400">Filter by order, user or status.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-300">Search chat</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders, users, messages"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'open', 'resolved'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterOpen(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filterOpen === status
                    ? 'bg-cyan-500 text-slate-950'
                    : 'border border-white/10 bg-slate-900/80 text-slate-300 hover:border-cyan-300/40'
                }`}
              >
                {status === 'all' ? 'All' : status === 'open' ? 'Open' : 'Resolved'}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-800" />
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No chats found"
                description="No support conversations match your filter yet."
              />
            ) : (
              <div className="divide-y divide-white/5">
                {filteredChats.map((chatItem) => (
                  <button
                    key={chatItem.id}
                    type="button"
                    onClick={() => setSelectedChatId(chatItem.id)}
                    className={`w-full px-4 py-4 text-left transition ${
                      selectedChatId === chatItem.id ? 'bg-cyan-500/10' : 'hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{chatItem.orderNumber}</p>
                        <p className="mt-1 text-sm text-slate-400">{chatItem.userName} • {chatItem.userEmail}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        {chatItem.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400 line-clamp-2">{chatItem.lastMessage || 'No message yet'}</p>
                    {chatItem.unreadCount > 0 ? (
                      <span className="mt-3 inline-flex rounded-full bg-cyan-400/15 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                        {chatItem.unreadCount} new
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          {!currentChat ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-8 text-center text-slate-400">
              <Sparkles className="mx-auto mb-4 h-10 w-10 text-cyan-300" />
              <h2 className="text-xl font-semibold text-white">Select a chat to reply</h2>
              <p className="mt-2 text-sm text-slate-400">Conversations will appear here as soon as a customer starts a support thread.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <div>
                  <p className="text-sm text-slate-400">Selected chat</p>
                  <p className="font-semibold text-white">{currentChat.orderNumber} • {currentChat.userName}</p>
                  <p className="text-xs text-slate-500">{currentChat.userEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={markResolved}
                  className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  Mark resolved
                </button>
              </div>
              <SupportChat chatId={currentChat.id} adminMode />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
