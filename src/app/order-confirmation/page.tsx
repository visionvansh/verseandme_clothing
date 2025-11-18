// src/app/order-confirmation/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaCheckCircle,
  FaEnvelope,
  FaTruck,
  FaBox,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";

interface OrderDetails {
  id: string;
  amount: number;
  email: string;
  status: string;
  created: number;
  shipping?: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = searchParams?.get("payment_intent");

  useEffect(() => {
    if (!paymentIntentId) {
      router.push("/");
      return;
    }

    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntentId, router]);

  const fetchOrderDetails = async () => {
    if (!paymentIntentId) {
      setError("No payment intent ID found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/order-details?payment_intent=${paymentIntentId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderDetails(data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Unable to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#e2c299] text-6xl mx-auto mb-4" />
          <p className="text-[#f5f5f5] text-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            Loading your order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1
            className="text-3xl font-bold text-[#f5f5f5] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Order Not Found
          </h1>
          <p className="text-[#f5f5f5]/70 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            {error || "We couldn't find your order details."}
          </p>
          <Link
            href="/"
            className="inline-block bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] px-8 py-3 rounded-xl font-bold transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-4xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <FaCheckCircle className="text-green-500 text-8xl drop-shadow-lg" />
          </motion.div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f5f5f5] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Order Confirmed!
          </h1>
          <p
            className="text-[#f5f5f5]/70 text-lg md:text-xl max-w-2xl mx-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Thank you for your purchase. Your order has been successfully placed
            and is being processed.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-[#e2c299]/20">
            <div>
              <p
                className="text-[#f5f5f5]/60 text-sm mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Order Number
              </p>
              <p
                className="text-[#e2c299] text-xl font-bold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                #{orderDetails.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-left md:text-right">
              <p
                className="text-[#f5f5f5]/60 text-sm mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Order Date
              </p>
              <p
                className="text-[#f5f5f5] font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {new Date(orderDetails.created * 1000).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Email Confirmation */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#e2c299]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-[#e2c299] text-xl" />
              </div>
              <div>
                <h3
                  className="text-[#f5f5f5] font-semibold mb-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Confirmation Email
                </h3>
                <p
                  className="text-[#f5f5f5]/70 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Sent to {orderDetails.email}
                </p>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#e2c299]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaBox className="text-[#e2c299] text-xl" />
              </div>
              <div>
                <h3
                  className="text-[#f5f5f5] font-semibold mb-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Total Amount
                </h3>
                <p
                  className="text-[#e2c299] text-lg font-bold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  ${(orderDetails.amount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {orderDetails.shipping && (
            <div className="bg-black/30 rounded-lg p-4">
              <h3
                className="text-[#e2c299] font-semibold mb-3 flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <FaTruck />
                Shipping Address
              </h3>
              <div className="text-[#f5f5f5]/80" style={{ fontFamily: "'Inter', sans-serif" }}>
                <p className="font-semibold">{orderDetails.shipping.name}</p>
                <p>{orderDetails.shipping.address.line1}</p>
                {orderDetails.shipping.address.line2 && (
                  <p>{orderDetails.shipping.address.line2}</p>
                )}
                <p>
                  {orderDetails.shipping.address.city}, {orderDetails.shipping.address.state}{" "}
                  {orderDetails.shipping.address.postal_code}
                </p>
                <p>{orderDetails.shipping.address.country}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-6 md:p-8 mb-6"
        >
          <h2
            className="text-[#e2c299] text-2xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What Happens Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#e2c299] rounded-full flex items-center justify-center flex-shrink-0 text-[#1a0f0b] font-bold">
                1
              </div>
              <div>
                <h4
                  className="text-[#f5f5f5] font-semibold mb-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Order Processing
                </h4>
                <p
                  className="text-[#f5f5f5]/70 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  We're preparing your items with care and attention to detail.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#e2c299] rounded-full flex items-center justify-center flex-shrink-0 text-[#1a0f0b] font-bold">
                2
              </div>
              <div>
                <h4
                  className="text-[#f5f5f5] font-semibold mb-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Shipping Notification
                </h4>
                <p
                  className="text-[#f5f5f5]/70 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  You'll receive a tracking number via email once your order ships.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#e2c299] rounded-full flex items-center justify-center flex-shrink-0 text-[#1a0f0b] font-bold">
                3
              </div>
              <div>
                <h4
                  className="text-[#f5f5f5] font-semibold mb-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Delivery
                </h4>
                <p
                  className="text-[#f5f5f5]/70 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Your order will arrive within 3-7 business days.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] px-8 py-4 rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Continue Shopping
            <FaArrowRight />
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-black/50 border border-[#e2c299]/30 hover:border-[#e2c299] text-[#f5f5f5] px-8 py-4 rounded-xl font-bold transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Print Receipt
          </button>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 pt-8 border-t border-[#e2c299]/10"
        >
          <p
            className="text-[#f5f5f5]/60 text-sm mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Need help with your order?
          </p>
          <Link
            href="/contact"
            className="text-[#e2c299] hover:text-[#d4b589] font-semibold transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Contact Support
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap");
      `}</style>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="animate-spin text-[#e2c299] text-6xl" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}