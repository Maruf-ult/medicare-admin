import StatCard from '@/components/admin/StatCard';
import { ShoppingCart, Package, Pill, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value="1,245"
          change="12% from last month"
          changeType="increase"
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Products"
          value="584"
          change="8 added this week"
          changeType="increase"
          icon={Package}
        />
        <StatCard
          title="Pending Prescriptions"
          value="23"
          change="5 need review"
          changeType="decrease"
          icon={Pill}
        />
        <StatCard
          title="Total Users"
          value="3,421"
          change="156 new this week"
          changeType="increase"
          icon={Users}
        />
      </div>

      {/* Revenue & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Revenue This Month</span>
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>📊 Revenue chart will go here (Chart.js / Recharts)</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">This Month Revenue</p>
              <p className="text-2xl font-bold text-green-600">৳450,320</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Orders Completed</p>
              <p className="text-2xl font-bold text-blue-600">287</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-orange-600">৳1,565</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>Alerts & Warnings</span>
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
              <p className="font-semibold text-red-900 text-sm">Low Stock Alert</p>
              <p className="text-xs text-red-700 mt-1">Amoxicillin 500mg stock is below 50 units</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
              <p className="font-semibold text-yellow-900 text-sm">Expiry Warning</p>
              <p className="text-xs text-yellow-700 mt-1">5 medicine batches expiring within 30 days</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600">
              <p className="font-semibold text-orange-900 text-sm">Pending Prescriptions</p>
              <p className="text-xs text-orange-700 mt-1">23 prescriptions waiting for review</p>
              <Link href="/dashboard/prescriptions">
                <Button variant="outline" size="sm" className="mt-2 text-xs">
                  Review Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h2>
          <div className="space-y-3">
            {[
              { id: '#MED2024001', customer: 'Ahmed Hassan', amount: '৳1,250', status: 'Processing' },
              { id: '#MED2024002', customer: 'Fatima Khan', amount: '৳890', status: 'Shipped' },
              { id: '#MED2024003', customer: 'Saiful Islam', amount: '৳2,100', status: 'Delivered' },
              { id: '#MED2024004', customer: 'Maria Ahmed', amount: '৳650', status: 'Pending' },
            ].map((order, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{order.id}</p>
                  <p className="text-xs text-gray-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.amount}</p>
                  <p
                    className={`text-xs font-medium ${
                      order.status === 'Delivered'
                        ? 'text-green-600'
                        : order.status === 'Shipped'
                          ? 'text-blue-600'
                          : order.status === 'Processing'
                            ? 'text-orange-600'
                            : 'text-gray-600'
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/orders">
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
