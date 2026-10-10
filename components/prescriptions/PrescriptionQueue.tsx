'use client';

import { useState } from 'react';
import { Check, X, FileText, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/lib/api';

export function PrescriptionQueue({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleReview = async (id: number, status: string, note: string) => {
    setProcessingId(id);
    try {
      await axios.put(`/prescriptions/${id}/review`, {
        status,
        adminNote: note,
        approvedItems: []
      });
      toast.success(`Prescription updated successfully.`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border-dashed border-2">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Empty Queue</h3>
          <p className="mt-1 text-xs text-gray-500">All prescription records are processed.</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
            <div>
              <p className="font-semibold text-gray-800">{item.patientName}</p>
              <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </a>
              <Button size="sm" className="bg-green-600 text-white" disabled={processingId === item.id} onClick={() => handleReview(item.id, 'Approved', 'Verified')}>
                {processingId === item.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="destructive" disabled={processingId === item.id} onClick={() => handleReview(item.id, 'Rejected', 'Invalid')}>
                {processingId === item.id ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}