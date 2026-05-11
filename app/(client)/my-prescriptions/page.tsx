"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ApiResponse, PagedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Upload,
  XCircle,
} from "lucide-react";

type Prescription = {
  id: number;
  patientName: string;
  fileUrl: string;
  message?: string | null;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

function extractItems<T>(data: T[] | PagedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items ?? [];
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

export default function MyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPrescriptions = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<
        ApiResponse<Prescription[] | PagedResponse<Prescription>>
      >("/prescriptions/my-prescriptions");

      if (response.data.success && response.data.data) {
        setPrescriptions(extractItems(response.data.data));
      } else {
        setPrescriptions([]);
        setErrorMessage(response.data.message || "Failed to load prescriptions.");
      }
    } catch (error) {
      console.error("Failed to load prescriptions:", error);
      setPrescriptions([]);
      setErrorMessage("Failed to load prescriptions. Please login and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPrescriptions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading prescriptions...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            My Prescriptions
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Track, update, and re-submit your prescriptions when clarification is needed.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getPrescriptions}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Link href="/upload-prescription">
            <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {prescriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <FileText className="mx-auto mb-4 h-14 w-14 text-gray-300" />

          <h2 className="text-2xl font-black text-gray-900">
            No prescriptions uploaded
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload your prescription to get pharmacist review.
          </p>

          <Link href="/upload-prescription">
            <Button className="mt-6 bg-blue-600 text-white hover:bg-blue-700">
              Upload Prescription
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => {
            const status = getStatusStyle(prescription.status);
            const StatusIcon = status.icon;
            const canUpdate = canUpdatePrescription(prescription.status);

            return (
              <div
                key={prescription.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-gray-900">
                        RX{String(prescription.id).padStart(4, "0")}
                      </h3>

                      <span
                        className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      Patient:{" "}
                      <span className="font-semibold text-gray-700">
                        {prescription.patientName}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Uploaded: {formatDate(prescription.createdAt)}
                    </p>

                    {prescription.reviewedAt && (
                      <p className="mt-1 text-xs text-gray-400">
                        Reviewed: {formatDate(prescription.reviewedAt)}
                      </p>
                    )}

                    {prescription.adminNote && (
                      <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                        <p className="text-xs font-bold text-orange-800">
                          Admin Note
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-orange-700">
                          {prescription.adminNote}
                        </p>
                      </div>
                    )}

                    {canUpdate && (
                      <p className="mt-3 text-xs font-medium text-blue-600">
                        You can update or re-submit this prescription from the details page.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <a
                      href={prescription.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline">Open File</Button>
                    </a>

                    <Link href={`/my-prescriptions/${prescription.id}`}>
                      <Button variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </Link>

                    {canUpdate && (
                      <Link href={`/my-prescriptions/${prescription.id}`}>
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                          <RotateCcw className="h-4 w-4" />
                          Update
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}