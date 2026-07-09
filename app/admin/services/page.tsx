'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Edit, ImagePlus, Plus, Search, Star, Trash2, Upload, Wrench, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { uploadServiceImage } from '@/lib/firebase-storage';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { mapService } from '@/lib/firestore-mappers';
import { SERVICE_CATEGORIES } from '@/lib/services-content';
import { SERVICE_ICON_OPTIONS } from '@/lib/service-icons';
import { createApprovalRequest } from '@/lib/approval-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Service, ServiceStatus } from '@/lib/types';

interface ServiceFormState {
  title: string;
  description: string;
  category: string;
  icon: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  status: ServiceStatus;
  featured: boolean;
}

const emptyForm: ServiceFormState = {
  title: '',
  description: '',
  category: 'General',
  icon: 'wrench',
  imageUrl: '',
  buttonText: '',
  buttonLink: '',
  status: 'active',
  featured: false,
};

export default function AdminServices() {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const servicesQuery = query(collection(db, 'services'), orderBy('title'));
    const unsubscribe = onSnapshot(
      servicesQuery,
      (snapshot) => {
        setServices(snapshot.docs.map((document) => mapService(document.id, document.data())));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading services:', error);
        toast.error('Failed to load services');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const filteredServices = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search),
    );
  }, [searchQuery, services]);

  const resetImageState = () => {
    setImageFile(null);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData(emptyForm);
    resetImageState();
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      icon: service.icon,
      imageUrl: service.image ?? '',
      buttonText: service.buttonText ?? '',
      buttonLink: service.buttonLink ?? '',
      status: service.status,
      featured: service.featured,
    });
    resetImageState();
    setImagePreview(service.image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setSaving(false);
    resetImageState();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // For editors, upload immediately to Cloudinary
    if (!isAdmin) {
      setSaving(true);
      try {
        const imageUrl = await uploadToCloudinary(file);
        console.log('Cloudinary upload successful, URL:', imageUrl);
        
        setFormData((prev) => {
          const updated = { ...prev, imageUrl };
          console.log('Updated service formData in setFormData callback:', updated);
          return updated;
        });
        
        setImagePreview(imageUrl);
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setSaving(false);
      }
    } else {
      // For admins, just store the file for later upload
      setImageFile(file);
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(`Delete "${service.title}"?`)) return;

    // Editors create approval request, admins delete directly
    if (!isAdmin) {
      try {
        const result = await createApprovalRequest({
          type: 'service',
          action: 'delete',
          documentId: service.id,
          newData: {},
          oldData: service as unknown as Record<string, unknown>,
          requestedBy: {
            uid: user!.uid,
            name: user!.displayName || 'Editor',
            email: user!.email || '',
          },
        });

        if (result.success) {
          toast.success('Delete request submitted for approval');
        } else {
          toast.error(result.error || 'Failed to submit delete request');
        }
      } catch (error) {
        console.error('Error creating delete approval request:', error);
        toast.error('Failed to submit delete request');
      }
      return;
    }

    try {
      await deleteDoc(doc(db, 'services', service.id));
      toast.success('Service deleted');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const toggleStatus = async (service: Service) => {
    // Editors cannot toggle status directly
    if (!isAdmin) {
      toast.error('Only admins can toggle service status');
      return;
    }

    const nextStatus: ServiceStatus = service.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'services', service.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(nextStatus === 'active' ? 'Service activated' : 'Service deactivated');
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Failed to update status');
    }
  };

  const toggleFeatured = async (service: Service) => {
    // Editors cannot toggle featured directly
    if (!isAdmin) {
      toast.error('Only admins can toggle featured status');
      return;
    }

    try {
      await updateDoc(doc(db, 'services', service.id), {
        featured: !service.featured,
        updatedAt: serverTimestamp(),
      });
      toast.success(service.featured ? 'Service removed from featured' : 'Service added to featured');
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    // For editors, wait for image upload to complete before submitting
    if (!isAdmin && saving) {
      toast.error('Please wait for image upload to complete');
      return;
    }

    setSaving(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      icon: formData.icon,
      image: formData.imageUrl.trim() || null,
      buttonText: formData.buttonText.trim() || null,
      buttonLink: formData.buttonLink.trim() || null,
      status: formData.status,
      featured: formData.featured,
      updatedAt: serverTimestamp(),
    };

    console.log('Service payload before Firestore:', payload);

    try {
      // Editors create approval request, admins save directly
      if (!isAdmin) {
        const action = editingService ? 'update' : 'create';
        const result = await createApprovalRequest({
          type: 'service',
          action,
          documentId: editingService?.id || null,
          newData: payload as unknown as Record<string, unknown>,
          oldData: editingService ? (editingService as unknown as Record<string, unknown>) : {},
          requestedBy: {
            uid: user!.uid,
            name: user!.displayName || 'Editor',
            email: user!.email || '',
          },
        });

        if (result.success) {
          toast.success(`${action === 'create' ? 'Create' : 'Update'} request submitted for approval`);
          closeModal();
        } else {
          toast.error(result.error || 'Failed to submit request');
        }
        setSaving(false);
        return;
      }

      let imageUrl = formData.imageUrl.trim() || null;

      if (editingService) {
        if (imageFile) {
          imageUrl = await uploadServiceImage(imageFile, editingService.id);
        }

        await updateDoc(doc(db, 'services', editingService.id), {
          ...payload,
          image: imageUrl,
        });
        toast.success('Service updated');
      } else {
        const docRef = await addDoc(collection(db, 'services'), {
          ...payload,
          createdAt: serverTimestamp(),
        });

        if (imageFile) {
          imageUrl = await uploadServiceImage(imageFile, docRef.id);
          await updateDoc(docRef, { image: imageUrl, updatedAt: serverTimestamp() });
        }

        toast.success('Service added');
      }

      closeModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const selectedIcon = SERVICE_ICON_OPTIONS.find((option) => option.key === formData.icon);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Services</h1>
        <p className="mt-2 text-slate-300">
          Manage Firestore <code className="text-sm text-cyan-200">services</code> collection — changes sync to the website instantly.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 py-2 pl-10 pr-4"
          />
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="tech-btn-primary flex items-center justify-center gap-2 px-4 py-2"
        >
          <Plus className="h-5 w-5" />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="tech-glass-panel overflow-hidden rounded-lg p-4">
          <TableSkeleton rows={6} />
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services found"
          description="Create services here. Active services appear on the homepage and /services page in real time."
        />
      ) : (
        <div className="tech-glass-panel overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/90 text-sm text-slate-300">
                  <th className="px-4 py-3 font-semibold text-white">Service</th>
                  <th className="px-4 py-3 font-semibold text-white">Category</th>
                  <th className="px-4 py-3 font-semibold text-white">Icon</th>
                  <th className="px-4 py-3 font-semibold text-white">Status</th>
                  <th className="px-4 py-3 font-semibold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const Icon = SERVICE_ICON_OPTIONS.find((o) => o.key === service.icon)?.icon ?? Wrench;
                  return (
                    <tr key={service.id} className="border-b border-white/10 text-sm hover:bg-slate-900/80">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-900/80">
                            {service.image ? (
                              <Image src={service.image} alt="" fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
                                <Icon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{service.title}</p>
                            <p className="line-clamp-1 max-w-xs text-slate-400">{service.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{service.category}</td>
                      <td className="px-4 py-4 capitalize text-slate-400">{service.icon}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleStatus(service)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            service.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                          }`}
                        >
                          {service.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(service)}
                            className={`rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-2 transition hover:bg-slate-900 ${service.featured ? 'text-yellow-400' : 'text-slate-400'}`}
                            aria-label={service.featured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <Star className={`h-4 w-4 ${service.featured ? 'fill-yellow-400' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(service)}
                            className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-2 text-cyan-200 transition hover:bg-slate-900"
                            aria-label="Edit service"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(service)}
                            className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-2 text-rose-400 transition hover:bg-slate-900"
                            aria-label="Delete service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="tech-glass-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-500/10">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="text-xl font-bold text-white">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button type="button" onClick={closeModal} className="rounded-2xl p-2 text-cyan-200 hover:bg-slate-900" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Service title"
                  className="tech-input sm:col-span-2"
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="tech-input"
                >
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceStatus })}
                  className="tech-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short professional description"
                rows={4}
                className="tech-input w-full"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Button text (e.g. Get Started)"
                  className="tech-input"
                />
                <input
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="Button link (e.g. /contact or https://wa.me/...)"
                  className="tech-input"
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-300">Service icon</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {SERVICE_ICON_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = formData.icon === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: option.key })}
                        className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-xs transition ${
                          selected
                            ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-sm shadow-cyan-500/10'
                            : 'border-white/10 bg-slate-950/80 text-slate-200 hover:border-cyan-300 hover:bg-slate-900/80'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="line-clamp-1 text-center">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedIcon && (
                  <p className="mt-2 text-xs text-slate-400">Selected: {selectedIcon.label}</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-cyan-200">Service image (optional)</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-900/80 sm:h-28 sm:w-40">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized={imagePreview.startsWith('blob:')} />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-cyan-300" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-slate-900/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
                    >
                      <Upload className="h-4 w-4" />
                      Upload image
                    </button>
                    <input
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        if (!imageFile) setImagePreview(e.target.value.trim() || null);
                      }}
                      placeholder="Or paste image URL"
                      className="tech-input text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-cyan-500/30 bg-slate-700/30 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(event) => setFormData({ ...formData, featured: event.target.checked })}
                    className="h-5 w-5 rounded border-cyan-500/50 bg-slate-700 text-cyan-500 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-cyan-300">Featured Service</span>
                  <span className="text-xs text-gray-400">(Displays on home page)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 px-4 py-2 font-semibold text-white transition hover:bg-slate-900">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="tech-btn-primary px-4 py-2 disabled:opacity-50">
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded bg-gray-200/80" />
      ))}
    </div>
  );
}
