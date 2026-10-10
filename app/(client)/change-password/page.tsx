"use client";

import { useState } from "react";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, KeyRound, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    if (!form.currentPassword) {
      toast.error("Current password is required");
      return false;
    }

    if (!form.newPassword) {
      toast.error("New password is required");
      return false;
    }

    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return false;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return false;
    }

    return true;
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await api.put<ApiResponse<unknown>>(
        "/users/me/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }
      );

      if (response.data.success) {
        toast.success("Password changed successfully");
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      setErrorMessage("Failed to change password. Please try again.");
      toast.error("Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Change Password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Update your account password securely.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={changePassword}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-blue-50 p-5">
          <KeyRound className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="font-black text-gray-900">Password Security</h2>
            <p className="text-sm text-gray-500">
              Use a strong password to protect your account.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <PasswordInput
            label="Current Password *"
            value={form.currentPassword}
            onChange={(value) => updateField("currentPassword", value)}
          />

          <PasswordInput
            label="New Password *"
            value={form.newPassword}
            onChange={(value) => updateField("newPassword", value)}
          />

          <PasswordInput
            label="Confirm New Password *"
            value={form.confirmPassword}
            onChange={(value) => updateField("confirmPassword", value)}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 bg-blue-600 font-bold text-white hover:bg-blue-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Update Password
        </Button>
      </form>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}