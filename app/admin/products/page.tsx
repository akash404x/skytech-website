'use client';

import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Edit, Package, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import ProductImage from '@/components/ProductImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/lib/firebase';
import { mapProduct } from '@/lib/firestore-mappers';
import { formatCurrency } from '@/lib/format';
import type { Product, ProductStatus } from '@/lib/types';

const CATEGORIES = [
  'Arduino Boards',
  'Sensors',
  'Robotics',
  'Raspberry Pi',
  'Displays',
  'Motors & Drivers',
  'DIY Kits',
  'IoT Modules',
  'Smart Home',
  'Power Supplies',
  'Cables & Connectors',
  'Components',
];

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  stock: string;
  rating: string;
  status: ProductStatus;
  featured: boolean;
  imageUrl: string;
}

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: 'Arduino Boards',
  stock: '',
  rating: '4.5',
  status: 'active',
  featured: false,
  imageUrl: '',
};

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((document) => mapProduct(document.id, document.data())));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search),
    );
  }, [products, searchQuery]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() ?? '',
      category: product.category,
      stock: product.stock.toString(),
      rating: product.rating.toString(),
      status: product.status,
      featured: product.featured,
      imageUrl: product.images[0] ?? '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSaving(false);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      await deleteDoc(doc(db, 'products', product.id));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const price = Number(formData.price);
    const discountPrice = formData.discountPrice ? Number(formData.discountPrice) : null;
    const stock = Number(formData.stock);
    const rating = Number(formData.rating);

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Enter a valid price');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      discountPrice,
      category: formData.category,
      stock,
      rating: Number.isFinite(rating) ? rating : 4.5,
      status: formData.status,
      featured: formData.featured,
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), payload);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('Product added');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="tech-heading-gradient text-3xl font-bold">Products</h1>
        <p className="mt-2 text-slate-300">Manage Firestore inventory in real time</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyan-300" />
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="tech-input w-full rounded-3xl border border-cyan-500/20 bg-slate-900/80 pl-10 pr-4 text-white"
          />
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : filteredProducts.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Create products here to publish them to the storefront." />
      ) : (
        <div className="tech-glass-panel overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/90 text-sm text-slate-300">
                  <th className="px-6 py-4 font-semibold text-white">Product</th>
                  <th className="px-6 py-4 font-semibold text-white">Category</th>
                  <th className="px-6 py-4 font-semibold text-white">Price</th>
                  <th className="px-6 py-4 font-semibold text-white">Stock</th>
                  <th className="px-6 py-4 font-semibold text-white">Status</th>
                  <th className="px-6 py-4 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-white/10 text-sm hover:bg-slate-900/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-900/70">
                          <ProductImage src={product.images[0]} alt={product.name} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="line-clamp-1 text-slate-400">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{product.category}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{formatCurrency(product.discountPrice ?? product.price)}</p>
                      {product.discountPrice && product.discountPrice < product.price && (
                        <p className="text-xs text-slate-500 line-through">{formatCurrency(product.price)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.status === 'active' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-slate-700/80 text-slate-200'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openEditModal(product)} className="rounded-2xl p-2 text-cyan-300 hover:bg-slate-900/70" aria-label="Edit product">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => handleDeleteProduct(product)} className="rounded-2xl p-2 text-rose-400 hover:bg-slate-900/70" aria-label="Delete product">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="tech-glass-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-8 py-6">
              <h2 className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-400 transition hover:bg-slate-700 hover:text-white" aria-label="Close modal">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-3">Product Name</label>
                <input
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:ring-offset-0"
                />
              </div>

              {/* Category and Status Row */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Category</label>
                  <select
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category} className="bg-slate-900 text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Product Status</label>
                  <select
                    value={formData.status}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value as ProductStatus })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    <option value="active" className="bg-slate-900 text-white">
                      Active
                    </option>
                    <option value="inactive" className="bg-slate-900 text-white">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Original Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 pl-8 pr-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={(event) => setFormData({ ...formData, discountPrice: event.target.value })}
                      placeholder="0.00 (optional)"
                      className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 pl-8 pr-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </div>
                </div>
              </div>

              {/* Stock and Rating */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                    placeholder="Enter stock quantity"
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Product Rating</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(event) => setFormData({ ...formData, rating: event.target.value })}
                      placeholder="0.0 - 5.0"
                      className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">/ 5.0</span>
                  </div>
                </div>
              </div>

              {/* Featured Product Checkbox */}
              <div className="rounded-lg border border-cyan-500/30 bg-slate-700/30 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(event) => setFormData({ ...formData, featured: event.target.checked })}
                    className="h-5 w-5 rounded border-cyan-500/50 bg-slate-700 text-cyan-500 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-cyan-300">Featured Product</span>
                  <span className="text-xs text-gray-400">(Displays on home page)</span>
                </label>
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-3">Product Description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Enter detailed product description"
                  rows={6}
                  className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 resize-none"
                />
              </div>

              {/* Product Image URL */}
              <div>
                <label className="block text-sm font-semibold text-cyan-300 mb-3">Product Image URL</label>
                <input
                  value={formData.imageUrl}
                  onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-cyan-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-gray-400 transition focus:border-cyan-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
                <p className="mt-2 text-xs text-gray-400">💡 Paste image URL or Firebase storage link</p>
              </div>

              {/* Form Actions */}
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
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
