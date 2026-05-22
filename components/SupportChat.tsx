'use client';

import { collection, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch, increment } from 'firebase/firestore';
import { Paperclip, Send, Sparkles, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { uploadChatAttachment } from '@/lib/firebase-storage';
import { mapChat, mapChatMessage } from '@/lib/firestore-mappers';
import type { Chat, ChatMessage } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface SupportChatProps {
  orderId?: string;
  orderNumber?: string;
  userName?: string;
  userEmail?: string;
  chatId?: string;
  adminMode?: boolean;
}

const QUICK_REPLIES = [
  'Where is my order?',
  'I have a payment issue.',
  'Please send invoice details.',
  'Can you update the shipping address? ',
];

export default function SupportChat({ orderId, orderNumber, userName, userEmail, chatId, adminMode = false }: SupportChatProps) {
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = user?.uid || '';
  const currentUserName = user?.displayName || user?.email || 'Customer';

  const formatTimestamp = (timestamp: unknown) => {
    if (!timestamp) return '…';
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return '…';
  };

  const activeChatId = chatId || chat?.id;
  const chatRef = activeChatId ? doc(db, 'chats', activeChatId) : null;

  const canSend = !!input.trim() || !!attachment;

  const chatQuery = useMemo(() => {
    if (chatId) return null;
    if (!orderId || !currentUserId) return null;
    return query(
      collection(db, 'chats'),
      where('orderId', '==', orderId),
      where('userId', '==', currentUserId),
      limit(1),
    );
  }, [chatId, currentUserId, orderId]);

  useEffect(() => {
    if (chatId) {
      const chatDoc = doc(db, 'chats', chatId);
      const unsubscribe = onSnapshot(chatDoc, (snapshot) => {
        setChat(snapshot.exists() ? mapChat(snapshot.id, snapshot.data()) : null);
        setLoadingChat(false);
      });
      return unsubscribe;
    }

    if (!chatQuery) {
      setLoadingChat(false);
      return undefined;
    }

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const document = snapshot.docs[0];
      setChat(document ? mapChat(document.id, document.data()) : null);
      setLoadingChat(false);
    });

    return unsubscribe;
  }, [chatId, chatQuery]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setLoadingMessages(false);
      return undefined;
    }

    setLoadingMessages(true);
    const messagesQuery = query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((document) => mapChatMessage(document.id, document.data())));
      setLoadingMessages(false);
    });

    return unsubscribe;
  }, [activeChatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (!activeChatId || !chat) return undefined;

    const markUnreadMessages = async () => {
      const oppositeSender = adminMode ? 'user' : 'admin';
      const messagesQuery = query(
        collection(db, 'chats', activeChatId, 'messages'),
        where('sender', '==', oppositeSender),
        where('seen', '==', false),
      );
      const snapshot = await getDocs(messagesQuery);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((messageDoc) => batch.update(messageDoc.ref, { seen: true }));

      const chatUpdates: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (adminMode) {
        chatUpdates.unreadCount = 0;
      } else {
        chatUpdates.unreadForUser = 0;
      }
      batch.update(doc(db, 'chats', activeChatId), chatUpdates);
      await batch.commit();
    };

    markUnreadMessages().catch((sendError) => {
      console.error('Failed to mark unread messages as seen:', sendError);
    });

    return undefined;
  }, [activeChatId, adminMode, chat]);

  useEffect(() => {
    if (!input.trim()) {
      setTyping(false);
      return;
    }

    setTyping(true);
    const timeout = window.setTimeout(() => setTyping(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [input]);

  const handleAttachment = (file: File | null) => {
    setError(null);
    if (!file) {
      setAttachment(null);
      return;
    }
    if (file.size > 3_000_000) {
      setError('Please upload images smaller than 3MB.');
      return;
    }
    setAttachment(file);
  };

  const sendMessage = async (text?: string) => {
    if (!canSend || (!orderId && !chatId) || !currentUserId) return;
    setSending(true);
    setError(null);

    try {
      const messageText = text?.trim() ?? input.trim();
      if (!messageText && !attachment) {
        setError('Please enter a message or choose an image.');
        return;
      }

      const chatDocRef = chatRef || doc(collection(db, 'chats'));
      const now = serverTimestamp();
      let attachmentUrl: string | undefined;

      if (attachment) {
        setUploadingAttachment(true);
        attachmentUrl = await uploadChatAttachment(attachment, chatDocRef.id);
        setUploadingAttachment(false);
      }

      const chatPayload = {
        userId: currentUserId,
        orderId: orderId || (chat?.orderId ?? ''),
        orderNumber: orderNumber || chat?.orderNumber || '',
        userEmail: userEmail || user?.email || '',
        userName: userName || currentUserName,
        lastMessage: attachmentUrl ? 'Sent an attachment' : messageText,
        lastSender: adminMode ? 'admin' : 'user',
        lastMessageAt: now,
        updatedAt: now,
        status: 'open' as const,
        unreadCount: adminMode ? 0 : increment(1),
        unreadForUser: adminMode ? increment(1) : 0,
        createdAt: chat ? chat.createdAt ?? now : now,
      };

      await setDoc(chatDocRef, chatPayload, { merge: true });
      await setDoc(doc(collection(chatDocRef, 'messages')), {
        sender: adminMode ? 'admin' : 'user',
        text: attachmentUrl ? messageText || 'Attached image' : messageText,
        attachmentUrl,
        timestamp: now,
        seen: false,
      });

      setInput('');
      setAttachment(null);
    } catch (sendError) {
      console.error('Chat send failed:', sendError);
      setError('Unable to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const quickReply = async (value: string) => {
    setInput(value);
    setTimeout(() => sendMessage(value), 50);
  };

  const headerTitle = adminMode ? 'Support Chat' : 'Order Support';
  const subtitle = adminMode
    ? 'Respond to customer conversations in real time.'
    : 'Chat with support about payments, shipping, and order issues.';

  return (
    <div className="tech-glass-card overflow-hidden border-cyan-300/20 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
      <div className="border-b border-white/10 bg-slate-950/80 px-6 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">{headerTitle}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{subtitle}</h2>
            <p className="mt-1 text-sm text-slate-400">{orderNumber ? `Order ${orderNumber}` : 'Support conversation'}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.35)]" />
            Live sync enabled
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300 shadow-inner shadow-black/10">
            {loadingChat ? (
              <p className="animate-pulse text-slate-500">Loading chat…</p>
            ) : chat ? (
              <div className="space-y-3">
                <p className="text-sm text-cyan-200">Connected to {chat.userName}</p>
                <p className="text-sm tech-text">Last update: {chat.lastMessage || 'Waiting for a new message'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">No chat exists yet for this order.</p>
                <p className="text-sm text-slate-500">Send the first message and a thread will start immediately.</p>
              </div>
            )}
          </div>

          <div className="relative rounded-3xl border border-blue-500/20 bg-slate-950/90 p-4">
            <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2" style={{ minHeight: '280px' }}>
              {loadingMessages ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-900/80" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-[240px] items-center justify-center text-center text-slate-500">
                  <div>
                    <Sparkles className="mx-auto mb-4 h-8 w-8 text-cyan-400" />
                    <p className="font-semibold text-white">Your support chat is ready.</p>
                    <p className="mt-2 text-sm text-slate-400">Send a message to start the conversation.</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.sender === 'user';
                  return (
                    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[90%] rounded-3xl border p-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)] ${
                          isUser
                            ? 'bg-cyan-500/15 border-cyan-400/30 text-white'
                            : 'bg-violet-500/15 border-violet-400/30 text-white'
                        }`}
                      >
                        {message.attachmentUrl ? (
                          <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100">
                            <UploadCloud className="h-4 w-4" />
                            View attachment
                          </a>
                        ) : null}
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                        <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-400">
                          <span>{message.sender === 'admin' ? 'Admin' : 'You'}</span>
                          <span>{formatTimestamp(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/95 to-transparent" aria-hidden />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => quickReply(reply)}
                  className="rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:bg-cyan-500/10"
                >
                  {reply}
                </button>
              ))}
            </div>
            <div className="mt-2 rounded-3xl border border-white/10 bg-slate-950/90 p-4">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask your question or type a quick reply..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                />
                <button
                  type="button"
                  disabled={!canSend || sending}
                  onClick={() => sendMessage()}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-500 px-4 text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40">
                  <Paperclip className="h-4 w-4 text-cyan-300" />
                  <span>{attachment ? attachment.name : 'Attach image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleAttachment(event.target.files?.[0] ?? null)}
                  />
                </label>
                {attachment ? (
                  <button
                    type="button"
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15"
                    onClick={() => setAttachment(null)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              {uploadingAttachment && <p className="mt-3 text-xs text-slate-400">Uploading attachment…</p>}
              {typing && <p className="mt-3 text-xs text-cyan-200">Typing…</p>}
              {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-[0_0_40px_rgba(15,23,42,0.65)]">
          <div className="rounded-3xl bg-slate-900/90 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">Support tips</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>• Keep messages concise and include the order number.</li>
              <li>• Attach a screenshot for payment or shipping issues.</li>
              <li>• Admin replies appear instantly in the chat.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">Status</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-300">{chat?.status === 'resolved' ? 'Resolved' : 'Open'}</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {chat?.unreadCount ?? 0} admin unread
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-purple-500/10 bg-slate-950/80 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">Quick admin hint</p>
            <p className="mt-3 text-sm text-slate-400">If you are a power user, mention your payment ID and shipping city in the message.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
