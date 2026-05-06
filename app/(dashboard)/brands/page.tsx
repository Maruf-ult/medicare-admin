'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Brand {
  id: number;
  name: string;
  productCount: number;
  country: string;
}

const mockBrands = [
  { id: 1, name: 'Square', productCount: 124, country: 'Bangladesh' },
  { id: 2, name: 'Beximco', productCount: 98, country: 'Bangladesh' },
  { id: 3, name: 'Renata', productCount: 87, country: 'Bangladesh' },
  { id: 4, name: 'ACI', productCount: 76, country: 'Bangladesh' },
  { id: 5, name: 'Eskayef', productCount: 65, country: 'Bangladesh' },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState(mockBrands);

  const handleAddBrand = () => {
    toast.info('Opening brand creation form...');
  };

  const handleEditBrand = (brandName: string) => {
    toast.info(`Editing ${brandName}...`);
  };

  const handleDeleteBrand = (brandName: string) => {
    setBrands(prev => prev.filter(b => b.name !== brandName));
    toast.success(`Brand "${brandName}" deleted successfully`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-1">Manage pharmaceutical brands</p>
        </div>
        <Button onClick={handleAddBrand} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Brand Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Country</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Products</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{brand.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{brand.country}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{brand.productCount}</td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <button onClick={() => handleEditBrand(brand.name)} className="text-orange-600 hover:text-orange-700"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteBrand(brand.name)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
