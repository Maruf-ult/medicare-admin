"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Check,
  Clock,
  Eye,
  Loader2,
  RefreshCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

type BackendPrescriptionStatus =
  | "Pending"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "NeedClarification"
  | "Quoted"
  | "Ordered"
  | "Completed";

type BackendPrescriptionItem = {
  id: number;
  productId: number;
  productName: string;
  dosageForm?: string | null;
  strength?: string | null;
  quantity: number;
  note?: string | null;
  isApproved: boolean;
};

type BackendPrescription = {
  id: number;
  patientName: string;
  fileUrl: string;
  message?: string | null;
  status: BackendPrescriptionStatus;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  userName?: string | null;
  customerName?: string | null;
  approvedItems?: BackendPrescriptionItem[];
  prescriptionItems?: BackendPrescriptionItem[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};

type PagedResponse<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type Prescription = {
  id: number;
  displayId: string;
  customer: string;
  patientName: string;
  uploadDate: string;
  fileUrl: string;
  message?: string | null;
  adminNote?: string | null;
  status: BackendPrescriptionStatus;
  medicines: string[];
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items;
}

function normalizePrescriptions(
  data: BackendPrescription[] | PagedResponse<BackendPrescription>
): Prescription[] {
  return extractItems(data).map((rx) => {
    const items = rx.approvedItems ?? rx.prescriptionItems ?? [];

    return {
      id: rx.id,
      displayId: `RX${String(rx.id).padStart(4, "0")}`,
      customer: rx.customerName ?? rx.userName ?? "Unknown Customer",
      patientName: rx.patientName,
      uploadDate: rx.createdAt,
      fileUrl: rx.fileUrl,
      message: rx.message,
      adminNote: rx.adminNote,
      status: rx.status,
      medicines:
        items.length > 0
          ? items.map((item) =>
              [item.productName, item.strength, item.dosageForm]
                .filter(Boolean)
                .join(" ")
            )
          : ["No approved medicines added yet"],
    };
  });
}

const statusColors: Record<BackendPrescriptionStatus, string> = {
  Pending: "bg-orange-100 text-orange-700",
  UnderReview: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  NeedClarification: "bg-yellow-100 text-yellow-700",
  Quoted: "bg-purple-100 text-purple-700",
  Ordered: "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
};

function StatusIcon({ status }: { status: BackendPrescriptionStatus }) {
  if (status === "Approved" || status === "Completed") {
    return <Check className="h-5 w-5 text-green-600" />;
  }

  if (status === "Rejected") {
    return <X className="h-5 w-5 text-red-600" />;
  }

  return <Clock className="h-5 w-5 text-orange-600" />;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingCount = prescriptions.filter(
    (p) => p.status === "Pending" || p.status === "UnderReview"
  ).length;

  const getPrescriptions = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<BackendPrescription[] | PagedResponse<BackendPrescription>>
      >("/prescriptions", {
        params: {
          pageNumber: 1,
          pageSize: 100,
        },
      });

      if (response.data.success && response.data.data) {
        setPrescriptions(normalizePrescriptions(response.data.data));
      } else {
        setPrescriptions([]);
        setErrorMessage(response.data.message || "Failed to load prescriptions.");
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      setPrescriptions([]);
      setErrorMessage("Failed to load prescriptions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPrescriptions();
  }, []);

  const handleReview = async (
    prescription: Prescription,
    status: "Approved" | "Rejected"
  ) => {
    try {
      setUpdatingId(prescription.id);

      const response = await api.put<ApiResponse<null>>(
        `/prescriptions/${prescription.id}/review`,
        {
          status,
          adminNote:
            adminNote.trim() ||
            (status === "Approved"
              ? "Prescription approved by admin."
              : "Prescription rejected by admin."),
          approvedItems: [],
        }
      );

      if (response.data.success) {
        setPrescriptions((prev) =>
          prev.map((item) =>
            item.id === prescription.id
              ? {
                  ...item,
                  status,
                  adminNote:
                    adminNote.trim() ||
                    (status === "Approved"
                      ? "Prescription approved by admin."
                      : "Prescription rejected by admin."),
                }
              : item
          )
        );

        toast.success(
          `${prescription.displayId} ${
            status === "Approved" ? "approved" : "rejected"
          } successfully`
        );

        setSelectedRx(null);
        setAdminNote("");
      } else {
        toast.error(response.data.message || "Failed to review prescription.");
      }
    } catch (error) {
      console.error("Failed to review prescription:", error);
      toast.error("Failed to review prescription.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading prescriptions...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
            <p className="mt-1 text-gray-600">
              Review and approve customer prescription uploads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-100 px-4 py-2">
              <p className="text-sm text-orange-700">
                {pendingCount} Pending
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={getPrescriptions}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {prescriptions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No prescriptions found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Customer uploaded prescriptions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <StatusIcon status={rx.status} />

                    <h3 className="font-semibold text-gray-900">
                      {rx.displayId} - {rx.customer}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusColors[rx.status]
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    Patient: {rx.patientName}
                  </p>

                  <p className="text-sm text-gray-600">
                    Uploaded: {formatDate(rx.uploadDate)}
                  </p>

                  {rx.adminNote && (
                    <p className="mt-1 text-sm text-gray-600">
                      Admin note: {rx.adminNote}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRx(rx);
                    setAdminNote(rx.adminNote ?? "");
                  }}
                  className="text-blue-600 hover:text-blue-700"
                  title="View prescription"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Medicines:
                </p>

                <div className="flex flex-wrap gap-2">
                  {rx.medicines.map((medicine, idx) => (
                    <span
                      key={`${rx.id}-${idx}`}
                      className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                    >
                      {medicine}
                    </span>
                  ))}
                </div>
              </div>

              {(rx.status === "Pending" || rx.status === "UnderReview") && (
                <div className="flex gap-2">
                  <Button
                    disabled={updatingId === rx.id}
                    onClick={() => handleReview(rx, "Approved")}
                    className="flex flex-1 items-center justify-center space-x-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    {updatingId === rx.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>Approve</span>
                  </Button>

                  <Button
                    disabled={updatingId === rx.id}
                    onClick={() => handleReview(rx, "Rejected")}
                    className="flex flex-1 items-center justify-center space-x-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    {updatingId === rx.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span>Reject</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRx.displayId}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedRx.customer} • {formatDate(selectedRx.uploadDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedRx(null);
                  setAdminNote("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">
                Customer Message
              </p>
              <p className="text-sm text-gray-600">
                {selectedRx.message || "No message provided."}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">
                Prescription File
              </p>

              <a
                href={selectedRx.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open Prescription
              </a>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin Note
              </label>

              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                rows={4}
                placeholder="Write approval/rejection note for customer..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {(selectedRx.status === "Pending" ||
              selectedRx.status === "UnderReview") && (
              <div className="flex gap-2">
                <Button
                  disabled={updatingId === selectedRx.id}
                  onClick={() => handleReview(selectedRx, "Approved")}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>

                <Button
                  disabled={updatingId === selectedRx.id}
                  onClick={() => handleReview(selectedRx, "Rejected")}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}