"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Loader2,
  MessageSquare,
  RefreshCcw,
  RotateCcw,
  Save,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type PrescriptionItem = {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  quantity: number;
  note?: string | null;
  isApproved: boolean;
};

type Prescription = {
  id: number;
  patientName: string;
  fileUrl: string;
  message?: string | null;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  approvedItems?: PrescriptionItem[];
  prescriptionItems?: PrescriptionItem[];
};

type UpdateForm = {
  patientName: string;
  message: string;
  file: File | null;
};

function getItems(prescription: Prescription): PrescriptionItem[] {
  return prescription.approvedItems ?? prescription.prescriptionItems ?? [];
}

function normalizeStatus(status: string) {
  return status.replace(/\s+/g, "").toLowerCase();
}

function canUpdatePrescription(status: string) {
  const normalized = normalizeStatus(status);

  return (
    normalized === "pending" ||
    normalized === "rejected" ||
    normalized === "needclarification"
  );
}

function getStatusStyle(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "approved") {
    return {
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Approved",
    };
  }

  if (normalized === "ordered" || normalized === "completed") {
    return {
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CheckCircle2,
      label: status,
    };
  }

  if (normalized === "rejected") {
    return {
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
      label: "Rejected",
    };
  }

  if (normalized === "needclarification") {
    return {
      className: "bg-orange-50 text-orange-700 border-orange-200",
      icon: HelpCircle,
      label: "Need Clarification",
    };
  }

  return {
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
    label: status || "Pending",
  };
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
      <span className="text-right text-sm font-bold text-gray-900">
        {value || "N/A"}
      </span>
    </div>
  );
}

function CardBox({
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
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function MyPrescriptionDetailsPage() {
  const params = useParams();
  const prescriptionId = Number(params.id);

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    patientName: "",
    message: "",
    file: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPrescription = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<Prescription>>(
        `/prescriptions/my-prescriptions/${prescriptionId}`
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        setPrescription(data);
        setUpdateForm({
          patientName: data.patientName ?? "",
          message: data.message ?? "",
          file: null,
        });
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

  const handleUpdatePrescription = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!prescription) return;

    if (!updateForm.patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }

    try {
      setIsUpdating(true);

      const formData = new FormData();
      formData.append("patientName", updateForm.patientName.trim());
      formData.append("message", updateForm.message.trim());

      if (updateForm.file) {
        formData.append("file", updateForm.file);
      }

      const response = await api.put<ApiResponse<Prescription>>(
        `/prescriptions/my-prescriptions/${prescription.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Prescription updated and sent for review again"
        );

        await getPrescription();
      } else {
        toast.error(response.data.message || "Failed to update prescription");
      }
    } catch (error: any) {
      console.error("Failed to update prescription:", error);

      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Failed to update prescription";

      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading prescription...
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/my-prescriptions"
          className="mb-6 inline-flex items-center text-sm font-bold text-blue-600"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Prescriptions
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <AlertCircle className="mr-2 inline h-5 w-5" />
          {errorMessage || "Prescription could not be loaded."}
        </div>
      </div>
    );
  }

  const items = getItems(prescription);
  const status = getStatusStyle(prescription.status);
  const StatusIcon = status.icon;
  const canUpdate = canUpdatePrescription(prescription.status);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/my-prescriptions"
            className="mb-3 inline-flex items-center text-sm font-bold text-blue-600"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Prescriptions
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900">
              RX{String(prescription.id).padStart(4, "0")}
            </h1>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Uploaded on {formatDate(prescription.createdAt)}
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

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <p className="mt-2 text-xl font-black text-blue-600">
            {prescription.status}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Patient</p>
          <p className="mt-2 text-xl font-black text-gray-900">
            {prescription.patientName}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Approved Items</p>
          <p className="mt-2 text-xl font-black text-gray-900">
            {items.length}
          </p>
        </div>
      </div>

      {canUpdate && (
        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <RotateCcw className="mt-0.5 h-5 w-5 text-blue-700" />
            <div>
              <h3 className="font-black text-blue-900">
                You can update this prescription
              </h3>
              <p className="mt-1 text-sm leading-6 text-blue-700">
                If the admin asked for clarification or rejected the
                prescription, update your message or upload a clearer file. After
                submitting, the status will go back to Pending for admin review.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardBox title="Prescription File" icon={FileText}>
            <a
              href={prescription.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Prescription File
            </a>
          </CardBox>

          <CardBox title="Your Message" icon={MessageSquare}>
            <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
              {prescription.message || "No message provided."}
            </p>
          </CardBox>

          <CardBox title="Admin Note" icon={MessageSquare}>
            <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
              {prescription.adminNote || "No admin note yet."}
            </p>
          </CardBox>

          {canUpdate && (
            <CardBox title="Update / Re-submit Prescription" icon={Upload}>
              <form onSubmit={handleUpdatePrescription} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Patient Name *
                  </label>
                  <input
                    value={updateForm.patientName}
                    onChange={(event) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        patientName: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Patient name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Message / Clarification
                  </label>
                  <textarea
                    value={updateForm.message}
                    onChange={(event) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        message: event.target.value,
                      }))
                    }
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write clarification or medicine request..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Replace Prescription File
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        file: event.target.files?.[0] ?? null,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Leave empty if you only want to update the message. Supported
                    files: JPG, PNG, WEBP, PDF.
                  </p>

                  {updateForm.file && (
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      Selected file: {updateForm.file.name}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Submit Update
                </Button>
              </form>
            </CardBox>
          )}

          <CardBox title="Approved Medicines" icon={FileText}>
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="font-bold text-gray-900">
                  No approved medicine item yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Link
                          href={
                            item.productSlug?.trim()
                              ? `/products/${item.productSlug}`
                              : "/shop"
                          }
                          className="font-black text-gray-900 hover:text-blue-600"
                        >
                          {item.productName}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">
                          {[item.strength, item.dosageForm]
                            .filter(Boolean)
                            .join(" ") || "No dosage info"}
                        </p>
                        {item.note && (
                          <p className="mt-2 text-sm text-gray-500">
                            Note: {item.note}
                          </p>
                        )}
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBox>
        </div>

        <div className="space-y-6">
          <CardBox title="Patient Information" icon={User}>
            <InfoLine label="Patient Name" value={prescription.patientName} />
            <InfoLine label="Status" value={prescription.status} />
            <InfoLine
              label="Created At"
              value={formatDate(prescription.createdAt)}
            />
            <InfoLine
              label="Reviewed At"
              value={
                prescription.reviewedAt
                  ? formatDate(prescription.reviewedAt)
                  : "Not reviewed yet"
              }
            />
          </CardBox>

          <CardBox title="Update Rules" icon={AlertCircle}>
            <div className="space-y-3 text-sm leading-6 text-gray-600">
              <p>
                You can update prescriptions only when the status is{" "}
                <span className="font-bold text-gray-900">Pending</span>,{" "}
                <span className="font-bold text-gray-900">Rejected</span>, or{" "}
                <span className="font-bold text-gray-900">
                  Need Clarification
                </span>
                .
              </p>
              <p>
                Approved, Ordered, Completed prescriptions cannot be updated.
              </p>
              <p>
                After update, the prescription will be sent back for admin
                review.
              </p>
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
}