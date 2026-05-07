'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50/30">
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.genericName}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{product.sku}</TableCell>
                <TableCell className="text-sm text-gray-600">-</TableCell>
                <TableCell className="text-sm font-medium text-gray-900">
                  ৳{product.price.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={product.stock < 5 ? "text-red-600 font-medium" : "text-gray-700"}>
                    {product.stock} units
                  </span>
                </TableCell>
                <TableCell className="space-x-1.5 whitespace-nowrap">
                  {product.requiresPrescription ? (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      Rx Required
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      OTC
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}