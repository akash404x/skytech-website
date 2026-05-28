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
import { Briefcase, Edit, ImagePlus, Plus, Search, Star, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { uploadWorkImage } from '@/lib/firebase-storage';
import { mapWork } from '@/lib/firestore-mappers';
import { WORK_CATEGORIES } from '@/lib/works-content';
import type { Work, WorkStatus } from '@/lib/types';

interface WorkFormState {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  technologiesUsed: string;
  thumbnail: string;
  images: string;
  githubLink: string;
  liveDemoLink: string;
  clientName: string;
  completionDate: string;
  status: WorkStatus;
  featured: boolean;
}

const emptyForm: WorkFormState = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  category: 'Arduino Projects',
  technologiesUsed: '',
  thumbnail: '',
  images: '',
  githubLink: '',
  liveDemoLink: '',
  clientName: '',
  completionDate: '',
  status: 'active',
  featured: false,
};

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
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

export default function AdminWorks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState<WorkFormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const worksQuery = query(collection(db, 'works'), orderBy('title'));
    const unsubscribe = onSnapshot(
      worksQuery,
      (snapshot) => {
        setWorks(snapshot.docs.map((document) => mapWork(document.id, document.data())));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading works:', error);
        toast.error('Failed to load works');
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

  const filteredWorks = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return works.filter(
      (work) =>
        work.title.toLowerCase().includes(search) ||
        work.category.toLowerCase().includes(search) ||
        work.shortDescription.toLowerCase().includes(search),
    );
  }, [searchQuery, works]);

  const resetImageState = () => {
    setImageFile(null);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddModal = () => {
    setEditingWork(null);
    setFormData(emptyForm);
    resetImageState();
    setIsModalOpen(true);
  };

  const openEditModal = (work: Work) => {
    setEditingWork(work);
    setFormData({
      title: work.title,
      shortDescription: work.shortDescription,
      fullDescription: work.fullDescription,
      category: work.category,
      technologiesUsed: work.technologiesUsed.join(', '),
      thumbnail: work.thumbnail ?? '',
      images: work.images.join(', '),
      githubLink: work.githubLink ?? '',
      liveDemoLink: work.liveDemoLink ?? '',
      clientName: work.clientName ?? '',
      completionDate: work.completionDate ? new Date(work.completionDate).toISOString().split('T')[0] : '',
      status: work.status,
      featured: work.featured,
    });
    resetImageState();
    setImagePreview(work.thumbnail);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWork(null);
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

  const handleDeleteWork = async (work: Work) => {
    if (!window.confirm(`Delete "${work.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'works', work.id));
      toast.success('Work deleted');
    } catch (error) {
      console.error('Error deleting work:', error);
      toast.error('Failed to delete work');
    }
  };

  const toggleStatus = async (work: Work) => {
    const nextStatus: WorkStatus = work.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'works', work.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(nextStatus === 'active' ? 'Work activated' : 'Work deactivated');
    } catch (error) {
      console.error('Error toggling work status:', error);
      toast.error('Failed to update status');
    }
  };

  const toggleFeatured = async (work: Work) => {
    try {
      await updateDoc(doc(db, 'works', work.id), {
        featured: !work.featured,
        updatedAt: serverTimestamp(),
      });
      toast.success(work.featured ? 'Work removed from featured' : 'Work added to featured');
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.shortDescription.trim()) {
      toast.error('Title and short description are required');
      return;
    }

    setSaving(true);

    try {
      let thumbnail = formData.thumbnail.trim() || null;
      const images = formData.images
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      if (editingWork) {
        if (imageFile) {
          thumbnail = await uploadWorkImage(imageFile, editingWork.id);
        }

        await updateDoc(doc(db, 'works', editingWork.id), {
          title: formData.title.trim(),
          shortDescription: formData.shortDescription.trim(),
          fullDescription: formData.fullDescription.trim(),
          category: formData.category,
          technologiesUsed: formData.technologiesUsed.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
          images,
          thumbnail,
          githubLink: formData.githubLink.trim() || null,
          liveDemoLink: formData.liveDemoLink.trim() || null,
          clientName: formData.clientName.trim() || null,
          completionDate: formData.completionDate ? new Date(formData.completionDate) : null,
          status: formData.status,
          featured: formData.featured,
          updatedAt: serverTimestamp(),
        });
        toast.success('Work updated');
      } else {
        const docRef = await addDoc(collection(db, 'works'), {
          title: formData.title.trim(),
          shortDescription: formData.shortDescription.trim(),
          fullDescription: formData.fullDescription.trim(),
          category: formData.category,
          technologiesUsed: formData.technologiesUsed.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
          images,
          thumbnail,
          githubLink: formData.githubLink.trim() || null,
          liveDemoLink: formData.liveDemoLink.trim() || null,
          clientName: formData.clientName.trim() || null,
          completionDate: formData.completionDate ? new Date(formData.completionDate) : null,
          status: formData.status,
          featured: formData.featured,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (imageFile) {
          thumbnail = await uploadWorkImage(imageFile, docRef.id);
          await updateDoc(docRef, { thumbnail, updatedAt: serverTimestamp() });
        }

        toast.success('Work added');
      }

      closeModal();
    } catch (error) {
      console.error('Error saving work:', error);
      toast.error('Failed to save work');
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Works</h1>
        <p className="mt-2 text-slate-300">
          Manage Firestore <code className="text-sm text-cyan-200">works</code> collection — changes sync to the website instantly.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search works..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 py-2 pl-10 pr-4 text-white"
          />
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="tech-btn-primary flex items-center justify-center gap-2 px-4 py-2"
        >
          <Plus className="h-5 w-5" />
          Add Work
        </button>
      </div>

      {loading ? (
        <div className="tech-glass-panel overflow-hidden rounded-lg p-4">
          <TableSkeleton rows={6} />
        </div>
      ) : filteredWorks.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No works found"
          description="Create works here. Active works appear on the homepage and /works page in real time."
        />
      ) : (
        <div className="tech-glass-panel overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-cyan-500/20 bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200">Work</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-cyan-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {filteredWorks.map((work) => (
                  <tr key={work.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {work.thumbnail ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-cyan-500/20">
                            <Image src={work.thumbnail} alt={work.title} fill className="object-cover" sizes="48px" />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-slate-800">
                            <Briefcase className="h-6 w-6 text-cyan-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{work.title}</div>
                          <div className="text-sm text-slate-400">{work.shortDescription}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">{work.category}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(work)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          work.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                            : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {work.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(work)}
                          className={`rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-2 transition hover:bg-slate-900 ${
                            work.featured ? 'text-yellow-400' : 'text-slate-400'
                          }`}
                          aria-label={work.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star className={`h-4 w-4 ${work.featured ? 'fill-yellow-400' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(work)}
                          className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-2 text-cyan-200 transition hover:bg-slate-900"
                          aria-label="Edit work"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWork(work)}
                          className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-2 text-rose-400 transition hover:bg-slate-900"
                          aria-label="Delete work"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="tech-glass-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{editingWork ? 'Edit Work' : 'Add New Work'}</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyan-200">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                  placeholder="Project title"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyan-200">Short Description *</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(event) => setFormData({ ...formData, shortDescription: event.target.value })}
                  className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                  placeholder="Brief description (1-2 sentences)"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyan-200">Full Description</label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(event) => setFormData({ ...formData, fullDescription: event.target.value })}
                  className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white resize-y"
                  rows={4}
                  placeholder="Detailed project description"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyan-200">Category</label>
                <select
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                  className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                >
                  {WORK_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyan-200">Technologies Used</label>
                <input
                  type="text"
                  value={formData.technologiesUsed}
                  onChange={(event) => setFormData({ ...formData, technologiesUsed: event.target.value })}
                  className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                  placeholder="React, Node.js, Arduino, etc. (comma-separated)"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyan-200">Thumbnail</label>
                <div className="flex gap-4">
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-cyan-500/20 bg-slate-800">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="128px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                        <ImagePlus className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
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
                      className="tech-btn-secondary flex items-center gap-2 px-4 py-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </button>
                    <p className="mt-1 text-xs text-slate-400">Max 5MB. Recommended: 800x600px.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-cyan-200">Additional Images</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(event) => setFormData({ ...formData, images: event.target.value })}
                  className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                  placeholder="Image URLs (comma-separated)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cyan-200">GitHub Link</label>
                  <input
                    type="url"
                    value={formData.githubLink}
                    onChange={(event) => setFormData({ ...formData, githubLink: event.target.value })}
                    className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cyan-200">Live Demo Link</label>
                  <input
                    type="url"
                    value={formData.liveDemoLink}
                    onChange={(event) => setFormData({ ...formData, liveDemoLink: event.target.value })}
                    className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cyan-200">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(event) => setFormData({ ...formData, clientName: event.target.value })}
                    className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                    placeholder="Client or organization name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cyan-200">Completion Date</label>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={(event) => setFormData({ ...formData, completionDate: event.target.value })}
                    className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cyan-200">Status</label>
                  <select
                    value={formData.status}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value as WorkStatus })}
                    className="tech-input w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-2.5 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="rounded-lg border border-cyan-500/30 bg-slate-700/30 p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(event) => setFormData({ ...formData, featured: event.target.checked })}
                      className="h-5 w-5 rounded border-cyan-500/50 bg-slate-700 text-cyan-500 accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-cyan-300">Featured Work</span>
                    <span className="text-xs text-gray-400">(Displays on home page)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="tech-btn-secondary px-6 py-2.5"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tech-btn-primary px-6 py-2.5"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingWork ? 'Update Work' : 'Add Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
