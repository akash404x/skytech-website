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
import { Edit, ImagePlus, Plus, Search, Trash2, Upload, Wrench, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { uploadServiceImage } from '@/lib/firebase-storage';
import { mapService } from '@/lib/firestore-mappers';
import { SERVICE_CATEGORIES } from '@/lib/services-content';
import { SERVICE_ICON_OPTIONS } from '@/lib/service-icons';
import type { Service, ServiceStatus } from '@/lib/types';

interface ServiceFormState {
  title: string;
  description: string;
  category: string;
  icon: string;
  imageUrl: string;
  status: ServiceStatus;
}

const emptyForm: ServiceFormState = {
  title: '',
  description: '',
  category: 'General',
  icon: 'wrench',
  imageUrl: '',
  status: 'active',
};

export default function AdminServices() {
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
      status: service.status,
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setImageFile(file);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(`Delete "${service.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'services', service.id));
      toast.success('Service deleted');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const toggleStatus = async (service: Service) => {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = formData.imageUrl.trim() || null;

      if (editingService) {
        if (imageFile) {
          imageUrl = await uploadServiceImage(imageFile, editingService.id);
        }

        await updateDoc(doc(db, 'services', editingService.id), {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          icon: formData.icon,
          image: imageUrl,
          status: formData.status,
          updatedAt: serverTimestamp(),
        });
        toast.success('Service updated');
      } else {
        const docRef = await addDoc(collection(db, 'services'), {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          icon: formData.icon,
          image: imageUrl,
          status: formData.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
      setSaving(false);
    }
  };

  const selectedIcon = SERVICE_ICON_OPTIONS.find((option) => option.key === formData.icon);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Services</h1>
        <p className="mt-2 text-gray-600">
          Manage Firestore <code className="text-sm">services</code> collection — changes sync to the website instantly.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full py-2 pl-10 pr-4"
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
                <tr className="border-b border-gray-200 bg-gray-50/80 text-sm text-gray-600">
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Icon</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const Icon = SERVICE_ICON_OPTIONS.find((o) => o.key === service.icon)?.icon ?? Wrench;
                  return (
                    <tr key={service.id} className="border-b border-gray-100 text-sm hover:bg-gray-50/60">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {service.image ? (
                              <Image src={service.image} alt="" fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
                                <Icon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{service.title}</p>
                            <p className="line-clamp-1 max-w-xs text-gray-500">{service.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{service.category}</td>
                      <td className="px-4 py-4 capitalize text-gray-600">{service.icon}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleStatus(service)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            service.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {service.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(service)}
                            className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                            aria-label="Edit service"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(service)}
                            className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="tech-glass-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
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

              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">Service icon</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {SERVICE_ICON_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = formData.icon === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: option.key })}
                        className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="line-clamp-1 text-center">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedIcon && (
                  <p className="mt-2 text-xs text-gray-500">Selected: {selectedIcon.label}</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Service image (optional)</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 sm:h-28 sm:w-40">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized={imagePreview.startsWith('blob:')} />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-gray-400" />
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
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
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
