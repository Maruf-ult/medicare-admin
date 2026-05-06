'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  productCount: number;
  status: 'active' | 'inactive';
}

const mockCategories: Category[] = [
  { id: 1, name: 'Antibiotics', productCount: 45, status: 'active' },
  { id: 2, name: 'Painkillers', productCount: 38, status: 'active' },
  { id: 3, name: 'Vitamins', productCount: 62, status: 'active' },
  { id: 4, name: 'Cold & Flu', productCount: 29, status: 'active' },
  { id: 5, name: 'Diabetes Care', productCount: 15, status: 'inactive' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);

  const handleAddCategory = () => {
    toast.info('Opening category creation form...');
  };

  const handleEditCategory = (categoryName: string) => {
    toast.info(`Editing ${categoryName}...`);
  };

  const handleDeleteCategory = (categoryName: string) => {
    setCategories(prev => prev.filter(c => c.name !== categoryName));
    toast.success(`Category "${categoryName}" deleted successfully`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                category.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {category.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{category.productCount} products</p>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleEditCategory(category.name)} className="flex-1 text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center justify-center space-x-1">
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button onClick={() => handleDeleteCategory(category.name)} className="flex-1 text-red-600 hover:text-red-700 font-medium text-sm flex items-center justify-center space-x-1">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
