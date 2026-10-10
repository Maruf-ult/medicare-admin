"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import {
  ApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "@/types";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const validateOtp = () => {
    if (!otp.trim()) {
      toast.error("OTP is required");
      return false;
    }

    if (otp.trim().length !== 6) {
      toast.error("OTP must be 6 digits");
      return false;
    }

    return true;
  };

  const validatePassword = () => {
    if (!newPassword) {
      toast.error("New password is required");
      return false;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password and confirm password do not match");
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    try {
      setIsLoading(true);

      const payload: ForgotPasswordRequest = {
        email: email.trim(),
      };

      const response = await api.post<ApiResponse<unknown>>(
        "/auth/forgot-password",
        payload
      );

      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email");
        setStep("otp");
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Failed to send OTP. Please try again.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateEmail()) return;
    if (!validateOtp()) return;

    try {
      setIsLoading(true);

      const payload: VerifyOtpRequest = {
        email: email.trim(),
        otp: otp.trim(),
      };

      const response = await api.post<ApiResponse<unknown>>(
        "/auth/verify-otp",
        payload
      );

      if (response.data.success) {
        toast.success(response.data.message || "OTP verified successfully");
        setStep("reset");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "OTP verification failed.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    if (!validateOtp()) return;
    if (!validatePassword()) return;

    try {
      setIsLoading(true);

      const payload: ResetPasswordRequest = {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      };

      const response = await api.post<ApiResponse<unknown>>(
        "/auth/reset-password",
        payload
      );

      if (response.data.success) {
        toast.success(response.data.message || "Password reset successfully");
        setStep("success");
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Password reset failed.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === "email") {
      await handleSendOtp();
      return;
    }

    if (step === "otp") {
      await handleVerifyOtp();
      return;
    }

    if (step === "reset") {
      await handleResetPassword();
    }
  };

  const getTitle = () => {
    if (step === "email") return "Forgot Password";
    if (step === "otp") return "Verify OTP";
    if (step === "reset") return "Reset Password";
    return "Password Changed";
  };

  const getDescription = () => {
    if (step === "email") {
      return "Enter your email address and we will send you a 6-digit OTP.";
    }

    if (step === "otp") {
      return "Enter the 6-digit OTP sent to your email address.";
    }

    if (step === "reset") {
      return "Create a new password for your MediCare+ account.";
    }

    return "Your password has been changed successfully. You can now login.";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100 opacity-50 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            {step === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-white" />
            ) : step === "reset" ? (
              <KeyRound className="h-8 w-8 text-white" />
            ) : step === "otp" ? (
              <ShieldCheck className="h-8 w-8 text-white" />
            ) : (
              <Mail className="h-8 w-8 text-white" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            MediCare<span className="text-blue-600">+</span>
          </h1>

          <p className="mt-1 text-sm text-gray-500">Password Recovery</p>
        </div>

        <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              {getTitle()}
            </CardTitle>

            <CardDescription className="text-gray-500">
              {getDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "success" ? (
              <div>
                <div className="rounded-xl bg-green-50 p-5 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
                  <h2 className="font-bold text-green-900">
                    Password reset completed
                  </h2>
                  <p className="mt-1 text-sm text-green-700">
                    Please login using your new password.
                  </p>
                </div>

                <Link href="/login">
                  <Button className="mt-6 h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-700">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(step === "email" || step === "otp" || step === "reset") && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>

                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      disabled={isLoading || step !== "email"}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11"
                    />

                    {step !== "email" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setStep("email")}
                        className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
                      >
                        Change email
                      </button>
                    )}
                  </div>
                )}

                {(step === "otp" || step === "reset") && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">6-digit OTP</Label>

                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={otp}
                      disabled={isLoading || step === "reset"}
                      onChange={(event) =>
                        setOtp(event.target.value.replace(/\D/g, ""))
                      }
                      className="h-11 tracking-[0.4em]"
                    />

                    {step === "otp" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleSendOtp}
                        className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                )}

                {step === "reset" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New password</Label>

                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          disabled={isLoading}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          className="h-11 pr-10"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm new password
                      </Label>

                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          disabled={isLoading}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          className="h-11 pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : step === "email" ? (
                    "Send OTP"
                  ) : step === "otp" ? (
                    "Verify OTP"
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400">
          MediCare+ · Secure & Private
        </p>
      </div>
    </div>
  );
}