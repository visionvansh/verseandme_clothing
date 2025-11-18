// src/app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaTruck,
  FaShieldAlt,
  FaTag,
  FaFire,
  FaHeart,
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";

interface SavedItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  options: Record<string, string>;
  vendor?: string;
  productType?: string;
  sku?: string;
  availableForSale: boolean;
  quantityAvailable?: number;
}

const MoveToCartButton = ({
  savedItem,
  onMove,
}: {
  savedItem: SavedItem;
  onMove: (item: SavedItem) => void;
}) => {
  const [status, setStatus] = useState<"idle" | "moving" | "success">("idle");

  const handleClick = () => {
    if (status !== "idle") return;

    setStatus("moving");
    onMove(savedItem);

    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 300);
  };

  return (
    <motion.button
      whileHover={{ scale: status === "idle" ? 1.02 : 1 }}
      whileTap={{ scale: status === "idle" ? 0.98 : 1 }}
      onClick={handleClick}
      disabled={status !== "idle"}
      className={`w-full px-3 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all duration-300 ${
        status === "success"
          ? "bg-green-600 text-white"
          : status === "moving"
          ? "bg-[#e2c299]/50 text-[#1a0f0b] cursor-wait"
          : "bg-[#e2c299]/10 hover:bg-[#e2c299]/20 text-[#e2c299] border border-[#e2c299]/30"
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Move to Cart
          </motion.span>
        )}
        {status === "moving" && (
          <motion.div
            key="moving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaShoppingCart className="text-xs md:text-sm" />
            </motion.div>
            <span>Moving...</span>
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <FaCheckCircle className="text-xs md:text-sm" />
            <span>Moved!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    addToCart,
  } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedForLater");
    if (saved) {
      setSavedItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedForLater", JSON.stringify(savedItems));
  }, [savedItems]);

  const saveForLater = (itemId: string) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;

    const savedItem: SavedItem = {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      image: item.image,
      options: item.options,
      vendor: item.vendor,
      productType: item.productType,
      sku: item.sku,
      availableForSale: item.availableForSale,
      quantityAvailable: item.quantityAvailable,
    };

    setSavedItems((prev) => [...prev, savedItem]);
    removeFromCart(itemId);
  };

  const moveToCart = (savedItem: SavedItem) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== savedItem.id));

    addToCart({
      productId: savedItem.productId,
      variantId: savedItem.variantId,
      title: savedItem.title,
      description: "",
      image: savedItem.image,
      options: savedItem.options,
      quantity: 1,
      price: savedItem.price,
      compareAtPrice: savedItem.compareAtPrice,
      vendor: savedItem.vendor,
      productType: savedItem.productType,
      sku: savedItem.sku,
      availableForSale: savedItem.availableForSale,
      quantityAvailable: savedItem.quantityAvailable,
    });
  };

  const removeSavedItem = (itemId: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const subtotal = cartTotal;
  const savings = cart.reduce((total, item) => {
    if (item.compareAtPrice) {
      return total + (item.compareAtPrice - item.price) * item.quantity;
    }
    return total;
  }, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

 const handleCheckout = () => {
  router.push('/checkout');
};

  if (cart.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8 rounded-full bg-[#e2c299]/10 flex items-center justify-center border-2 border-[#e2c299]/30"
            >
              <FaShoppingCart className="text-[#e2c299] text-4xl md:text-5xl" />
            </motion.div>

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-3 md:mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your Cart is Empty
            </h1>
            <p
              className="text-[#f5f5f5]/60 text-base md:text-lg mb-6 md:mb-8 px-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Looks like you haven&apos;t added anything to your cart yet.
            </p>

            <Link href="/product">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 inline-flex items-center gap-2 md:gap-3"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <FaShoppingCart />
                Continue Shopping
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap");
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-1 md:mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Shopping Cart
              </h1>
              <p
                className="text-[#f5f5f5]/60 text-sm md:text-base lg:text-lg"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#e2c299] hover:text-[#d4b589] transition-colors text-sm md:text-base"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FaArrowLeft className="text-xs md:text-sm" />
              <span>Continue Shopping</span>
            </motion.button>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-0.5 md:h-1 bg-gradient-to-r from-[#e2c299] to-transparent rounded-full"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl overflow-hidden hover:border-[#e2c299]/40 transition-all duration-300"
                >
                  <div className="p-3 md:p-4 lg:p-6">
                    <div className="flex gap-3 md:gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.productId.split("/").pop()}`}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#2b1e1e] to-black group"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                        />
                        {!item.availableForSale && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-red-400 text-[9px] sm:text-[10px] md:text-xs font-bold text-center px-1">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        {/* Title and Delete */}
                        <div className="flex justify-between gap-2 mb-2">
                          <Link
                            href={`/product/${item.productId.split("/").pop()}`}
                            className="flex-1 min-w-0"
                          >
                            <h3
                              className="text-[#f5f5f5] text-sm md:text-base lg:text-lg xl:text-xl font-bold hover:text-[#e2c299] transition-colors line-clamp-2"
                              style={{
                                fontFamily: "'Playfair Display', serif",
                              }}
                            >
                              {item.title}
                            </h3>
                          </Link>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 p-1 md:p-2 rounded-lg hover:bg-red-500/10 transition-all h-fit flex-shrink-0"
                            title="Remove from cart"
                          >
                            <FaTrash className="text-xs md:text-sm lg:text-base" />
                          </motion.button>
                        </div>

                        {/* Options */}
                        <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                          {Object.entries(item.options).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-[9px] sm:text-[10px] md:text-xs bg-[#e2c299]/10 text-[#e2c299] px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-[#e2c299]/30"
                              style={{
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>

                        {/* Vendor/Type Info - Hidden on mobile */}
                        <div className="hidden md:flex items-center gap-2 text-xs text-[#f5f5f5]/50 mb-2">
                          {item.vendor && (
                            <>
                              <span>{item.vendor}</span>
                              <span>•</span>
                            </>
                          )}
                          {item.productType && <span>{item.productType}</span>}
                          {item.sku && (
                            <>
                              <span>•</span>
                              <span>SKU: {item.sku}</span>
                            </>
                          )}
                        </div>

                        {/* Stock Warning */}
                        {item.quantityAvailable !== undefined && (
                          <div className="flex items-center gap-2 mb-2">
                            {item.quantityAvailable <= 5 &&
                              item.quantityAvailable > 0 && (
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs text-orange-400">
                                  <FaFire className="text-[9px] sm:text-[10px] md:text-xs flex-shrink-0" />
                                  <span>Only {item.quantityAvailable} left!</span>
                                </div>
                              )}
                            {!item.availableForSale && (
                              <div className="text-[9px] sm:text-[10px] md:text-xs text-red-400 font-semibold">
                                Out of Stock
                              </div>
                            )}
                          </div>
                        )}

                        {/* Price and Quantity - Mobile Optimized */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
                          {/* Price Section */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[#e2c299] font-bold text-base md:text-lg lg:text-xl xl:text-2xl"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              ${item.price.toFixed(2)}
                            </span>
                            {item.compareAtPrice && (
                              <>
                                <span
                                  className="text-[#f5f5f5]/30 line-through text-xs md:text-sm"
                                  style={{
                                    fontFamily: "'Inter', sans-serif",
                                  }}
                                >
                                  ${item.compareAtPrice.toFixed(2)}
                                </span>
                                <span className="text-[9px] md:text-xs font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border border-green-500/30">
                                  {Math.round(
                                    ((item.compareAtPrice - item.price) /
                                      item.compareAtPrice) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 md:gap-3">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="bg-[#e2c299]/10 hover:bg-[#e2c299]/20 text-[#e2c299] border border-[#e2c299]/30 w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#e2c299]/10 flex items-center justify-center"
                            >
                              <FaMinus className="text-xs md:text-sm" />
                            </motion.button>
                            <span
                              className="text-[#f5f5f5] font-bold text-sm md:text-base lg:text-lg w-8 md:w-10 lg:w-12 text-center"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                item.quantityAvailable !== undefined &&
                                item.quantity >= item.quantityAvailable
                              }
                              className="bg-[#e2c299]/10 hover:bg-[#e2c299]/20 text-[#e2c299] border border-[#e2c299]/30 w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <FaPlus className="text-xs md:text-sm" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="mt-3 pt-3 border-t border-[#e2c299]/10">
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-[#f5f5f5]/60 text-xs md:text-sm"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              Subtotal:
                            </span>
                            <span
                              className="text-[#e2c299] font-bold text-sm md:text-base lg:text-lg"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          {/* Save for Later Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => saveForLater(item.id)}
                            className="w-full text-[#e2c299] hover:text-[#d4b589] text-xs md:text-sm font-medium flex items-center justify-center gap-1.5 py-2 border border-[#e2c299]/20 rounded-lg hover:bg-[#e2c299]/5 transition-all"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            <FaHeart className="text-xs" />
                            <span>Save for later</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 md:mt-8"
              >
                <h2
                  className="text-xl md:text-2xl lg:text-3xl font-bold text-[#e2c299] mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Saved for Later ({savedItems.length})
                </h2>

                <div className="space-y-3 md:space-y-4">
                  <AnimatePresence mode="popLayout">
                    {savedItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                        className="bg-gradient-to-br from-[#1a0f0b]/60 to-black/75 border border-[#e2c299]/10 rounded-xl overflow-hidden hover:border-[#e2c299]/30 transition-all duration-300"
                      >
                        <div className="p-3 md:p-4 lg:p-6">
                          <div className="flex gap-3 md:gap-4">
                            <Link
                              href={`/product/${item.productId.split("/").pop()}`}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#2b1e1e] to-black group"
                            >
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                              />
                            </Link>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <Link
                                  href={`/product/${item.productId.split("/").pop()}`}
                                  className="flex-1 min-w-0"
                                >
                                  <h3
                                    className="text-[#f5f5f5] text-sm md:text-base lg:text-lg font-bold hover:text-[#e2c299] transition-colors line-clamp-2"
                                    style={{
                                      fontFamily: "'Playfair Display', serif",
                                    }}
                                  >
                                    {item.title}
                                  </h3>
                                </Link>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeSavedItem(item.id)}
                                  className="text-red-400 hover:text-red-300 p-1 md:p-2 rounded-lg hover:bg-red-500/10 transition-all flex-shrink-0"
                                  title="Remove"
                                >
                                  <FaTrash className="text-xs md:text-sm" />
                                </motion.button>
                              </div>

                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span
                                  className="text-[#e2c299] font-bold text-sm md:text-base lg:text-lg"
                                  style={{
                                    fontFamily: "'Inter', sans-serif",
                                  }}
                                >
                                  ${item.price.toFixed(2)}
                                </span>
                                {item.compareAtPrice && (
                                  <>
                                    <span
                                      className="text-[#f5f5f5]/30 line-through text-xs md:text-sm"
                                      style={{
                                        fontFamily: "'Inter', sans-serif",
                                      }}
                                    >
                                      ${item.compareAtPrice.toFixed(2)}
                                    </span>
                                    <span className="text-[9px] md:text-xs font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border border-green-500/30">
                                      {Math.round(
                                        ((item.compareAtPrice - item.price) /
                                          item.compareAtPrice) *
                                          100
                                      )}
                                      % OFF
                                    </span>
                                  </>
                                )}
                              </div>

                              <MoveToCartButton
                                savedItem={item}
                                onMove={moveToCart}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Clear Cart Button */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClearConfirm(true)}
                  className="text-red-400 hover:text-red-300 border-2 border-red-400/30 hover:border-red-400/50 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all flex items-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <FaTrash className="text-xs md:text-sm" />
                  Clear Cart
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Order Summary - Sticky on desktop */}
          {cart.length > 0 && (
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-4 md:p-6 lg:sticky lg:top-24"
              >
                <h2
                  className="text-[#e2c299] text-xl md:text-2xl font-bold mb-4 md:mb-6"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Order Summary
                </h2>

                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  <div className="flex justify-between text-[#f5f5f5]/70 text-sm md:text-base">
                    <span style={{ fontFamily: "'Inter', sans-serif" }}>
                      Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"})
                    </span>
                    <span
                      className="font-semibold"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-green-400 text-sm md:text-base">
                      <span
                        className="flex items-center gap-1"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <FaTag className="text-xs md:text-sm" />
                        Savings
                      </span>
                      <span
                        className="font-semibold"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        -${savings.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#f5f5f5]/70 text-sm md:text-base">
                    <span style={{ fontFamily: "'Inter', sans-serif" }}>
                      Shipping
                    </span>
                    <span
                      className="font-semibold"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {shipping === 0 ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <FaCheckCircle className="text-xs" />
                          FREE
                        </span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {subtotal < 50 && subtotal > 0 && (
                    <div className="text-[10px] md:text-xs text-orange-400 bg-orange-500/10 px-2 md:px-3 py-1.5 md:py-2 rounded border border-orange-500/30">
                      Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
                    </div>
                  )}

                  <div className="flex justify-between text-[#f5f5f5]/70 text-sm md:text-base">
                    <span style={{ fontFamily: "'Inter', sans-serif" }}>
                      Tax (10%)
                    </span>
                    <span
                      className="font-semibold"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-3 md:pt-4 border-t border-[#e2c299]/20">
                    <div className="flex justify-between text-[#e2c299] text-lg md:text-xl font-bold">
                      <span style={{ fontFamily: "'Playfair Display', serif" }}>
                        Total
                      </span>
                      <span style={{ fontFamily: "'Inter', sans-serif" }}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] py-3 md:py-4 rounded-xl font-bold text-sm md:text-base lg:text-lg transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Proceed to Checkout
                  <FaArrowRight className="text-sm md:text-base" />
                </motion.button>

                <Link href="/product">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full border-2 border-[#e2c299] text-[#e2c299] hover:bg-[#e2c299] hover:text-[#1a0f0b] py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Continue Shopping
                  </motion.button>
                </Link>

                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#e2c299]/10">
                  <div className="text-center">
                    <FaTruck className="text-[#e2c299] text-base md:text-lg lg:text-2xl mx-auto mb-1 md:mb-2" />
                    <p
                      className="text-[#f5f5f5]/70 text-[9px] md:text-[10px] lg:text-xs"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Free Shipping
                    </p>
                  </div>
                  <div className="text-center">
                    <FaShieldAlt className="text-[#e2c299] text-base md:text-lg lg:text-2xl mx-auto mb-1 md:mb-2" />
                    <p
                      className="text-[#f5f5f5]/70 text-[9px] md:text-[10px] lg:text-xs"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Secure Payment
                    </p>
                  </div>
                  <div className="text-center">
                    <FaCheckCircle className="text-[#e2c299] text-base md:text-lg lg:text-2xl mx-auto mb-1 md:mb-2" />
                    <p
                      className="text-[#f5f5f5]/70 text-[9px] md:text-[10px] lg:text-xs"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Quality Guaranteed
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#1a0f0b] to-black border-2 border-[#e2c299]/30 rounded-2xl p-6 md:p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30">
                  <FaTrash className="text-red-400 text-xl md:text-2xl" />
                </div>
                <h3
                  className="text-[#e2c299] text-xl md:text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Clear Cart?
                </h3>
                <p
                  className="text-[#f5f5f5]/70 text-sm md:text-base"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Are you sure you want to remove all items from your cart? This
                  action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 md:gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 border-2 border-[#e2c299] text-[#e2c299] hover:bg-[#e2c299] hover:text-[#1a0f0b] py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Clear Cart
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap");

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #1a0f0b;
        }

        ::-webkit-scrollbar-thumb {
          background: #e2c299;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #d4b589;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}