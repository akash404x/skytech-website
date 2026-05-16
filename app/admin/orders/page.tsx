'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, X, Package, MapPin, Calendar, CreditCard, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import Toast from '@/components/Toast';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  timeline: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    amount: 2499,
    status: 'Delivered',
    date: '2024-01-15',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    shippingAddress: {
      street: '123 Electronics Street',
      city: 'Bangalore',
      state: 'Karnataka',
      zip: '560001',
      country: 'India'
    },
    items: [
      { id: '1', name: 'Arduino Uno R3', quantity: 2, price: 450, image: '🔲' },
      { id: '2', name: 'ESP32 Development Board', quantity: 1, price: 350, image: '📡' },
      { id: '3', name: 'HC-SR04 Ultrasonic Sensor', quantity: 3, price: 85, image: '📏' },
    ],
    timeline: [
      { status: 'Order Placed', date: '2024-01-15 10:30', description: 'Order successfully placed' },
      { status: 'Processing', date: '2024-01-15 14:00', description: 'Order confirmed and processing started' },
      { status: 'Shipped', date: '2024-01-16 09:00', description: 'Order shipped via courier' },
      { status: 'Delivered', date: '2024-01-18 16:30', description: 'Order successfully delivered' },
    ]
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 98765 43211',
    amount: 3500,
    status: 'Shipped',
    date: '2024-01-14',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    shippingAddress: {
      street: '456 Tech Park Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400001',
      country: 'India'
    },
    items: [
      { id: '1', name: 'Raspberry Pi 4 Model B', quantity: 1, price: 3500, image: '🍓' },
    ],
    timeline: [
      { status: 'Order Placed', date: '2024-01-14 11:00', description: 'Order successfully placed' },
      { status: 'Processing', date: '2024-01-14 15:00', description: 'Order confirmed and processing started' },
      { status: 'Shipped', date: '2024-01-15 10:00', description: 'Order shipped via courier' },
    ]
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+91 98765 43212',
    amount: 1250,
    status: 'Processing',
    date: '2024-01-13',
    paymentMethod: 'Net Banking',
    paymentStatus: 'Paid',
    shippingAddress: {
      street: '789 Innovation Lane',
      city: 'Delhi',
      state: 'Delhi',
      zip: '110001',
      country: 'India'
    },
    items: [
      { id: '1', name: 'SG90 Servo Motor', quantity: 5, price: 120, image: '⚙️' },
      { id: '2', name: 'L298N Motor Driver', quantity: 2, price: 150, image: '🔋' },
      { id: '3', name: '16x2 LCD Display', quantity: 2, price: 180, image: '🖥️' },
    ],
    timeline: [
      { status: 'Order Placed', date: '2024-01-13 09:00', description: 'Order successfully placed' },
      { status: 'Processing', date: '2024-01-13 13:00', description: 'Order confirmed and processing started' },
    ]
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+91 98765 43213',
    amount: 599,
    status: 'Pending',
    date: '2024-01-12',
    paymentMethod: 'UPI',
    paymentStatus: 'Pending',
    shippingAddress: {
      street: '321 Circuit Avenue',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zip: '600001',
      country: 'India'
    },
    items: [
      { id: '1', name: 'DHT11 Temperature Sensor', quantity: 3, price: 65, image: '🌡️' },
      { id: '2', name: 'IR Sensor Module', quantity: 4, price: 55, image: '📡' },
    ],
    timeline: [
      { status: 'Order Placed', date: '2024-01-12 16:00', description: 'Order successfully placed' },
    ]
  },
  {
    id: 'ORD-005',
    customer: 'Tom Brown',
    email: 'tom@example.com',
    phone: '+91 98765 43214',
    amount: 1849,
    status: 'Delivered',
    date: '2024-01-11',
    paymentMethod: 'Debit Card',
    paymentStatus: 'Paid',
    shippingAddress: {
      street: '654 Hardware Street',
      city: 'Hyderabad',
      state: 'Telangana',
      zip: '500001',
      country: 'India'
    },
    items: [
      { id: '1', name: 'Arduino Mega 2560', quantity: 1, price: 850, image: '🔲' },
      { id: '2', name: 'Relay Module 5V', quantity: 3, price: 180, image: '🔌' },
      { id: '3', name: 'OLED Display 0.96"', quantity: 2, price: 220, image: '🖥️' },
    ],
    timeline: [
      { status: 'Order Placed', date: '2024-01-11 10:00', description: 'Order successfully placed' },
      { status: 'Processing', date: '2024-01-11 14:00', description: 'Order confirmed and processing started' },
      { status: 'Shipped', date: '2024-01-12 09:00', description: 'Order shipped via courier' },
      { status: 'Delivered', date: '2024-01-14 15:00', description: 'Order successfully delivered' },
    ]
  },
];

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load orders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('admin_orders');
    if (stored) {
      setOrders(JSON.parse(stored));
    } else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('admin_orders', JSON.stringify(INITIAL_ORDERS));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('admin_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Pending': return 'bg-gray-100 text-gray-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-4 w-4" />;
      case 'Shipped': return <Truck className="h-4 w-4" />;
      case 'Processing': return <Clock className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = (newStatus: Order['status']) => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map(order =>
      order.id === selectedOrder.id
        ? {
            ...order,
            status: newStatus,
            timeline: [
              ...order.timeline,
              {
                status: newStatus,
                date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                description: `Order status updated to ${newStatus}`
              }
            ]
          }
        : order
    );

    setOrders(updatedOrders);
    setSelectedOrder(updatedOrders.find(o => o.id === selectedOrder.id) || null);
    setToast({ message: `Order status updated to ${newStatus}`, type: 'success' });
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map(order =>
      order.id === selectedOrder.id
        ? {
            ...order,
            status: 'Cancelled',
            timeline: [
              ...order.timeline,
              {
                status: 'Cancelled',
                date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                description: 'Order cancelled by admin'
              }
            ]
          }
        : order
    );

    setOrders(updatedOrders);
    setSelectedOrder(updatedOrders.find(o => o.id === selectedOrder.id) || null);
    setToast({ message: 'Order cancelled successfully', type: 'success' });
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
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-gray-600">Manage customer orders and shipments</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Order ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Items</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.items.length} items</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">₹{order.amount.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.date}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
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

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.id}</h2>
                <p className="text-sm text-gray-500 mt-1">Placed on {selectedOrder.date}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900"><span className="font-medium text-gray-900">Name:</span> {selectedOrder.customer}</p>
                    <p className="text-gray-900"><span className="font-medium text-gray-900">Email:</span> {selectedOrder.email}</p>
                    <p className="text-gray-900"><span className="font-medium text-gray-900">Phone:</span> {selectedOrder.phone}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Shipping Address
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-gray-900">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p className="text-gray-900">{selectedOrder.shippingAddress.zip}, {selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{item.image}</div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-900">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{selectedOrder.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900"><span className="font-medium text-gray-900">Method:</span> {selectedOrder.paymentMethod}</p>
                    <p className="text-gray-900"><span className="font-medium text-gray-900">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                        selectedOrder.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Current Status
                  </h3>
                  <div className="space-y-3">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                      disabled={selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Delivered'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                      <button
                        onClick={handleCancelOrder}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Timeline</h3>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === selectedOrder.timeline.length - 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.status}</p>
                        <p className="text-sm text-gray-900">{event.description}</p>
                        <p className="text-xs text-gray-900 mt-1">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
