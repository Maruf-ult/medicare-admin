"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";

type ImageUploadDropzoneProps = {
  /**
   * Single mode: string
   * Multiple mode: string[]
   */
  value?: string | string[] | null;

  /**
   * Single mode returns string
   * Multiple mode returns string[]
   */
  onChange: (value: string | string[]) => void;

  folder?: string;
  label?: string;
  multiple?: boolean;
};

type UploadResponse = {
  success: boolean;
  message?: string;
  url?: string;
  data?: {
    url?: string;
    imageUrl?: string;
    fileUrl?: string;
  };
};

export function ImageUploadDropzone({
  value,
  onChange,
  folder = "general",
  label = "Upload Image",
  multiple = false,
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const urls = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value.filter(Boolean) : [];
    }

    return typeof value === "string" && value.trim() ? [value] : [];
  }, [value, multiple]);

  const getUploadedUrl = (response: UploadResponse) => {
    return (
      response.url ??
      response.data?.url ??
      response.data?.imageUrl ??
      response.data?.fileUrl ??
      ""
    );
  };

  const addUrls = (newUrls: string[]) => {
    const cleanUrls = newUrls.filter(Boolean);

    if (cleanUrls.length === 0) return;

    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const merged = [...current, ...cleanUrls];

      const uniqueUrls = Array.from(new Set(merged));

      onChange(uniqueUrls);
      return;
    }

    onChange(cleanUrls[0]);
  };

  const removeUrl = (url: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      onChange(current.filter((item) => item !== url));
      return;
    }

    onChange("");
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsUploading(true);

      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await api.post<UploadResponse>(
          "/media/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          const uploadedUrl = getUploadedUrl(response.data);

          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl);
          }
        } else {
          toast.error(response.data.message || `Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        addUrls(uploadedUrls);

        toast.success(
          multiple
            ? `${uploadedUrls.length} image(s) uploaded successfully`
            : "Image uploaded successfully"
        );
      }
    } catch (error: any) {
      console.error("Upload error:", error);

      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "An error occurred while uploading.";

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const files = Array.from(event.dataTransfer.files);

      if (files.length > 0) {
        uploadFiles(multiple ? files : files.slice(0, 1));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [multiple, folder, value]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      uploadFiles(multiple ? files : files.slice(0, 1));
    }

    event.target.value = "";
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {urls.length > 0 && (
        <div
          className={`mb-4 grid gap-4 ${
            multiple
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {urls.map((url) => (
            <div
              key={url}
              className={`group relative flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${
                multiple ? "h-32" : "h-48"
              }`}
            >
              <img
                src={getImageUrl(url)}
                alt="Uploaded preview"
                className="h-full w-full object-contain p-2"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X className={multiple ? "h-4 w-4" : "h-5 w-5"} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <div className="flex flex-col items-center justify-center px-4 pb-6 pt-5 text-center">
          {isUploading ? (
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-500" />
          ) : (
            <UploadCloud
              className={`mb-4 h-10 w-10 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
            />
          )}

          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold text-blue-600">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>

          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG, WEBP or GIF. Max 5MB each.
          </p>

          {multiple && (
            <p className="mt-1 text-xs font-medium text-blue-600">
              Multiple images supported
            </p>
          )}
        </div>

        <input
          type="file"
          className="hidden"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}

export function MultiImageGallery({
  value,
  onChange,
  folder = "products",
  label = "Product Images",
}: {
  value?: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
}) {
  return (
    <ImageUploadDropzone
      multiple
      value={value ?? []}
      onChange={(urls) => onChange(Array.isArray(urls) ? urls : [urls])}
      folder={folder}
      label={label}
    />
  );
}