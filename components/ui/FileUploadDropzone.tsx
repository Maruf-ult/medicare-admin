"use client";

import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { File, Loader2, UploadCloud, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

type FileUploadDropzoneProps = {
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
  accept?: string; // File type filter (e.g., "image/*", ".pdf,.doc,.docx")
  maxSize?: number; // Max file size in MB
  maxFiles?: number; // Max number of files for multiple mode
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

export function FileUploadDropzone({
  value,
  onChange,
  folder = "general",
  label = "Upload Files",
  multiple = false,
  accept = "*",
  maxSize = 10,
  maxFiles = 10,
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const urls = React.useMemo(() => {
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

    // Check max files limit
    if (multiple && urls.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`${file.name} is larger than ${maxSize}MB`);
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
            ? `${uploadedUrls.length} file(s) uploaded successfully`
            : "File uploaded successfully"
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
    [multiple, folder, value]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      uploadFiles(multiple ? files : files.slice(0, 1));
    }
    event.target.value = "";
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <img src={getImageUrl(url)} alt="File" className="h-full w-full object-cover rounded" />;
    }
    return <File className="h-8 w-8 text-gray-400" />;
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown file';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {urls.length > 0 && (
        <div className="mb-4 space-y-2">
          {urls.map((url) => (
            <div
              key={url}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded">
                  {getFileIcon(url)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getFileName(url)}
                  </p>
                  <p className="text-xs text-gray-500">Uploaded file</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <div className="flex flex-col items-center justify-center px-4 pb-4 pt-3 text-center">
          {isUploading ? (
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />
          ) : (
            <UploadCloud
              className={`mb-3 h-8 w-8 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
            />
          )}

          <p className="mb-1 text-sm text-gray-500">
            <span className="font-semibold text-blue-600">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>

          <p className="text-xs text-gray-500">
            {accept === "*" ? "Any file type" : accept.replace(/\*/g, "files")}. Max {maxSize}MB each.
            {multiple && ` Up to ${maxFiles} files.`}
          </p>
        </div>

        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}