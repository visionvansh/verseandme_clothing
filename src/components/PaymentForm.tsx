// src/components/PaymentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { FaLock, FaSpinner } from "react-icons/fa";
import { useCart } from "@/context/CartContext";

interface PaymentFormProps {
  clientSecret: string;
  shippingAddress: any;
  email: string;
  cart: any[];
  total: number;
}

export default function PaymentForm({
  clientSecret,
  shippingAddress,
  email,
  cart,
  total,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!stripe || !elements) {
    setError("Payment system not loaded. Please refresh the page.");
    return;
  }

  setIsProcessing(true);
  setError(null);

  try {
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw new Error(submitError.message);
    }

    console.log("Confirming payment...");

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
        receipt_email: email,
        shipping: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          address: {
            line1: shippingAddress.address1,
            line2: shippingAddress.address2 || undefined,
            city: shippingAddress.city,
            state: shippingAddress.province,
            postal_code: shippingAddress.zip,
            country: shippingAddress.country,
          },
        },
      },
      redirect: "if_required",
    });

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      console.log("Payment succeeded:", paymentIntent.id);

      // Create order in Shopify (non-blocking)
      fetch("/api/create-shopify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: cart.map((item) => ({
            variant_id: item.variantId.split("/").pop(),
            quantity: item.quantity,
            price: item.price.toString(),
          })),
          customer: {
            email,
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
          },
          shippingAddress: {
            first_name: shippingAddress.firstName,
            last_name: shippingAddress.lastName,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            province: shippingAddress.province,
            country: shippingAddress.country,
            zip: shippingAddress.zip,
            phone: shippingAddress.phone,
          },
          totalPrice: total.toFixed(2),
          paymentId: paymentIntent.id,
        }),
      }).catch((err) => console.error("Shopify order creation error:", err));

      // Clear cart and redirect immediately
      clearCart();
      
      // Use window.location for reliable redirect
      window.location.href = `/order-confirmation?payment_intent=${paymentIntent.id}`;
    }
  } catch (err) {
    console.error("Payment error:", err);
    setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    setIsProcessing(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <motion.button
        whileHover={{ scale: isProcessing ? 1 : 1.02 }}
        whileTap={{ scale: isProcessing ? 1 : 0.98 }}
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {isProcessing ? (
          <>
            <FaSpinner className="animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <FaLock />
            Pay ${total.toFixed(2)}
          </>
        )}
      </motion.button>

      <p className="text-center text-[#f5f5f5]/50 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
        By completing this purchase, you agree to our terms and conditions.
      </p>
    </form>
  );
}