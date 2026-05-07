"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Save,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

type PrescriptionStatus =
  | "Pending"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "NeedClarification"
  | "Quoted"
  | "Ordered"
  | "Completed";

type PrescriptionItem = {
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
  status: PrescriptionStatus;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;

  userName?: string | null;
  customerName?: string | null;
  userEmail?: string | null;
  customerEmail?: string | null;
  userPhone?: string | null;
  customerPhone?: string | null;

  approvedItems?: PrescriptionItem[];
  prescriptionItems?: PrescriptionItem[];
};

const statusOptions: PrescriptionStatus[] = [
  "Pending",
  "UnderReview",
  "Approved",
  "Rejected",
  "NeedClarification",
  "Quoted",
  "Ordered",
  "Completed",
];

const statusColors: Record<PrescriptionStatus, string> = {
  Pending: "bg-orange-100 text-orange-700",
  UnderReview: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  NeedClarification: "bg-yellow-100 text-yellow-700",
  Quoted: "bg-purple-100 text-purple-700",
  Ordered: "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
};

function getCustomerName(prescription: BackendPrescription) {
  return (
    prescription.customerName ??
    prescription.userName ??
    "Unknown Customer"
  );
}

function getCustomerEmail(prescription: BackendPrescription) {
  return prescription.customerEmail ?? prescription.userEmail ?? "N/A";
}

function getCustomerPhone(prescription: BackendPrescription) {
  return prescription.customerPhone ?? prescription.userPhone ?? "N/A";
}

function getItems(prescription: BackendPrescription): PrescriptionItem[] {
  return prescription.approvedItems ?? prescription.prescriptionItems ?? [];
}

function StatusIcon({ status }: { status: PrescriptionStatus }) {
  if (status === "Approved" || status === "Completed") {
    return <Check className="h-5 w-5 text-green-600" />;
  }

  if (status === "Rejected") {
    return <X className="h-5 w-5 text-red-600" />;
  }

  return <Clock className="h-5 w-5 text-orange-600" />;
}

function DetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="rounded-lg bg-blue-50 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      {children}
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">
        {value || "N/A"}
      </span>
    </div>
  );
}

export default function PrescriptionDetailsPage() {
  const params = useParams();
  const prescriptionId = Number(params.id);

  const [prescription, setPrescription] =
    useState<BackendPrescription | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<PrescriptionStatus>("Pending");
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPrescription = async () => {
    if (!prescriptionId || Number.isNaN(prescriptionId)) {
      setErrorMessage("Invalid prescription ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<BackendPrescription>>(
        `/prescriptions/${prescriptionId}`
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        setPrescription(data);
        setSelectedStatus(data.status);
        setAdminNote(data.adminNote ?? "");
      } else {
        setPrescription(null);
        setErrorMessage(response.data.message || "Prescription not found.");
      }
    } catch (error) {
      console.error("Failed to load prescription:", error);
      setPrescription(null);
      setErrorMessage("Failed to load prescription details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPrescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionId]);

  const handleReviewUpdate = async () => {
    if (!prescription) return;

    try {
      setIsUpdating(true);

      const response = await api.put<ApiResponse<null>>(
        `/prescriptions/${prescription.id}/review`,
        {
          status: selectedStatus,
          adminNote:
            adminNote.trim() ||
            `Prescription status updated to ${selectedStatus}.`,
          approvedItems: [],
        }
      );

      if (response.data.success) {
        setPrescription((prev) =>
          prev
            ? {
                ...prev,
                status: selectedStatus,
                adminNote:
                  adminNote.trim() ||
                  `Prescription status updated to ${selectedStatus}.`,
                reviewedAt: new Date().toISOString(),
              }
            : prev
        );

        toast.success(`Prescription updated to ${selectedStatus}`);
      } else {
        toast.error(
          response.data.message || "Failed to update prescription review."
        );
      }
    } catch (error) {
      console.error("Failed to update prescription:", error);
      toast.error("Failed to update prescription review.");
    } finally {
      setIsUpdating(false);
    }
  };

  const quickReview = async (status: "Approved" | "Rejected") => {
    setSelectedStatus(status);

    const defaultNote =
      status === "Approved"
        ? "Prescription approved by admin."
        : "Prescription rejected by admin.";

    try {
      if (!prescription) return;

      setIsUpdating(true);

      const response = await api.put<ApiResponse<null>>(
        `/prescriptions/${prescription.id}/review`,
        {
          status,
          adminNote: adminNote.trim() || defaultNote,
          approvedItems: [],
        }
      );

      if (response.data.success) {
        setPrescription((prev) =>
          prev
            ? {
                ...prev,
                status,
                adminNote: adminNote.trim() || defaultNote,
                reviewedAt: new Date().toISOString(),
              }
            : prev
        );

        setAdminNote(adminNote.trim() || defaultNote);
        toast.success(`Prescription ${status.toLowerCase()} successfully`);
      } else {
        toast.error(
          response.data.message || "Failed to update prescription review."
        );
      }
    } catch (error) {
      console.error("Failed to update prescription:", error);
      toast.error("Failed to update prescription review.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading prescription details...
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div>
        <Link
          href="/dashboard/prescriptions"
          className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Prescriptions
        </Link>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">
              {errorMessage || "Prescription could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayId = `RX${String(prescription.id).padStart(4, "0")}`;
  const items = getItems(prescription);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/prescriptions"
            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Prescriptions
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Prescription {displayId}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Uploaded on {formatDateTime(prescription.createdAt)}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={getPrescription}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <div className="mt-3 flex items-center gap-2">
            <StatusIcon status={prescription.status} />
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                statusColors[prescription.status]
              }`}
            >
              {prescription.status}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Patient</p>
          <p className="mt-3 text-xl font-bold text-gray-900">
            {prescription.patientName}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Customer</p>
          <p className="mt-3 text-xl font-bold text-gray-900">
            {getCustomerName(prescription)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Medicines</p>
          <p className="mt-3 text-xl font-bold text-blue-600">
            {items.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DetailCard title="Prescription File" icon={FileText}>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="mb-4 text-sm text-gray-600">
                Open the uploaded prescription file in a new tab for manual
                review.
              </p>

              <a
                href={prescription.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Prescription File
              </a>
            </div>
          </DetailCard>

          <DetailCard title="Customer Message" icon={MessageSquare}>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                {prescription.message || "No message provided."}
              </p>
            </div>
          </DetailCard>

          <DetailCard title="Requested / Approved Medicines" icon={FileText}>
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium text-gray-900">
                  No medicine items added
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Approved medicine item selection can be added later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link
                          href={`/dashboard/products/${item.productId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {item.productName}
                        </Link>

                        <p className="mt-1 text-sm text-gray-500">
                          {[item.strength, item.dosageForm]
                            .filter(Boolean)
                            .join(" ") || "No strength/dosage form"}
                        </p>

                        {item.note && (
                          <p className="mt-2 text-sm text-gray-600">
                            Note: {item.note}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Qty: {item.quantity}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.isApproved ? "Approved" : "Not Approved"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailCard>

          <DetailCard title="Review Prescription" icon={Check}>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as PrescriptionStatus)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Admin Note
                </label>

                <textarea
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  rows={5}
                  placeholder="Write approval, rejection, or clarification note..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => quickReview("Approved")}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Quick Approve
                </Button>

                <Button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => quickReview("Rejected")}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Quick Reject
                </Button>

                <Button
                  type="button"
                  disabled={
                    isUpdating &&
                    selectedStatus === prescription.status &&
                    adminNote === (prescription.adminNote ?? "")
                  }
                  onClick={handleReviewUpdate}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Review
                </Button>
              </div>
            </div>
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Customer Information" icon={User}>
            <InfoLine label="Name" value={getCustomerName(prescription)} />
            <InfoLine label="Email" value={getCustomerEmail(prescription)} />
            <InfoLine label="Phone" value={getCustomerPhone(prescription)} />
          </DetailCard>

          <DetailCard title="Patient Information" icon={User}>
            <InfoLine label="Patient Name" value={prescription.patientName} />
          </DetailCard>

          <DetailCard title="Review Information" icon={Clock}>
            <InfoLine label="Created At" value={formatDateTime(prescription.createdAt)} />
            <InfoLine
              label="Reviewed At"
              value={
                prescription.reviewedAt
                  ? formatDateTime(prescription.reviewedAt)
                  : "Not reviewed yet"
              }
            />
            <InfoLine label="Current Status" value={prescription.status} />
          </DetailCard>

          {prescription.adminNote && (
            <DetailCard title="Current Admin Note" icon={MessageSquare}>
              <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                {prescription.adminNote}
              </p>
            </DetailCard>
          )}
        </div>
      </div>
    </div>
  );
}