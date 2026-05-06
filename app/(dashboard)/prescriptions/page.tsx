"use client";

import { Button } from "@/components/ui/button";
import { Check, Clock, Eye, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Prescription {
  id: string;
  customer: string;
  uploadDate: string;
  medicines: string[];
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
}

const mockPrescriptions: Prescription[] = [
  {
    id: "RX001",
    customer: "Ahmed Hassan",
    uploadDate: "2024-05-06",
    medicines: ["Amoxicillin 500mg", "Metformin 500mg"],
    status: "pending",
  },
  {
    id: "RX002",
    customer: "Fatima Khan",
    uploadDate: "2024-05-05",
    medicines: ["Ciprofloxacin 500mg"],
    status: "pending",
  },
  {
    id: "RX003",
    customer: "Saiful Islam",
    uploadDate: "2024-05-04",
    medicines: ["Aspirin 500mg", "Vitamin D3"],
    status: "approved",
    reviewedBy: "Dr. Admin",
  },
  {
    id: "RX004",
    customer: "Maria Ahmed",
    uploadDate: "2024-05-03",
    medicines: ["Ibuprofen 400mg"],
    status: "rejected",
  },
];

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleApprove = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "approved", reviewedBy: "Admin User" }
          : p,
      ),
    );
    toast.success(`Prescription ${id} approved successfully`);
    setShowModal(false);
  };

  const handleReject = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)),
    );
    toast.error(`Prescription ${id} rejected`);
    setShowModal(false);
  };

  const pendingCount = prescriptions.filter(
    (p) => p.status === "pending",
  ).length;

  const statusIcons = {
    pending: <Clock className="w-5 h-5 text-orange-600" />,
    approved: <Check className="w-5 h-5 text-green-600" />,
    rejected: <X className="w-5 h-5 text-red-600" />,
  };

  const statusColors = {
    pending: "bg-orange-100 text-orange-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-600 mt-1">
              Review and approve customer prescriptions
            </p>
          </div>
          <div className="bg-orange-100 px-4 py-2 rounded-lg">
            <p className="text-sm text-orange-700">{pendingCount} Pending</p>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <div
            key={rx.id}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {statusIcons[rx.status]}
                  <h3 className="font-semibold text-gray-900">
                    {rx.id} - {rx.customer}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[rx.status]}`}
                  >
                    {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Uploaded: {rx.uploadDate}
                </p>
                {rx.reviewedBy && (
                  <p className="text-sm text-gray-600">
                    Reviewed by: {rx.reviewedBy}
                  </p>
                )}
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                <Eye className="w-5 h-5" />
              </button>
            </div>

            {/* Medicines List */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Medicines:
              </p>
              <div className="flex flex-wrap gap-2">
                {rx.medicines.map((medicine, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {medicine}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            {rx.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(rx.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </Button>
                <Button
                  onClick={() => handleReject(rx.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
