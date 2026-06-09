'use client';

import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { Download, Edit, Plus, Search, Ticket, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/format';
import type { Coupon, CouponDiscountType, CouponStatus, DateValue } from '@/lib/types';

function toDate(dateValue: DateValue | undefined): Date | undefined {
  if (!dateValue) return undefined;
  try {
    if (typeof dateValue === 'object' && 'toDate' in dateValue) {
      return dateValue.toDate();
    }
    if (typeof dateValue === 'object' && 'seconds' in dateValue) {
      return new Date(dateValue.seconds * 1000);
    }
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    return undefined;
  } catch (error) {
    console.error('Error converting date:', error, dateValue);
    return undefined;
  }
}

interface CouponFormState {
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string;
  expiryDate: string;
  maxUses: string;
  status: CouponStatus;
}

const emptyForm: CouponFormState = {
  code: '',
  discountType: 'fixed',
  discountValue: '',
  minOrderAmount: '',
  expiryDate: '',
  maxUses: '',
  status: 'active',
};

interface BulkFormState {
  prefix: string;
  count: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string;
  expiryDate: string;
  maxUses: string;
}

const emptyBulkForm: BulkFormState = {
  prefix: '',
  count: '',
  discountType: 'fixed',
  discountValue: '',
  minOrderAmount: '',
  expiryDate: '',
  maxUses: '',
};

export default function AdminCoupons() {
  const { getIdToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormState>(emptyForm);
  const [bulkFormData, setBulkFormData] = useState<BulkFormState>(emptyBulkForm);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, used: 0, expired: 0 });

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = await getIdToken();
        let status: string | null = null;
        if (activeTab === 'active') {
          status = 'active';
        } else {
          // History tab: fetch both used and expired coupons
          status = null; // Don't filter by status to get all coupons
        }
        console.log('=== FETCHING COUPONS ===');
        console.log('Active tab:', activeTab);
        console.log('Status filter:', status);
        const response = await fetch(`/api/coupons${status ? `?status=${status}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        console.log('API response:', data);
        if (response.ok) {
          console.log('Total coupons from API:', data.coupons?.length);
          console.log('Stats from API:', data.stats);
          // Filter coupons based on active tab
          const filteredCoupons = status 
            ? data.coupons 
            : data.coupons.filter((c: Coupon) => c.status === 'used' || c.status === 'expired');
          console.log('Filtered coupons count:', filteredCoupons?.length);
          console.log('Filtered coupons:', filteredCoupons);
          setCoupons(filteredCoupons);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        toast.error('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [activeTab, getIdToken]);

  const filteredCoupons = useMemo(() => {
    const search = searchQuery.toLowerCase();
    const result = coupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(search) ||
        coupon.discountType.toLowerCase().includes(search),
    );
    console.log('=== SEARCH FILTERING ===');
    console.log('Search query:', searchQuery);
    console.log('Coupons before search filter:', coupons.length);
    console.log('Coupons after search filter:', result.length);
    return result;
  }, [coupons, searchQuery]);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const expiryDate = toDate(coupon.expiryDate);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : '',
      maxUses: coupon.maxUses?.toString() || '',
      status: coupon.status,
    });
    setIsModalOpen(true);
  };

  const openBulkModal = () => {
    setBulkFormData(emptyBulkForm);
    setIsBulkModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setSaving(false);
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setSaving(false);
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;

    try {
      const token = await getIdToken();
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete coupon');
      toast.success('Coupon deleted');
      // Refresh coupons
      let status: string | null = null;
      if (activeTab === 'active') {
        status = 'active';
      }
      const dataResponse = await fetch(`/api/coupons${status ? `?status=${status}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await dataResponse.json();
      if (dataResponse.ok) {
        // Filter coupons based on active tab
        const filteredCoupons = status 
          ? data.coupons 
          : data.coupons.filter((c: Coupon) => c.status === 'used' || c.status === 'expired');
        setCoupons(filteredCoupons);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const discountValue = Number(formData.discountValue);
    const minOrderAmount = formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined;
    const maxUses = formData.maxUses ? Number(formData.maxUses) : undefined;

    if (!formData.code.trim() || !formData.discountValue) {
      toast.error('Code and discount value are required');
      return;
    }

    if (discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (formData.discountType === 'percentage' && discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    if (maxUses !== undefined && maxUses <= 0) {
      toast.error('Maximum uses must be greater than 0');
      return;
    }

    setSaving(true);

    try {
      const token = await getIdToken();
      const payload = {
        code: formData.code.trim(),
        discountType: formData.discountType,
        discountValue,
        minOrderAmount,
        expiryDate: formData.expiryDate || undefined,
        maxUses,
      };

      if (editingCoupon) {
        const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update coupon');
        }
        toast.success('Coupon updated');
      } else {
        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create coupon');
        }
        toast.success('Coupon created');
      }

      closeModal();
      // Refresh coupons
      let status: string | null = null;
      if (activeTab === 'active') {
        status = 'active';
      }
      const dataResponse = await fetch(`/api/coupons${status ? `?status=${status}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await dataResponse.json();
      if (dataResponse.ok) {
        // Filter coupons based on active tab
        const filteredCoupons = status 
          ? data.coupons 
          : data.coupons.filter((c: Coupon) => c.status === 'used' || c.status === 'expired');
        setCoupons(filteredCoupons);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const count = Number(bulkFormData.count);
    const discountValue = Number(bulkFormData.discountValue);
    const minOrderAmount = bulkFormData.minOrderAmount ? Number(bulkFormData.minOrderAmount) : undefined;
    const maxUses = bulkFormData.maxUses ? Number(bulkFormData.maxUses) : undefined;

    if (!bulkFormData.prefix.trim() || !bulkFormData.count || !bulkFormData.discountValue) {
      toast.error('Prefix, count, and discount value are required');
      return;
    }

    if (count <= 0 || count > 100) {
      toast.error('Count must be between 1 and 100');
      return;
    }

    if (discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (bulkFormData.discountType === 'percentage' && discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    if (maxUses !== undefined && maxUses <= 0) {
      toast.error('Maximum uses must be greater than 0');
      return;
    }

    setSaving(true);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/coupons/bulk', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prefix: bulkFormData.prefix.trim(),
          count,
          discountType: bulkFormData.discountType,
          discountValue,
          minOrderAmount,
          expiryDate: bulkFormData.expiryDate || undefined,
          maxUses,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create bulk coupons');

      if (data.success.length > 0) {
        toast.success(`Created ${data.success.length} coupons successfully`);
      }
      if (data.failed.length > 0) {
        toast.error(`Failed to create ${data.failed.length} coupons`);
      }

      closeBulkModal();
      // Refresh coupons
      let status: string | null = null;
      if (activeTab === 'active') {
        status = 'active';
      }
      const dataResponse = await fetch(`/api/coupons${status ? `?status=${status}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const couponsData = await dataResponse.json();
      if (dataResponse.ok) {
        // Filter coupons based on active tab
        const filteredCoupons = status 
          ? couponsData.coupons 
          : couponsData.coupons.filter((c: Coupon) => c.status === 'used' || c.status === 'expired');
        setCoupons(filteredCoupons);
        setStats(couponsData.stats);
      }
    } catch (error) {
      console.error('Error creating bulk coupons:', error);
      toast.error('Failed to create bulk coupons');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = await getIdToken();
      const response = await fetch('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to fetch coupons');

      // Create CSV
      const headers = ['Code', 'Discount Type', 'Discount Value', 'Min Order Amount', 'Expiry Date', 'Status', 'Used By', 'Used Order ID', 'Used At'];
      const rows = data.coupons.map((coupon: Coupon) => [
        coupon.code,
        coupon.discountType,
        coupon.discountValue,
        coupon.minOrderAmount || '',
        toDate(coupon.expiryDate)?.toISOString() || '',
        coupon.status,
        coupon.usedBy || '',
        coupon.usedOrderId || '',
        toDate(coupon.usedAt)?.toISOString() || '',
      ]);

      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coupons-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Coupons exported successfully');
    } catch (error) {
      console.error('Error exporting coupons:', error);
      toast.error('Failed to export coupons');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Coupon Codes</h1>
        <p className="mt-2 text-slate-300">Manage discount coupons for your customers</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="tech-glass-card rounded-xl p-4">
          <p className="text-sm tech-muted">Total Coupons</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="tech-glass-card rounded-xl p-4 border-emerald-500/20">
          <p className="text-sm tech-muted">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
        </div>
        <div className="tech-glass-card rounded-xl p-4 border-amber-500/20">
          <p className="text-sm tech-muted">Used</p>
          <p className="text-2xl font-bold text-amber-400">{stats.used}</p>
        </div>
        <div className="tech-glass-card rounded-xl p-4 border-rose-500/20">
          <p className="text-sm tech-muted">Expired</p>
          <p className="text-2xl font-bold text-rose-400">{stats.expired}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'active'
              ? 'border-b-2 border-cyan-400 text-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Coupons
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'history'
              ? 'border-b-2 border-cyan-400 text-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Coupon History
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 pl-10 pr-4"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 px-4 py-2 font-semibold text-cyan-300 transition hover:bg-slate-700/50"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
          <button
            type="button"
            onClick={openBulkModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-semibold text-white transition hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="h-5 w-5" />
            Bulk Create
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Coupon
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : filteredCoupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons found" description="Create coupons to offer discounts to your customers." />
      ) : (
        <div className="tech-glass-panel overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/90 text-sm text-slate-300">
                  <th className="px-6 py-4 font-semibold text-white">Coupon Code</th>
                  <th className="px-6 py-4 font-semibold text-white">Discount</th>
                  <th className="px-6 py-4 font-semibold text-white">Min Order</th>
                  <th className="px-6 py-4 font-semibold text-white">Expiry Date</th>
                  <th className="px-6 py-4 font-semibold text-white">Uses</th>
                  <th className="px-6 py-4 font-semibold text-white">Status</th>
                  {activeTab === 'history' && (
                    <>
                      <th className="px-6 py-4 font-semibold text-white">Used By</th>
                      <th className="px-6 py-4 font-semibold text-white">Order ID</th>
                      <th className="px-6 py-4 font-semibold text-white">Used At</th>
                    </>
                  )}
                  <th className="px-6 py-4 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-white/10 text-sm hover:bg-slate-900/80">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-cyan-300">{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {coupon.discountType === 'fixed' ? formatCurrency(coupon.discountValue) : `${coupon.discountValue}%`}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {toDate(coupon.expiryDate)?.toLocaleDateString() || 'No expiry'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {coupon.usedCount || 0}
                      {coupon.maxUses && ` / ${coupon.maxUses}`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          coupon.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : coupon.status === 'used'
                              ? 'bg-amber-500/15 text-amber-200'
                              : 'bg-rose-500/15 text-rose-200'
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    {activeTab === 'history' && (
                      <>
                        <td className="px-6 py-4 text-slate-300">{coupon.usedBy || '-'}</td>
                        <td className="px-6 py-4 text-slate-300">{coupon.usedOrderId || '-'}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {toDate(coupon.usedAt)?.toLocaleString() || '-'}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(coupon)}
                          className="rounded-2xl p-2 text-cyan-300 hover:bg-slate-900/70"
                          aria-label="Edit coupon"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon)}
                          className="rounded-2xl p-2 text-rose-400 hover:bg-slate-900/70"
                          aria-label="Delete coupon"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="tech-glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-8 py-6">
              <h2 className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-slate-700 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-3">Coupon Code</label>
                <input
                  value={formData.code}
                  onChange={(event) => setFormData({ ...formData, code: event.target.value.toUpperCase() })}
                  placeholder="e.g., SKY100"
                  className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 font-mono text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(event) => setFormData({ ...formData, discountType: event.target.value as CouponDiscountType })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    <option value="fixed" className="bg-slate-900">
                      Fixed Amount (₹)
                    </option>
                    <option value="percentage" className="bg-slate-900">
                      Percentage (%)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Discount Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {formData.discountType === 'fixed' ? '₹' : '%'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      value={formData.discountValue}
                      onChange={(event) => setFormData({ ...formData, discountValue: event.target.value })}
                      placeholder="0"
                      className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 pl-8 pr-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Minimum Order Amount (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minOrderAmount}
                      onChange={(event) => setFormData({ ...formData, minOrderAmount: event.target.value })}
                      placeholder="0"
                      className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 pl-8 pr-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(event) => setFormData({ ...formData, expiryDate: event.target.value })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Maximum Uses (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(event) => setFormData({ ...formData, maxUses: event.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>
              </div>

              {editingCoupon && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Status</label>
                  <select
                    value={formData.status}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value as CouponStatus })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    <option value="active" className="bg-slate-900">
                      Active
                    </option>
                    <option value="expired" className="bg-slate-900">
                      Expired
                    </option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-cyan-500/20 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-cyan-500/30 px-6 py-2.5 font-semibold text-cyan-300 transition hover:bg-slate-700/50 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="tech-glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-8 py-6">
              <h2 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                Bulk Create Coupons
              </h2>
              <button
                type="button"
                onClick={closeBulkModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-slate-700 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-6 p-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Coupon Prefix</label>
                  <input
                    value={bulkFormData.prefix}
                    onChange={(event) => setBulkFormData({ ...bulkFormData, prefix: event.target.value.toUpperCase() })}
                    placeholder="e.g., SKY100"
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 font-mono text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <p className="mt-1 text-xs text-gray-400">Coupons will be generated as: SKY100A, SKY100B, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Number of Coupons</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bulkFormData.count}
                    onChange={(event) => setBulkFormData({ ...bulkFormData, count: event.target.value })}
                    placeholder="1-100"
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Discount Type</label>
                  <select
                    value={bulkFormData.discountType}
                    onChange={(event) => setBulkFormData({ ...bulkFormData, discountType: event.target.value as CouponDiscountType })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    <option value="fixed" className="bg-slate-900">
                      Fixed Amount (₹)
                    </option>
                    <option value="percentage" className="bg-slate-900">
                      Percentage (%)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Discount Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {bulkFormData.discountType === 'fixed' ? '₹' : '%'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step={bulkFormData.discountType === 'percentage' ? '1' : '0.01'}
                      value={bulkFormData.discountValue}
                      onChange={(event) => setBulkFormData({ ...bulkFormData, discountValue: event.target.value })}
                      placeholder="0"
                      className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 pl-8 pr-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Minimum Order Amount (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkFormData.minOrderAmount}
                      onChange={(event) => setBulkFormData({ ...bulkFormData, minOrderAmount: event.target.value })}
                      placeholder="0"
                      className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 pl-8 pr-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={bulkFormData.expiryDate}
                    onChange={(event) => setBulkFormData({ ...bulkFormData, expiryDate: event.target.value })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Maximum Uses (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={bulkFormData.maxUses}
                    onChange={(event) => setBulkFormData({ ...bulkFormData, maxUses: event.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-cyan-500/20 pt-6">
                <button
                  type="button"
                  onClick={closeBulkModal}
                  className="rounded-lg border border-cyan-500/30 px-6 py-2.5 font-semibold text-cyan-300 transition hover:bg-slate-700/50 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                >
                  {saving ? 'Creating...' : 'Create Bulk Coupons'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
