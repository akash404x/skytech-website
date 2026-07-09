'use client';

import { collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { CheckCircle, XCircle, Eye, Clock, Package, Wrench, Briefcase, Search, Filter, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { approveRequest, rejectRequest } from '@/lib/approval-service';
import { useAuth } from '@/contexts/AuthContext';
import { toDate } from '@/lib/format';
import type { ApprovalRequest, ApprovalStatus } from '@/lib/types';

export default function AdminApprovals() {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'approval_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setApprovals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ApprovalRequest)));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading approvals:', error);
        toast.error('Failed to load approvals');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const filteredApprovals = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return approvals.filter((approval) => {
      const matchesSearch =
        approval.type.toLowerCase().includes(search) ||
        approval.action.toLowerCase().includes(search) ||
        approval.requestedBy.name.toLowerCase().includes(search) ||
        approval.requestedBy.email.toLowerCase().includes(search);

      const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [approvals, searchQuery, statusFilter]);

  const handleApprove = async (request: ApprovalRequest) => {
    if (!user) return;

    setProcessing(true);
    try {
      const result = await approveRequest(request.id, user.uid, user.displayName || 'Admin');
      if (result.success) {
        toast.success('Request approved successfully');
      } else {
        toast.error(('error' in result ? result.error : 'Failed to approve request') as string);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user) return;

    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const result = await rejectRequest(selectedRequest.id, user.uid, user.displayName || 'Admin', rejectReason.trim());
      if (result.success) {
        toast.success('Request rejected successfully');
        setIsRejectModalOpen(false);
        setRejectReason('');
        setSelectedRequest(null);
      } else {
        toast.error(('error' in result ? result.error : 'Failed to reject request') as string);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectReason('');
    setSelectedRequest(null);
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-5 w-5" />;
      case 'service':
        return <Wrench className="h-5 w-5" />;
      case 'work':
        return <Briefcase className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTargetName = (request: ApprovalRequest) => {
    if (request.type === 'product') {
      return (request.newData.name as string) || 'Product';
    } else if (request.type === 'service') {
      return (request.newData.title as string) || 'Service';
    } else if (request.type === 'work') {
      return (request.newData.title as string) || 'Work';
    }
    return 'Unknown';
  };

  const getImageUrl = (request: ApprovalRequest): string | null => {
    if (request.type === 'product') {
      const images = request.newData.images as string[] | undefined;
      if (images && images.length > 0) {
        return images[0];
      }
    } else if (request.type === 'service') {
      return (request.newData.image as string) || null;
    } else if (request.type === 'work') {
      const thumbnail = request.newData.thumbnail as string | undefined;
      if (thumbnail) return thumbnail;
      
      const media = request.newData.media as Array<{ type: string; url: string }> | undefined;
      if (media && media.length > 0) {
        return media[0].url;
      }
    }
    return null;
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">Access denied. Admin only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-lg bg-slate-800/30 p-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Approval Requests</h1>
        <p className="mt-2 text-slate-300">Review and approve editor requests for Products, Services, and Works</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 pl-10 pr-4"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-cyan-300" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ApprovalStatus | 'all')}
            className="tech-input rounded-xl border border-cyan-500/20 bg-slate-900/80 px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredApprovals.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No approval requests"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No requests match your search criteria'
              : 'No pending approval requests at the moment'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="rounded-xl border border-cyan-500/10 bg-slate-800/30 p-6 hover:border-cyan-500/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getImageUrl(approval) ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-cyan-500/20 bg-slate-900/70">
                      <Image
                        src={getImageUrl(approval)!}
                        alt={`${approval.type} thumbnail`}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                      {getTypeIcon(approval.type)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {approval.action} {approval.type}
                      </h3>
                      {getStatusBadge(approval.status)}
                    </div>
                    <p className="text-sm text-slate-300 mb-2">
                      <span className="font-medium">Target:</span> {getTargetName(approval)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>
                        <span className="font-medium">By:</span> {approval.requestedBy.name}
                      </span>
                      <span>
                        <span className="font-medium">Email:</span> {approval.requestedBy.email}
                      </span>
                      <span>
                        <span className="font-medium">Date:</span>{' '}
                        {approval.createdAt ? toDate(approval.createdAt)?.toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {approval.status === 'rejected' && approval.rejectedReason && (
                      <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-300">
                          <span className="font-medium">Rejection Reason:</span> {approval.rejectedReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRequest(approval)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {approval.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(approval)}
                        disabled={processing}
                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openRejectModal(approval)}
                        disabled={processing}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {selectedRequest && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Request Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <span className="ml-2 text-white capitalize">{selectedRequest.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Action:</span>
                    <span className="ml-2 text-white capitalize">{selectedRequest.action}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedRequest.status)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <span className="ml-2 text-white">
                      {selectedRequest.createdAt ? toDate(selectedRequest.createdAt)?.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Requested By</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-slate-400">Name:</span>
                    <span className="ml-2 text-white">{selectedRequest.requestedBy.name}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Email:</span>
                    <span className="ml-2 text-white">{selectedRequest.requestedBy.email}</span>
                  </p>
                </div>
              </div>
              {getImageUrl(selectedRequest) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Uploaded Image</h3>
                  <div className="relative h-64 w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/70">
                    <Image
                      src={getImageUrl(selectedRequest)!}
                      alt={`${selectedRequest.type} image`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">New Data</h3>
                <pre className="bg-slate-800 rounded-lg p-4 overflow-x-auto text-sm text-slate-300">
                  {JSON.stringify(selectedRequest.newData, null, 2)}
                </pre>
              </div>
              {Object.keys(selectedRequest.oldData).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Old Data</h3>
                  <pre className="bg-slate-800 rounded-lg p-4 overflow-x-auto text-sm text-slate-300">
                    {JSON.stringify(selectedRequest.oldData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Reject Request</h2>
              <button
                onClick={closeRejectModal}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  rows={4}
                  className="tech-input w-full rounded-xl border border-cyan-500/20 bg-slate-900/80 px-4 py-3"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeRejectModal}
                  disabled={processing}
                  className="px-4 py-2 rounded-xl border border-cyan-500/20 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
