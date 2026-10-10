"use client";

import { useState } from "react";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function UploadPrescriptionPage() {
  const [patientName, setPatientName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }

    if (!file) {
      toast.error("Please upload prescription file");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("patientName", patientName.trim());
      formData.append("message", message.trim());
      formData.append("file", file);

      const response = await api.post<ApiResponse<unknown>>(
        "/prescriptions/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Prescription uploaded successfully");
        setPatientName("");
        setMessage("");
        setFile(null);
      } else {
        toast.error(response.data.message || "Failed to upload prescription");
      }
    } catch (error) {
      console.error("Failed to upload prescription:", error);
      setErrorMessage("Failed to upload prescription. Please login and try again.");
      toast.error("Failed to upload prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          Upload Prescription
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload a clear image or PDF of your doctor&apos;s prescription.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-blue-50 p-5">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="font-black text-gray-900">Prescription Review</h2>
            <p className="text-sm text-gray-500">
              Our team will review your prescription and notify you.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Patient Name *
            </label>
            <input
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              placeholder="Enter patient name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Prescription File *
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
            />
            <p className="mt-2 text-xs text-gray-400">
              Supported: JPG, PNG, WEBP, PDF.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Message / Note
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Write any medicine request or note..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 w-full bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload Prescription
        </Button>
      </form>
    </div>
  );
}