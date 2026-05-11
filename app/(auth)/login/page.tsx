"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import { authUtils } from "@/lib/auth";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type AuthMode = "login" | "register";

const initialLoginForm: LoginRequest = {
  email: "",
  password: "",
};

const initialRegisterForm: RegisterRequest = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState<LoginRequest>(initialLoginForm);
  const [registerForm, setRegisterForm] =
    useState<RegisterRequest>(initialRegisterForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterAuth = (user: AuthResponse) => {
    if (user.role === "Admin") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  const updateLoginField = (key: keyof LoginRequest, value: string) => {
    setLoginForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateRegisterField = (key: keyof RegisterRequest, value: string) => {
    setRegisterForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateLogin = () => {
    if (!loginForm.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!loginForm.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (loginForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const validateRegister = () => {
    if (!registerForm.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!registerForm.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!registerForm.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!registerForm.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    if (registerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Password and confirm password do not match");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      setIsLoading(true);

      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        {
          email: loginForm.email.trim(),
          password: loginForm.password,
        }
      );

      if (!response.data.success || !response.data.data) {
        toast.error(response.data.message || "Login failed");
        return;
      }

      const user = response.data.data;

      authUtils.setAuth(user);
      toast.success(`Welcome back, ${user.name}!`);
      redirectAfterAuth(user);
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Login failed. Please try again.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;

    try {
      setIsLoading(true);

      const response = await api.post<ApiResponse<AuthResponse | null>>(
        "/auth/register",
        {
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone.trim(),
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword,
        }
      );

      if (!response.data.success) {
        toast.error(response.data.message || "Registration failed");
        return;
      }

      toast.success("Account created successfully");

      if (response.data.data?.token) {
        authUtils.setAuth(response.data.data);
        redirectAfterAuth(response.data.data);
        return;
      }

      setLoginForm({
        email: registerForm.email,
        password: "",
      });

      setRegisterForm(initialRegisterForm);
      setMode("login");
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Registration failed. Please try again.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
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
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            MediCare<span className="text-blue-600">+</span>
          </h1>

          <p className="mt-1 text-sm text-gray-500">Online Pharmacy</p>
        </div>

        <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="mb-4 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                  mode === "register"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            <CardTitle className="text-xl font-bold text-gray-900">
              {mode === "login"
                ? "Sign in to your account"
                : "Create your account"}
            </CardTitle>

            <CardDescription className="text-gray-500">
              {mode === "login"
                ? "Enter your email and password to continue"
                : "Register to order medicines and upload prescriptions"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      disabled={isLoading}
                      value={registerForm.name}
                      onChange={(event) =>
                        updateRegisterField("name", event.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      disabled={isLoading}
                      value={registerForm.phone}
                      onChange={(event) =>
                        updateRegisterField("phone", event.target.value)
                      }
                      className="h-11"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  value={mode === "login" ? loginForm.email : registerForm.email}
                  onChange={(event) => {
                    if (mode === "login") {
                      updateLoginField("email", event.target.value);
                    } else {
                      updateRegisterField("email", event.target.value);
                    }
                  }}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
               <div className="flex items-center justify-between">
  <Label htmlFor="password">Password</Label>

  {mode === "login" && (
    <Link
      href="/forgot-password"
      className="text-xs font-bold text-blue-600 hover:underline"
    >
      Forgot password?
    </Link>
  )}
</div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    disabled={isLoading}
                    value={
                      mode === "login"
                        ? loginForm.password
                        : registerForm.password
                    }
                    onChange={(event) => {
                      if (mode === "login") {
                        updateLoginField("password", event.target.value);
                      } else {
                        updateRegisterField("password", event.target.value);
                      }
                    }}
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

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      value={registerForm.confirmPassword}
                      onChange={(event) =>
                        updateRegisterField(
                          "confirmPassword",
                          event.target.value
                        )
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
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : mode === "login" ? (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Create Account
                    <UserPlus className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
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