"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ShieldCheck, XCircle, ArrowLeft, Smartphone, CreditCard } from "lucide-react";

function PaymentSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId");
  const orderId = searchParams.get("orderId");
  const amountStr = searchParams.get("amount");
  const method = searchParams.get("method") || "bKash";

  const amount = amountStr ? parseFloat(amountStr) : 0;

  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"gateway" | "pin" | "processing" | "success" | "failed">("gateway");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!sessionId || !orderId) {
      toast.error("Invalid payment session.");
    }
  }, [sessionId, orderId]);

  const handleConfirmPayment = async () => {
    if (!sessionId || !orderId) {
      toast.error("Missing payment session parameters.");
      return;
    }

    setStep("processing");
    setIsProcessing(true);

    // Generate a premium random transaction ID
    const randomTrx = "TXN" + Math.random().toString(36).substring(2, 11).toUpperCase();

    try {
      const response = await api.post("/webhook/payment", {
        sessionId: sessionId,
        transactionId: randomTrx,
        status: "SUCCESS",
        amount: amount,
        paymentMethod: method,
        senderPhoneNumber: phoneNumber,
        payload: JSON.stringify({
          gatewayResponse: "Simulation successful",
          trxId: randomTrx,
          timestamp: new Date().toISOString()
        })
      });

      if (response.data.success) {
        setStep("success");
        toast.success("Payment completed successfully!");
        setTimeout(() => {
          router.push(`/my-orders/${orderId}`);
        }, 2500);
      } else {
        setStep("failed");
        toast.error("Payment registration failed on the server.");
      }
    } catch (error) {
      console.error("Payment webhook simulation failed:", error);
      setStep("failed");
      toast.error("Failed to simulate payment success.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!sessionId || !orderId) {
      router.push("/cart");
      return;
    }

    setStep("processing");
    setIsProcessing(true);

    try {
      await api.post("/webhook/payment", {
        sessionId: sessionId,
        transactionId: "CANCELLED",
        status: "CANCELLED",
        amount: amount,
        paymentMethod: method,
      });

      toast.warning("Payment cancelled by user.");
      setTimeout(() => {
        router.push(`/my-orders/${orderId}`);
      }, 1500);
    } catch (error) {
      console.error("Payment cancellation webhook failed:", error);
      router.push(`/my-orders/${orderId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine Gateway Theme & Layout Styling
  const isBkash = method.toLowerCase() === "bkash";
  const isNagad = method.toLowerCase() === "nagad";
  const isUpay = method.toLowerCase() === "upay";

  let brandColorClass = "bg-slate-700 hover:bg-slate-800 text-white";
  let bannerColorClass = "bg-slate-100 border-slate-200 text-slate-800";
  let brandLogoColor = "text-slate-600";
  let portalName = "Secure Payment Gateway";

  if (isBkash) {
    brandColorClass = "bg-[#E2125B] hover:bg-[#c00f4d] text-white";
    bannerColorClass = "bg-[#E2125B]/5 border-[#E2125B]/20 text-[#E2125B]";
    brandLogoColor = "text-[#E2125B]";
    portalName = "bKash checkout";
  } else if (isNagad) {
    brandColorClass = "bg-[#F15A22] hover:bg-[#d84a16] text-white";
    bannerColorClass = "bg-[#F15A22]/5 border-[#F15A22]/20 text-[#F15A22]";
    brandLogoColor = "text-[#F15A22]";
    portalName = "Nagad checkout";
  } else if (isUpay) {
    brandColorClass = "bg-[#FFC61A] hover:bg-[#e0ad10] text-slate-900";
    bannerColorClass = "bg-[#FFC61A]/10 border-[#FFC61A]/30 text-slate-900";
    brandLogoColor = "text-[#FFC61A]";
    portalName = "Upay checkout";
  }

  if (step === "processing") {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center p-6 text-center">
        <Loader2 className={`h-16 w-16 animate-spin ${brandLogoColor}`} />
        <h2 className="mt-6 text-2xl font-black text-gray-900">Processing Your Payment</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md">
          Please do not close this window or click back. We are communicating with the secure {method} server.
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-green-50 p-4 animate-bounce">
          <ShieldCheck className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="mt-6 text-2xl font-black text-green-600">Payment Successful!</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Redirecting you back to your order summary page...
        </p>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-50 p-4">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="mt-6 text-2xl font-black text-red-600">Payment Failed</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md">
          Something went wrong while validating the payment. Please try again or choose a different payment method.
        </p>
        <Button
          onClick={() => setStep("gateway")}
          className="mt-6 font-bold bg-blue-600 hover:bg-blue-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl transition-all duration-300">
      {/* Header Portal Info */}
      <div className={`flex items-center justify-between border-b px-6 py-4 ${bannerColorClass}`}>
        <div className="flex items-center gap-2">
          {isBkash || isNagad || isUpay ? (
            <Smartphone className={`h-5 w-5 ${brandLogoColor}`} />
          ) : (
            <CreditCard className={`h-5 w-5 ${brandLogoColor}`} />
          )}
          <span className="text-sm font-black uppercase tracking-wider">{portalName}</span>
        </div>
        <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-black shadow-sm">
          TEST SIMULATOR
        </div>
      </div>

      <div className="p-6">
        {/* Payment Summary */}
        <div className="rounded-2xl bg-gray-50 p-5 mb-6 text-center border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount to Pay</p>
          <p className="mt-1 text-3xl font-black text-gray-900">{formatCurrency(amount)}</p>
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-600">
            <span>Order ID: <strong className="text-gray-900">#{orderId}</strong></span>
            <span>Gateway Session: <strong className="text-gray-900 font-mono">{sessionId?.substring(0, 8)}...</strong></span>
          </div>
        </div>

        {step === "gateway" ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your {method} Account Number</label>
              <input
                type="tel"
                placeholder="e.g. 017XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-gray-400">Enter any test mobile wallet number to simulate.</p>
            </div>

            <Button
              onClick={() => {
                if (!phoneNumber.trim()) {
                  toast.error("Please enter a phone number.");
                  return;
                }
                setStep("pin");
              }}
              className={`w-full py-4 text-sm font-black rounded-xl transition-all shadow-md ${brandColorClass}`}
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Enter {method} Pin</label>
              <input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-gray-400 text-center">This is a sandbox simulator. Any PIN will work.</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("gateway")}
                className="w-1/3 py-4 border-gray-300 font-bold rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmPayment}
                className={`w-2/3 py-4 text-sm font-black rounded-xl transition-all shadow-md ${brandColorClass}`}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        )}

        {/* Cancellation */}
        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <button
            onClick={handleCancelPayment}
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline inline-flex items-center gap-1"
          >
            Cancel and Return to Merchant
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSimulatorPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Initializing secure payment simulation...</p>
        </div>
      }>
        <PaymentSimulatorContent />
      </Suspense>
    </div>
  );
}
