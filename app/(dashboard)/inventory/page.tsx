'use client';

import { AlertCircle, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface InventoryItem {
  id: number;
  product: string;
  batch: string;
  quantity: number;
  expiryDate: string;
  status: 'good' | 'low' | 'expired';
}

const mockInventory: InventoryItem[] = [
  { id: 1, product: 'Amoxicillin 500mg', batch: 'BAT001', quantity: 45, expiryDate: '2025-12-31', status: 'good' },
  { id: 2, product: 'Paracetamol 500mg', batch: 'BAT002', quantity: 120, expiryDate: '2025-10-15', status: 'good' },
  { id: 3, product: 'Metformin 500mg', batch: 'BAT003', quantity: 12, expiryDate: '2025-08-20', status: 'low' },
  { id: 4, product: 'Ibuprofen 400mg', batch: 'BAT004', quantity: 0, expiryDate: '2024-12-31', status: 'expired' },
  { id: 5, product: 'Vitamin D3', batch: 'BAT005', quantity: 8, expiryDate: '2025-06-30', status: 'low' },
];

export default function InventoryPage() {
  const [inventory] = useState(mockInventory);
  const lowStockItems = inventory.filter(i => i.status === 'low').length;
  const expiredItems = inventory.filter(i => i.status === 'expired').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track stock levels and expiry dates</p>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start space-x-4">
          <div className="p-3 bg-yellow-100 rounded-lg"><TrendingDown className="w-6 h-6 text-yellow-600" /></div>
          <div>
            <h3 className="font-semibold text-yellow-900">{lowStockItems} Low Stock Items</h3>
            <p className="text-sm text-yellow-700 mt-1">Products running low on stock</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-4">
          <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="w-6 h-6 text-red-600" /></div>
          <div>
            <h3 className="font-semibold text-red-900">{expiredItems} Expired Items</h3>
            <p className="text-sm text-red-700 mt-1">Products past expiry date</p>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Batch</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.product}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.batch}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{item.quantity} units</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.expiryDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'good' ? 'bg-green-100 text-green-700' :
                    item.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'good' ? '✓ Good' : item.status === 'low' ? '⚠ Low Stock' : '✕ Expired'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
