"use client";

import { useState } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[];
};

type MfsPaymentDetails = {
  id?: number;
  orderId: number;
  orderNumber?: string | null;
  paymentMethod?: string | null;
  provider?: string | null;
  transactionId: string;
  senderPhoneNumber: string;
  amount?: number | null;
  paymentStatus?: string | null;
  orderStatus?: string | null;
  isVerified?: boolean;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
};

function getPaymentMethod(payment: MfsPaymentDetails) {
  return payment.paymentMethod ?? payment.provider ?? "MFS";
}

function getStatusClass(status?: string | null) {
  const normalized = status?.toLowerCase();

  if (normalized === "paid") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (normalized === "submitted") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (normalized === "failed" || normalized === "refunded") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-yellow-200 bg-yellow-50 text-yellow-700";
}

export default function AdminPaymentsPage() {
  const [transactionId, setTransactionId] = useState("");
  const [payment, setPayment] = useState<MfsPaymentDetails | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPaymentDetails = async () => {
    const trxId = transactionId.trim();

    if (!trxId) {
      toast.error("Transaction ID is required");
      return;
    }

    try {
      setIsSearching(true);
      setErrorMessage(null);
      setPayment(null);

      const response = await api.get<ApiResponse<MfsPaymentDetails>>(
        `/payments/mfs/details/${encodeURIComponent(trxId)}`
      );

      if (response.data.success && response.data.data) {
        setPayment(response.data.data);
      } else {
        setErrorMessage(response.data.message || "Payment details not found.");
      }
    } catch (error: any) {
      console.error("Failed to load payment details:", error);

      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Failed to load payment details.";

      setErrorMessage(message);
    } finally {
      setIsSearching(false);
    }
  };

  const verifyPayment = async () => {
    if (!payment?.transactionId) {
      toast.error("Transaction ID not found");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to verify transaction "${payment.transactionId}"?`
    );

    if (!confirmed) return;

    try {
      setIsVerifying(true);

      const response = await api.put<ApiResponse<unknown>>(
        `/payments/mfs/verify/${encodeURIComponent(payment.transactionId)}`
      );

      if (response.data.success) {
        toast.success("Payment verified successfully");

        setPayment((prev) =>
          prev
            ? {
                ...prev,
                paymentStatus: "Paid",
                orderStatus:
                  prev.orderStatus === "Pending"
                    ? "Confirmed"
                    : prev.orderStatus,
                isVerified: true,
                verifiedAt: new Date().toISOString(),
              }
            : prev
        );

        await getPaymentDetails();
      } else {
        toast.error(response.data.message || "Failed to verify payment");
      }
    } catch (error: any) {
      console.error("Failed to verify payment:", error);

      const message =
        error.response?.data?.message ??
        error.response?.data?.errors?.[0] ??
        "Failed to verify payment.";

      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const canVerify =
    payment &&
    payment.transactionId &&
    payment.paymentStatus?.toLowerCase() !== "paid";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">MFS Payments</h1>
        <p className="mt-1 text-gray-600">
          Search and verify bKash, Nagad, and Upay manual payment transactions.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-black text-gray-900">
          Search Transaction
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  getPaymentDetails();
                }
              }}
              placeholder="Enter Transaction ID, e.g. TRX987654321"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            type="button"
            disabled={isSearching}
            onClick={getPaymentDetails}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isSearching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {!payment ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <CreditCard className="mx-auto mb-4 h-14 w-14 text-gray-300" />
          <h2 className="text-xl font-black text-gray-900">
            No payment selected
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter a transaction ID above to view and verify payment details.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Smartphone className="h-7 w-7" />
                  </div>

                  <h2 className="text-2xl font-black text-gray-900">
                    {getPaymentMethod(payment)} Payment
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Transaction ID:{" "}
                    <span className="font-bold text-gray-900">
                      {payment.transactionId}
                    </span>
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold ${getStatusClass(
                    payment.paymentStatus
                  )}`}
                >
                  {payment.paymentStatus?.toLowerCase() === "paid" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  {payment.paymentStatus || "Pending"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBox label="Order ID" value={payment.orderId} />
                <InfoBox
                  label="Order Number"
                  value={payment.orderNumber || `#MED${payment.orderId}`}
                />
                <InfoBox label="Payment Method" value={getPaymentMethod(payment)} />
                <InfoBox
                  label="Amount"
                  value={
                    payment.amount !== null && payment.amount !== undefined
                      ? formatCurrency(payment.amount)
                      : "N/A"
                  }
                />
                <InfoBox
                  label="Sender Phone"
                  value={payment.senderPhoneNumber}
                />
                <InfoBox
                  label="Transaction ID"
                  value={payment.transactionId}
                />
                <InfoBox
                  label="Payment Status"
                  value={payment.paymentStatus || "Pending"}
                />
                <InfoBox
                  label="Order Status"
                  value={payment.orderStatus || "N/A"}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-gray-900">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBox
                  label="Customer Name"
                  value={payment.customerName || "N/A"}
                />
                <InfoBox
                  label="Customer Email"
                  value={payment.customerEmail || "N/A"}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-gray-900">
                Verification
              </h2>

              {payment.paymentStatus?.toLowerCase() === "paid" ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" />
                    <div>
                      <h3 className="font-bold text-green-900">
                        Payment already verified
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-green-700">
                        This transaction has already been verified.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-700" />
                    <div>
                      <h3 className="font-bold text-yellow-900">
                        Manual verification required
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-yellow-700">
                        Confirm the transaction in your MFS merchant account
                        before clicking verify.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="button"
                disabled={!canVerify || isVerifying}
                onClick={verifyPayment}
                className="mt-5 w-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
              >
                {isVerifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Verify Payment
              </Button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-gray-900">
                Timeline
              </h2>

              <div className="space-y-4">
                <TimelineItem
                  title="Submitted"
                  value={
                    payment.submittedAt
                      ? formatDate(payment.submittedAt)
                      : "N/A"
                  }
                />

                <TimelineItem
                  title="Verified"
                  value={
                    payment.verifiedAt ? formatDate(payment.verifiedAt) : "N/A"
                  }
                />

                <TimelineItem
                  title="Verified By"
                  value={payment.verifiedBy || "N/A"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-bold text-gray-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

function TimelineItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{value}</p>
      </div>
    </div>
  );
}