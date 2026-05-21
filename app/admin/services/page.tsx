'use client';

import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Edit, Plus, Search, Trash2, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import ServiceCard from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapService } from '@/lib/firestore-mappers';
import { SERVICE_ICON_OPTIONS } from '@/lib/service-icons';
import type { Service, ServiceStatus } from '@/lib/types';

const SERVICE_CATEGORIES = ['IoT', 'Programming', 'Robotics', 'Electronics', 'SBC', 'Embedded', 'Education', 'Web', 'Consulting'];

interface ServiceFormState {
  title: string;
  description: string;
  category: string;
  priceLabel: string;
  features: string;
  iconKey: string;
  featured: boolean;
  status: ServiceStatus;
}

const emptyForm: ServiceFormState = {
  title: '',
  description: '',
  category: 'Consulting',
  priceLabel: '',
  features: '',
  iconKey: 'wrench',
  featured: false,
  status: 'active',
};

export default function AdminServices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const filteredServices = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search),
    );
  }, [searchQuery, services]);

  const openAddModal = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      priceLabel: service.priceLabel,
      features: service.features.join('\n'),
      iconKey: service.iconKey,
      featured: service.featured,
      status: service.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setSaving(false);
  };

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(`Delete ${service.title}?`)) return;

    try {
      await deleteDoc(doc(db, 'services', service.id));
      toast.success('Service deleted');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.priceLabel.trim()) {
      toast.error('Title, description, and price label are required');
      return;
    }

    setSaving(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priceLabel: formData.priceLabel.trim(),
      features: formData.features
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean),
      iconKey: formData.iconKey,
      featured: formData.featured,
      status: formData.status,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), payload);
        toast.success('Service updated');
      } else {
        await addDoc(collection(db, 'services'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('Service added');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="mt-2 text-gray-600">Manage professional services from Firestore</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState icon={Wrench} title="No services found" description="Create services here and active ones will publish to the services page." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <div key={service.id} className="relative">
              <ServiceCard service={service} />
              <div className="absolute right-4 top-4 flex gap-2">
                <button type="button" onClick={() => openEditModal(service)} className="rounded-lg bg-white p-2 text-blue-600 shadow hover:bg-blue-50" aria-label="Edit service">
                  <Edit className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDeleteService(service)} className="rounded-lg bg-white p-2 text-red-600 shadow hover:bg-red-50" aria-label="Delete service">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close modal">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} placeholder="Service title" className="rounded-lg border border-gray-300 px-4 py-3" />
                <input value={formData.priceLabel} onChange={(event) => setFormData({ ...formData, priceLabel: event.target.value })} placeholder="Price label" className="rounded-lg border border-gray-300 px-4 py-3" />
                <select value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} className="rounded-lg border border-gray-300 px-4 py-3">
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select value={formData.iconKey} onChange={(event) => setFormData({ ...formData, iconKey: event.target.value })} className="rounded-lg border border-gray-300 px-4 py-3">
                  {SERVICE_ICON_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value as ServiceStatus })} className="rounded-lg border border-gray-300 px-4 py-3">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <label className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" checked={formData.featured} onChange={(event) => setFormData({ ...formData, featured: event.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                  Featured service
                </label>
              </div>
              <textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Description" rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3" />
              <textarea value={formData.features} onChange={(event) => setFormData({ ...formData, features: event.target.value })} placeholder="Features, one per line" rows={5} className="w-full rounded-lg border border-gray-300 px-4 py-3" />

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
