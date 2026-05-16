'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, X, Upload, Star } from 'lucide-react';
import Toast from '@/components/Toast';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  features: string[];
  featured: boolean;
  images: string[];
  status: 'Active' | 'Inactive';
}

const CATEGORIES = ['IoT', 'Programming', 'Robotics', 'Electronics', 'SBC', 'Embedded', 'Education', 'Web', 'Consulting'];

const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    title: 'IoT Project Development',
    description: 'Complete IoT solutions from concept to deployment. We build smart devices, sensor networks, and connected systems.',
    price: 'Starting ₹5,000',
    category: 'IoT',
    features: ['Hardware Integration', 'Cloud Connectivity', 'Mobile App Development', 'Real-time Monitoring'],
    featured: true,
    images: ['📡'],
    status: 'Active'
  },
  {
    id: '2',
    title: 'Arduino Programming',
    description: 'Expert Arduino programming services for your projects. From simple automation to complex control systems.',
    price: 'Starting ₹2,000',
    category: 'Programming',
    features: ['Custom Code Development', 'Library Integration', 'Debugging & Optimization', 'Documentation'],
    featured: true,
    images: ['🔲'],
    status: 'Active'
  },
  {
    id: '3',
    title: 'Robotics Projects',
    description: 'Build custom robots for education, research, or industrial applications. We handle mechanical design, electronics, and programming.',
    price: 'Starting ₹10,000',
    category: 'Robotics',
    features: ['Custom Robot Design', 'Motor Control Systems', 'Sensor Integration', 'Path Planning'],
    featured: true,
    images: ['🤖'],
    status: 'Active'
  },
  {
    id: '4',
    title: 'PCB Designing',
    description: 'Professional PCB design services for your electronic projects. From schematic to manufacturing-ready files.',
    price: 'Starting ₹3,000',
    category: 'Electronics',
    features: ['Schematic Design', 'PCB Layout', 'Gerber Files', 'BOM Creation'],
    featured: false,
    images: ['🔌'],
    status: 'Active'
  },
  {
    id: '5',
    title: 'Smart Home Automation',
    description: 'Transform your home into a smart home with our automation solutions. Control lights, appliances, and security systems.',
    price: 'Starting ₹8,000',
    category: 'IoT',
    features: ['Lighting Control', 'Climate Control', 'Security Systems', 'Voice Integration'],
    featured: true,
    images: ['🏠'],
    status: 'Active'
  },
];

export default function AdminServices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'IoT',
    features: '',
    featured: false,
    status: 'Active' as 'Active' | 'Inactive',
    images: [] as string[],
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  // Load services from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('admin_services');
    if (stored) {
      setServices(JSON.parse(stored));
    } else {
      setServices(INITIAL_SERVICES);
      localStorage.setItem('admin_services', JSON.stringify(INITIAL_SERVICES));
    }
  }, []);

  // Save services to localStorage whenever they change
  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem('admin_services', JSON.stringify(services));
    }
  }, [services]);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'IoT',
      features: '',
      featured: false,
      status: 'Active',
      images: [],
    });
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price,
      category: service.category,
      features: service.features.join(', '),
      featured: service.featured,
      status: service.status,
      images: service.images,
    });
    setImagePreview(service.images[0] || '');
    setIsModalOpen(true);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id));
      setToast({ message: 'Service deleted successfully', type: 'success' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, images: [base64] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setToast({ message: 'Service title is required', type: 'error' });
      return;
    }
    if (!formData.description.trim()) {
      setToast({ message: 'Description is required', type: 'error' });
      return;
    }
    if (!formData.price.trim()) {
      setToast({ message: 'Price is required', type: 'error' });
      return;
    }

    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0);

    if (editingService) {
      // Update existing service
      setServices(services.map(s => 
        s.id === editingService.id 
          ? {
              ...s,
              title: formData.title,
              description: formData.description,
              price: formData.price,
              category: formData.category,
              features: featuresArray,
              featured: formData.featured,
              status: formData.status,
              images: formData.images.length > 0 ? formData.images : s.images,
            }
          : s
      ));
      setToast({ message: 'Service updated successfully', type: 'success' });
    } else {
      // Add new service
      const newService: Service = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        features: featuresArray,
        featured: formData.featured,
        status: formData.status,
        images: formData.images.length > 0 ? formData.images : ['🔧'],
      };
      setServices([...services, newService]);
      setToast({ message: 'Service added successfully', type: 'success' });
    }

    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="mt-2 text-gray-600">Manage your professional services</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAddService}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Service</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Price</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Featured</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                        {service.images[0] || '🔧'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.title}</p>
                        <p className="text-sm text-gray-500">ID: {service.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{service.category}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{service.price}</td>
                  <td className="py-4 px-6">
                    {service.featured ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                        Featured
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      service.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredServices.length} of {services.length} services
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Service Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter service description"
                  required
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Starting ₹5,000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Features (comma-separated)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="e.g., Hardware Integration, Cloud Connectivity, Mobile App Development"
                />
              </div>

              {/* Featured and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                    Featured Service
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Service Image
                </label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-500 focus:outline-none">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formData.images.length > 0 ? 'Change image' : 'Upload image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="h-32 w-32 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
