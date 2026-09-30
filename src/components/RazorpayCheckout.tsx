"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      on: (event: string, handler: () => void) => void;
      open: () => void;
    };
  }
}

interface PaymentData {
  fullName: string;
  email: string;
  phone: string;
  college?: string;
  domain: string;
  duration?: string;
  totalBilling: number;
  amountToPay: number;
  balancePayment?: boolean;
}

export default function RazorpayCheckout({
  formData,
  onSuccess,
}: {
  formData: PaymentData;
  onSuccess?: (emailSent: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (!(await loadRazorpay())) throw new Error("Unable to load the payment service.");

      const orderResponse = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok || !order.success) throw new Error(order.error || "Unable to create payment order.");

      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Inetz Technologies",
        description: `${formData.domain} fee payment`,
        order_id: order.orderId,
        prefill: { name: formData.fullName, email: formData.email, contact: formData.phone },
        theme: { color: "#2563eb" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (payment: Record<string, string>) => {
          try {
            const verifyResponse = await fetch("/api/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payment, paymentMethod: "GPay", billingBy: "Razorpay Online" }),
            });
            const result = await verifyResponse.json();
            if (!verifyResponse.ok || !result.success) throw new Error(result.error || "Payment verification failed.");
            onSuccess?.(Boolean(result.emailSent));
          } catch (error) {
            alert(error instanceof Error ? error.message : "Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
      });

      checkout.on("payment.failed", () => {
        setLoading(false);
        alert("Payment failed. No amount was recorded.");
      });
      checkout.open();
    } catch (error) {
      setLoading(false);
      alert(error instanceof Error ? error.message : "Unable to start payment.");
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading || formData.amountToPay <= 0}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
      {loading
        ? "Opening secure payment..."
        : formData.amountToPay > 0
          ? `Pay ₹${formData.amountToPay.toLocaleString("en-IN")}`
          : "Enter an installment amount"}
    </button>
  );
}
