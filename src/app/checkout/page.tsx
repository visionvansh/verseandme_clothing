// src/app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/PaymentForm";
import {
  FaArrowLeft,
  FaLock,
  FaTruck,
  FaShieldAlt,
  FaCreditCard,
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";

// Initialize Stripe outside component to avoid recreating the instance
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, cartCount } = useCart();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    country: "US",
    zip: "",
    phone: "",
  });
  const [step, setStep] = useState<"shipping" | "payment">("shipping");

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart.length, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateShipping = (): boolean => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    const requiredFields: (keyof ShippingAddress)[] = [
      "firstName",
      "lastName",
      "address1",
      "city",
      "province",
      "country",
      "zip",
    ];

    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, " \$1").toLowerCase()}`);
        return false;
      }
    }

    return true;
  };

  const proceedToPayment = async () => {
    setError(null);
    
    if (!validateShipping()) {
      return;
    }

    setIsLoading(true);

    try {
      const subtotal = cartTotal;
      const shipping = subtotal > 50 ? 0 : 5.99;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      console.log("Creating payment intent for:", total);

      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          email,
          metadata: {
            customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            itemCount: cartCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Payment intent created:", data.clientSecret);
      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (err) {
      console.error("Payment setup error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize payment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cartTotal;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return null;
  }

  // Stripe Elements options
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#e2c299',
        colorBackground: '#1a0f0b',
        colorText: '#f5f5f5',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(226, 194, 153, 0.3)',
          color: '#f5f5f5',
        },
        '.Input:focus': {
          border: '1px solid #e2c299',
          boxShadow: '0 0 0 1px #e2c299',
        },
        '.Label': {
          color: '#f5f5f5',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
    },
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Secure Checkout
              </h1>
              <p
                className="text-[#f5f5f5]/60 text-sm md:text-base flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <FaLock className="text-[#e2c299]" />
                Your information is encrypted and secure
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => step === "payment" ? setStep("shipping") : router.back()}
              className="flex items-center gap-2 text-[#e2c299] hover:text-[#d4b589] transition-colors text-sm md:text-base"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">
                {step === "payment" ? "Back to Shipping" : "Back to Cart"}
              </span>
            </motion.button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === "shipping" ? "bg-[#e2c299] text-[#1a0f0b]" : "bg-green-600 text-white"
              }`}>
                {step === "payment" ? "✓" : "1"}
              </div>
              <span className="text-[#f5f5f5] text-sm font-medium">Shipping</span>
            </div>
            <div className={`flex-1 h-0.5 transition-colors ${
              step === "payment" ? "bg-[#e2c299]" : "bg-[#e2c299]/30"
            }`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === "payment" ? "bg-[#e2c299] text-[#1a0f0b]" : "bg-[#f5f5f5]/20 text-[#f5f5f5]/50"
              }`}>
                2
              </div>
              <span className="text-[#f5f5f5] text-sm font-medium">Payment</span>
            </div>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-[#e2c299] to-transparent rounded-full"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <div className="space-y-6">
                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-6"
                >
                  <h2
                    className="text-[#e2c299] text-xl md:text-2xl font-bold mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Contact Information
                  </h2>
                  <div>
                    <label
                      className="block text-[#f5f5f5] text-sm mb-2"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299] transition-colors"
                      placeholder="your@email.com"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      required
                    />
                  </div>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-6"
                >
                  <h2
                    className="text-[#e2c299] text-xl md:text-2xl font-bold mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingAddress.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingAddress.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        name="address1"
                        value={shippingAddress.address1}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        name="address2"
                        value={shippingAddress.address2}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={shippingAddress.province}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={shippingAddress.zip}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Country *
                      </label>
                      <select
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[#f5f5f5] text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-[#e2c299]/30 rounded-lg px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e2c299]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={proceedToPayment}
                  disabled={isLoading}
                  className="w-full bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {isLoading ? "Loading..." : "Continue to Payment"}
                </motion.button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-6">
                <h2
                  className="text-[#e2c299] text-xl md:text-2xl font-bold mb-6"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Payment Information
                </h2>
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      shippingAddress={shippingAddress}
                      email={email}
                      cart={cart}
                      total={total}
                    />
                  </Elements>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e2c299]"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-6 lg:sticky lg:top-24"
            >
              <h2
                className="text-[#e2c299] text-xl md:text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#f5f5f5] text-sm font-semibold line-clamp-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {item.title}
                      </h4>
                      <p className="text-[#f5f5f5]/60 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Qty: {item.quantity}
                      </p>
                      <p className="text-[#e2c299] text-sm font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pt-4 border-t border-[#e2c299]/20">
                <div className="flex justify-between text-[#f5f5f5]/70" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span>Subtotal ({cartCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#f5f5f5]/70" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-400">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-[#f5f5f5]/70" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span>Tax (estimated)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-[#e2c299]/20">
                  <div className="flex justify-between text-[#e2c299] text-xl font-bold">
                    <span style={{ fontFamily: "'Playfair Display', serif" }}>Total</span>
                    <span style={{ fontFamily: "'Inter', sans-serif" }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e2c299]/10">
                <div className="text-center">
                  <FaTruck className="text-[#e2c299] text-xl mx-auto mb-1" />
                  <p className="text-[#f5f5f5]/70 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Free Shipping</p>
                </div>
                <div className="text-center">
                  <FaShieldAlt className="text-[#e2c299] text-xl mx-auto mb-1" />
                  <p className="text-[#f5f5f5]/70 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Secure</p>
                </div>
                <div className="text-center">
                  <FaCreditCard className="text-[#e2c299] text-xl mx-auto mb-1" />
                  <p className="text-[#f5f5f5]/70 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Safe Payment</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap");
      `}</style>
    </div>
  );
}