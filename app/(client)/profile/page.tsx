"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ApiResponse } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Save, UserCircle } from "lucide-react";
import { toast } from "sonner";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  profileImageUrl?: string | null;
  createdAt?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileImageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getProfile = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await api.get<ApiResponse<UserProfile>>("/users/me");

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setProfile(data);
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          profileImageUrl: data.profileImageUrl ?? "",
        });
      } else {
        setErrorMessage(response.data.message || "Failed to load profile.");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setErrorMessage("Failed to load profile. Please login and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsSaving(true);

      const response = await api.put<ApiResponse<UserProfile>>("/users/me", {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        profileImageUrl: form.profileImageUrl.trim() || null,
      });

      if (response.data.success) {
        toast.success("Profile updated successfully");
        getProfile();
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your account information.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={saveProfile}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-blue-50 p-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white">
            {form.profileImageUrl ? (
              <img
                src={getImageUrl(form.profileImageUrl)}
                alt={form.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
            ) : (
              <UserCircle className="h-12 w-12 text-blue-600" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900">
              {profile?.name || "Customer"}
            </h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        <div className="grid gap-5">
          <Input
            label="Name *"
            value={form.name}
            onChange={(value) => updateField("name", value)}
          />

          <Input
            label="Email"
            value={profile?.email ?? ""}
            disabled
            onChange={() => {}}
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
          />

          <Input
            label="Profile Image URL"
            value={form.profileImageUrl}
            onChange={(value) => updateField("profileImageUrl", value)}
          />
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="mt-6 h-12 bg-blue-600 font-bold text-white hover:bg-blue-700"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}