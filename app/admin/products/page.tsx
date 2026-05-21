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
        <p className="mt-2 text-gray-600">Manage Firestore inventory in real time</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search products..."
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
          Add Product
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : filteredProducts.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Create products here to publish them to the storefront." />
      ) : (
        <div className="tech-glass-panel overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                          <ProductImage src={product.images[0]} alt={product.name} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="line-clamp-1 text-gray-500">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(product.discountPrice ?? product.price)}</p>
                      {product.discountPrice && product.discountPrice < product.price && (
                        <p className="text-xs text-gray-500 line-through">{formatCurrency(product.price)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openEditModal(product)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Edit product">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => handleDeleteProduct(product)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete product">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="tech-glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close modal">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Product name" className="rounded-lg border border-gray-300 px-4 py-3" />
                <select value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} className="rounded-lg border border-gray-300 px-4 py-3">
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input type="number" min="0" step="0.01" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} placeholder="Price" className="rounded-lg border border-gray-300 px-4 py-3" />
                <input type="number" min="0" step="0.01" value={formData.discountPrice} onChange={(event) => setFormData({ ...formData, discountPrice: event.target.value })} placeholder="Discount price" className="rounded-lg border border-gray-300 px-4 py-3" />
                <input type="number" min="0" step="1" value={formData.stock} onChange={(event) => setFormData({ ...formData, stock: event.target.value })} placeholder="Stock" className="rounded-lg border border-gray-300 px-4 py-3" />
                <input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(event) => setFormData({ ...formData, rating: event.target.value })} placeholder="Rating" className="rounded-lg border border-gray-300 px-4 py-3" />
                <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value as ProductStatus })} className="rounded-lg border border-gray-300 px-4 py-3">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <label className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" checked={formData.featured} onChange={(event) => setFormData({ ...formData, featured: event.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                  Featured product
                </label>
              </div>
              <textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Description" rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3" />
              <input value={formData.imageUrl} onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })} placeholder="Image URL" className="w-full rounded-lg border border-gray-300 px-4 py-3" />

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
