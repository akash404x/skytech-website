'use client';

import { useSession } from 'next-auth/react';
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  const stats = [
    {
      name: 'Total Revenue',
      value: '₹12,45,678',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
    },
    {
      name: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart,
    },
    {
      name: 'Total Products',
      value: '456',
      change: '+5.1%',
      changeType: 'increase',
      icon: Package,
    },
    {
      name: 'Total Users',
      value: '8,901',
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
    },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: '₹2,450', status: 'Delivered', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: '₹5,000', status: 'Shipped', date: '2024-01-14' },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: '₹1,200', status: 'Processing', date: '2024-01-13' },
    { id: 'ORD-004', customer: 'Sarah Wilson', amount: '₹8,000', status: 'Pending', date: '2024-01-12' },
    { id: 'ORD-005', customer: 'Tom Brown', amount: '₹3,500', status: 'Delivered', date: '2024-01-11' },
  ];

  const topProducts = [
    { name: 'Arduino Uno R3', sales: 234, revenue: '₹1,05,300' },
    { name: 'ESP32 Development Board', sales: 445, revenue: '₹1,55,750' },
    { name: 'Raspberry Pi 4 Model B', sales: 156, revenue: '₹5,46,000' },
    { name: 'HC-SR04 Ultrasonic Sensor', sales: 312, revenue: '₹26,520' },
    { name: 'IoT Project Development', sales: 89, revenue: '₹4,45,000' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {session?.user?.name}! Here's what's happening with your electronics & services platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div className={`mt-4 flex items-center text-sm ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="font-medium">{stat.change}</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Overview</h2>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Analytics chart would be displayed here</p>
            <p className="text-sm text-gray-500 mt-1">Integrate with Chart.js or Recharts for data visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
