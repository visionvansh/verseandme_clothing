// src/app/account/page.tsx
"use client";

import { useEffect } from "react";
import { useCustomer } from "@/context/CustomerContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaShoppingBag,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaSignOutAlt,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function AccountPage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated, logout } = useCustomer();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/account/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#e2c299] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const orderCount = customer.orders?.edges?.length || 0;
  const totalSpent = customer.orders?.edges?.reduce(
    (sum, { node: order }) => sum + parseFloat(order.totalPriceV2.amount),
    0
  ) || 0;

  const getOrderStatusColor = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "FULFILLED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PARTIALLY_FULFILLED":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "UNFULFILLED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getOrderStatusIcon = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "FULFILLED":
        return <FaCheckCircle />;
      case "PARTIALLY_FULFILLED":
      case "UNFULFILLED":
        return <FaTruck />;
      default:
        return <FaClock />;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
        {/* Account Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#e2c299]/10 border-2 border-[#e2c299]/30 flex items-center justify-center">
                  <FaUser className="text-[#e2c299] text-2xl md:text-3xl" />
                </div>
                <div>
                  <h1
                    className="text-2xl md:text-4xl font-bold text-[#f5f5f5] mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <p
                    className="text-[#f5f5f5]/60 text-sm md:text-base flex items-center gap-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <FaEnvelope className="text-xs" />
                    {customer.email}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <FaSignOutAlt />
                Sign Out
              </motion.button>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-[#e2c299]/5 border border-[#e2c299]/20 rounded-lg p-4 text-center">
                <FaShoppingBag className="text-[#e2c299] text-2xl mx-auto mb-2" />
                <p className="text-[#f5f5f5]/60 text-xs mb-1">Total Orders</p>
                <p className="text-[#e2c299] text-xl md:text-2xl font-bold">
                  {orderCount}
                </p>
              </div>
              <div className="bg-[#e2c299]/5 border border-[#e2c299]/20 rounded-lg p-4 text-center">
                <FaBox className="text-[#e2c299] text-2xl mx-auto mb-2" />
                <p className="text-[#f5f5f5]/60 text-xs mb-1">Total Spent</p>
                <p className="text-[#e2c299] text-xl md:text-2xl font-bold">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#e2c299]/5 border border-[#e2c299]/20 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                <FaCalendar className="text-[#e2c299] text-2xl mx-auto mb-2" />
                <p className="text-[#f5f5f5]/60 text-xs mb-1">Member Since</p>
                <p className="text-[#e2c299] text-xl md:text-2xl font-bold">
                  {new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl md:text-3xl font-bold text-[#e2c299]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Order History
            </h2>
            <span
              className="text-[#f5f5f5]/60 text-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {orderCount} {orderCount === 1 ? "order" : "orders"}
            </span>
          </div>

          {orderCount === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-gradient-to-br from-[#1a0f0b]/50 to-black/75 rounded-xl border border-[#e2c299]/20"
            >
              <FaShoppingBag className="text-[#e2c299] text-5xl mx-auto mb-4 opacity-50" />
              <p
                className="text-[#f5f5f5]/60 mb-6 text-lg"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                You haven&apos;t placed any orders yet
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/product")}
                className="bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] px-8 py-4 rounded-xl font-bold text-lg transition-all inline-flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <FaShoppingBag />
                Start Shopping
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {customer.orders.edges.map(({ node: order }, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl overflow-hidden hover:border-[#e2c299]/40 transition-all"
                  >
                    {/* Order Header */}
                    <div className="p-4 md:p-6 border-b border-[#e2c299]/10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3
                              className="text-lg md:text-xl font-bold text-[#f5f5f5]"
                              style={{
                                fontFamily: "'Playfair Display', serif",
                              }}
                            >
                              Order #{order.orderNumber}
                            </h3>
                            <span
                              className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${getOrderStatusColor(
                                order.fulfillmentStatus
                              )}`}
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {getOrderStatusIcon(order.fulfillmentStatus)}
                              {order.fulfillmentStatus || "Processing"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs md:text-sm text-[#f5f5f5]/60">
                            <span className="flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {new Date(order.processedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span>•</span>
                            <span>
                              {order.lineItems.edges.length}{" "}
                              {order.lineItems.edges.length === 1
                                ? "item"
                                : "items"}
                            </span>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p
                            className="text-2xl md:text-3xl font-bold text-[#e2c299]"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            ${order.totalPriceV2.amount}
                          </p>
                          <p
                            className="text-xs text-[#f5f5f5]/50"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {order.totalPriceV2.currencyCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 md:p-6">
                      <div className="space-y-4 mb-6">
                        {order.lineItems.edges.map(({ node: item }) => (
                          <div
                            key={item.variant.id}
                            className="flex gap-4 bg-black/30 rounded-lg p-3 md:p-4 hover:bg-black/40 transition-all"
                          >
                            {item.variant.image && (
                              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#2b1e1e] to-black">
                                <Image
                                  src={item.variant.image.url}
                                  alt={item.title}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                  sizes="(max-width: 768px) 64px, 80px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4
                                className="text-[#f5f5f5] font-semibold text-sm md:text-base mb-1 line-clamp-2"
                                style={{
                                  fontFamily: "'Playfair Display', serif",
                                }}
                              >
                                {item.title}
                              </h4>
                              {item.variant.title !== "Default Title" && (
                                <p
                                  className="text-[#f5f5f5]/60 text-xs mb-2"
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  {item.variant.title}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[#f5f5f5]/60 text-xs md:text-sm"
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  Qty: {item.quantity}
                                </span>
                                <span
                                  className="text-[#e2c299] font-bold text-sm md:text-base"
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  $
                                  {(
                                    parseFloat(item.variant.priceV2.amount) *
                                    item.quantity
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="border-t border-[#e2c299]/10 pt-4 space-y-2">
                        <div className="flex justify-between text-[#f5f5f5]/60 text-sm">
                          <span>Subtotal:</span>
                          <span>${order.subtotalPriceV2.amount}</span>
                        </div>
                        <div className="flex justify-between text-[#f5f5f5]/60 text-sm">
                          <span>Shipping:</span>
                          <span>${order.totalShippingPriceV2.amount}</span>
                        </div>
                        {order.totalTaxV2 && (
                          <div className="flex justify-between text-[#f5f5f5]/60 text-sm">
                            <span>Tax:</span>
                            <span>${order.totalTaxV2.amount}</span>
                          </div>
                        )}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="mt-4 pt-4 border-t border-[#e2c299]/10">
                          <p className="text-[#e2c299] text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaMapMarkerAlt />
                            Shipping Address
                          </p>
                          <div className="text-[#f5f5f5]/60 text-xs md:text-sm">
                            <p>
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName}
                            </p>
                            <p>{order.shippingAddress.address1}</p>
                            {order.shippingAddress.address2 && (
                              <p>{order.shippingAddress.address2}</p>
                            )}
                            <p>
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.province}{" "}
                              {order.shippingAddress.zip}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        </div>
                      )}

                      {/* View Order Details Button */}
                      {order.statusUrl && (
                        <motion.a
                          href={order.statusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-4 w-full block text-center bg-[#e2c299]/10 hover:bg-[#e2c299]/20 border border-[#e2c299]/30 text-[#e2c299] py-3 rounded-lg font-semibold text-sm transition-all"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          View Full Order Details →
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap");
      `}</style>
    </div>
  );
}