"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useParams, useRouter } from "next/navigation";
import client from "@/lib/shopify";
import Link from "next/link";
import Image from "next/image";
import {
  FaShoppingCart,
  FaFire,
  FaCheckCircle,
  FaTruck,
  FaShieldAlt,
  FaArrowLeft,
  FaHeart,
  FaShare,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaBox,
  FaRuler,
  FaClock,
  FaLeaf,
} from "react-icons/fa";

// ✅ Interfaces
interface Price {
  amount: string;
  currencyCode: string;
}

interface CompareAtPrice {
  amount: string;
  currencyCode: string;
}

interface SelectedOption {
  name: string;
  value: string;
}

interface VariantNode {
  id: string;
  title: string;
  price: Price;
  compareAtPrice?: CompareAtPrice;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions: SelectedOption[];
  image?: {
    url: string;
    altText?: string;
  };
  sku?: string;
  weight?: number;
  weightUnit?: string;
  barcode?: string;
}

interface VariantEdge {
  node: VariantNode;
}

interface ImageNode {
  url: string;
  altText?: string;
}

interface ImageEdge {
  node: ImageNode;
}

interface ProductOption {
  name: string;
  values: string[];
}

interface Product {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  images: { edges: ImageEdge[] };
  variants: { edges: VariantEdge[] };
  options: ProductOption[];
  vendor?: string;
  productType?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  seo?: {
    title?: string;
    description?: string;
  };
  availableForSale: boolean;
  totalInventory?: number;
}

// ✅ Animated Add to Cart Button
const AddToCartButton = ({
  onClick,
  disabled,
  isOutOfStock,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  isOutOfStock?: boolean;
  className?: string;
}) => {
  const [status, setStatus] = useState<"idle" | "adding" | "success">("idle");

  const handleClick = () => {
    if (disabled || isOutOfStock || status !== "idle") return;

    setStatus("adding");
    onClick();

    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 300);
  };

  return (
    <motion.button
      whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled || isOutOfStock || status !== "idle"}
      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
        isOutOfStock
          ? "bg-gray-600 cursor-not-allowed text-gray-300"
          : status === "success"
          ? "bg-green-600 text-white"
          : status === "adding"
          ? "bg-[#e2c299]/50 cursor-wait text-[#1a0f0b]"
          : "bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b]"
      } ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <FaShoppingCart />
            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </motion.div>
        )}
        {status === "adding" && (
          <motion.div
            key="adding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaShoppingCart />
            </motion.div>
            <span>Adding...</span>
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <FaCheckCircle />
            <span>Added to Cart!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ✅ Sale Timer Component
const SaleTimer = ({
  productUpdatedAt,
  compareAtPrice,
}: {
  productUpdatedAt?: string;
  compareAtPrice?: CompareAtPrice;
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!productUpdatedAt || !compareAtPrice) return;

    const calculateTimeLeft = () => {
      const updatedDate = new Date(productUpdatedAt);
      const now = new Date();
      const cycleWithGapDuration = 60 * 60 * 1000 + 4 * 60 * 1000;
      const timeSinceUpdate = now.getTime() - updatedDate.getTime();
      const cycleIndex = Math.floor(timeSinceUpdate / cycleWithGapDuration);
      const cycleStartTime = new Date(
        updatedDate.getTime() + cycleIndex * cycleWithGapDuration
      );
      const cycleEndTime = new Date(cycleStartTime.getTime() + 60 * 60 * 1000);
      const difference = cycleEndTime.getTime() - now.getTime();

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [productUpdatedAt, compareAtPrice]);

  if (!compareAtPrice || timeLeft.hours + timeLeft.minutes + timeLeft.seconds === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 px-4 py-2 rounded-lg mt-2"
    >
      <FaFire className="text-orange-500 animate-pulse" />
      <span className="text-orange-400 font-semibold text-sm">
        Sale ends in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </motion.div>
  );
};

// ✅ Main Product Detail Component
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantNode | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentImages, setCurrentImages] = useState<ImageEdge[]>([]);

  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching product details for ID:", productId);

      const query = `
        {
          product(id: "gid://shopify/Product/${productId}") {
            id
            title
            description
            descriptionHtml
            vendor
            productType
            tags
            createdAt
            updatedAt
            availableForSale
            totalInventory
            seo {
              title
              description
            }
            options {
              name
              values
            }
            images(first: 50) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                  sku
                  weight
                  weightUnit
                  barcode
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      `;

      const response = await client.request(query);

      if (response.errors) {
        console.error("❌ GraphQL Errors:", response.errors);
        setError(`Failed to load product: ${JSON.stringify(response.errors)}`);
        return;
      }

      if (!response.data?.product) {
        console.warn("⚠️ Product not found");
        setError("Product not found");
        return;
      }

      const fetchedProduct = response.data.product;
      console.log("✅ Product fetched successfully:", fetchedProduct);
      setProduct(fetchedProduct);

      if (fetchedProduct.variants.edges.length > 0) {
        const firstVariant = fetchedProduct.variants.edges[0].node;
        setSelectedVariant(firstVariant);

        const initialOptions: Record<string, string> = {};
        firstVariant.selectedOptions.forEach((opt: { name: string; value: string }) => {
          initialOptions[opt.name] = opt.value;
        });
        setSelectedOptions(initialOptions);
        updateImagesForVariant(firstVariant, fetchedProduct);
      }

      setError(null);
    } catch (err: any) {
      console.error("❌ Fetch Error:", err);
      setError(`Failed to load product: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const updateImagesForVariant = (variant: VariantNode, prod: Product) => {
    // Filter images: only show images that belong to this variant
    const variantImages: ImageEdge[] = [];
    
    // Add variant's primary image first
    if (variant.image?.url) {
      variantImages.push({
        node: {
          url: variant.image.url,
          altText: variant.image.altText || `${prod.title} - ${variant.title}`,
        },
      });
    }

    // Find all product images that match this variant's options
    // (In Shopify, images can be associated with variants)
    prod.images.edges.forEach((imgEdge) => {
      const imgUrl = imgEdge.node.url;
      // Check if this image is already added as variant primary
      const alreadyAdded = variantImages.some(v => v.node.url === imgUrl);
      
      // You might want to filter based on variant options in image alt text or tags
      // For now, we only show the variant's assigned image
      // If you need more complex logic, add it here
    });

    // If no variant-specific images, fall back to first product image
    if (variantImages.length === 0 && prod.images.edges.length > 0) {
      variantImages.push(prod.images.edges[0]);
    }

    setCurrentImages(variantImages);
    setSelectedImage(0);
  };

  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newOptions);

    const matchingVariant = product?.variants.edges.find((v) =>
      v.node.selectedOptions.every((opt) => newOptions[opt.name] === opt.value)
    );

    if (matchingVariant && product) {
      setSelectedVariant(matchingVariant.node);
      updateImagesForVariant(matchingVariant.node, product);
    }
  };

  const getColorClass = (color: string) => {
    const colorLower = color.toLowerCase();
    const colorMap: { [key: string]: string } = {
      black: "bg-black",
      white: "bg-white",
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      gray: "bg-gray-500",
      grey: "bg-gray-500",
      brown: "bg-amber-700",
      beige: "bg-amber-200",
      navy: "bg-blue-900",
      orange: "bg-orange-500",
    };
    return colorMap[colorLower] || "bg-gradient-to-br from-[#e2c299] to-[#d4b589]";
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant?.availableForSale) {
      return;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      description: product.description,
      image: currentImages[selectedImage]?.node.url || "",
      options: selectedOptions,
      quantity: quantity,
      price: parseFloat(selectedVariant.price.amount),
      compareAtPrice: selectedVariant.compareAtPrice
        ? parseFloat(selectedVariant.compareAtPrice.amount)
        : undefined,
      vendor: product.vendor,
      productType: product.productType,
      sku: selectedVariant.sku,
      availableForSale: selectedVariant.availableForSale,
      quantityAvailable: selectedVariant.quantityAvailable,
    });
  };

  const discountPercentage =
    selectedVariant?.compareAtPrice && selectedVariant?.price
      ? Math.round(
          ((parseFloat(selectedVariant.compareAtPrice.amount) -
            parseFloat(selectedVariant.price.amount)) /
            parseFloat(selectedVariant.compareAtPrice.amount)) *
            100
        )
      : 0;

  const isOutOfStock =
    !selectedVariant?.availableForSale ||
    (selectedVariant.quantityAvailable !== undefined &&
      selectedVariant.quantityAvailable <= 0);
  const isLowStock =
    selectedVariant?.quantityAvailable !== undefined &&
    selectedVariant.quantityAvailable > 0 &&
    selectedVariant.quantityAvailable <= 5;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#e2c299] mx-auto mb-4"></div>
          <p
            className="text-[#f5f5f5] text-xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center p-10 bg-[#1a0f0b]/90 backdrop-blur-xl rounded-2xl border border-[#e2c299]/30 shadow-2xl max-w-2xl w-full"
        >
          <h2
            className="text-[#e2c299] text-3xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {error || "Product Not Found"}
          </h2>
          <Link href="/product">
            <motion.button
              whileHover={{ backgroundColor: "#e2c299", color: "#1a0f0b" }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-[#e2c299] text-[#e2c299] px-8 py-3 rounded-full font-semibold transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Back to Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#e2c299] hover:text-[#d4b589] mb-8 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <FaArrowLeft />
          <span>Back to Products</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Images - Now in Container */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-2xl p-6"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-[#2b1e1e] to-black rounded-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {currentImages.length > 0 && (
                  <motion.div
                    key={`${selectedVariant?.id}-${selectedImage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={currentImages[selectedImage].node.url}
                      alt={currentImages[selectedImage].node.altText || product.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev > 0 ? prev - 1 : currentImages.length - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev < currentImages.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercentage > 0 && (
                  <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                    -{discountPercentage}% OFF
                  </div>
                )}
                {isOutOfStock && (
                  <div className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                    OUT OF STOCK
                  </div>
                )}
                {isLowStock && !isOutOfStock && (
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-lg">
                    <FaFire />
                    Only {selectedVariant?.quantityAvailable} left!
                  </div>
                )}
              </div>

              {/* Action Icons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                >
                  <FaHeart />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                >
                  <FaShare />
                </motion.button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {currentImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {currentImages.map((image, index) => (
                  <motion.button
                    key={`thumb-${selectedVariant?.id}-${index}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-[#e2c299] ring-2 ring-[#e2c299]/30"
                        : "border-[#e2c299]/20 hover:border-[#e2c299]/50"
                    }`}
                  >
                    <Image
                      src={image.node.url}
                      alt={image.node.altText || `Thumbnail ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="100px"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[#f5f5f5]/60">
              <Link href="/product" className="hover:text-[#e2c299] transition-colors">
                Products
              </Link>
              <span>›</span>
              {product.productType && (
                <>
                  <span className="text-[#e2c299]">{product.productType}</span>
                  <span>›</span>
                </>
              )}
              <span className="text-[#f5f5f5]/90 truncate">{product.title}</span>
            </div>

            {/* Vendor Only (Rating Removed) */}
            {product.vendor && (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span className="text-[#e2c299] font-semibold text-lg">
                  by {product.vendor}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-4xl lg:text-5xl font-bold text-[#f5f5f5] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {product.title}
            </h1>

            {/* Price & Timer */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span
                  className="text-5xl font-bold text-[#e2c299]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  ${parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
                </span>
                {selectedVariant?.compareAtPrice && (
                  <>
                    <span
                      className="text-2xl text-[#f5f5f5]/30 line-through"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ${parseFloat(selectedVariant.compareAtPrice.amount).toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Sale Timer Below Price */}
              <SaleTimer
                productUpdatedAt={product.updatedAt || product.createdAt}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>

            {/* Short Description */}
            {product.description && (
              <p
                className="text-[#f5f5f5]/70 leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {product.description.slice(0, 200)}
                {product.description.length > 200 && "..."}
              </p>
            )}

            {/* Availability Display - Fixed to show correct quantity */}
            <div className="bg-[#1a0f0b]/50 border border-[#e2c299]/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCheckCircle
                    className={`text-xl ${
                      isOutOfStock ? "text-red-400" : "text-green-400"
                    }`}
                  />
                  <div>
                    <h4
                      className="text-[#f5f5f5] font-semibold"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Availability
                    </h4>
                    <p
                      className={`text-sm font-bold ${
                        isOutOfStock ? "text-red-400" : "text-green-400"
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {isOutOfStock
                        ? "Out of Stock"
                        : selectedVariant?.quantityAvailable !== undefined
                        ? `${selectedVariant.quantityAvailable} units in stock`
                        : "In Stock"}
                    </p>
                  </div>
                </div>
                {isLowStock && !isOutOfStock && (
                  <div className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-lg">
                    <span className="text-orange-400 text-xs font-bold">
                      Low Stock!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Options Section */}
            <div className="space-y-6 border-t border-b border-[#e2c299]/10 py-6">
              {/* Other Options (Color, Size, etc.) */}
              {product.options.map((option) => (
                <div key={option.name}>
                  <label
                    className="block text-[#f5f5f5] font-semibold mb-3 text-lg"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {option.name}
                    {selectedOptions[option.name] && (
                      <span className="text-[#e2c299] ml-2">
                        - {selectedOptions[option.name]}
                      </span>
                    )}
                  </label>

                  {option.name.toLowerCase() === "color" ? (
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((value) => (
                        <motion.button
                          key={value}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`w-12 h-12 rounded-full ${getColorClass(
                            value
                          )} border-4 ${
                            selectedOptions[option.name] === value
                              ? "border-[#e2c299] ring-4 ring-[#e2c299]/30"
                              : "border-[#f5f5f5]/20 hover:border-[#e2c299]/50"
                          } transition-all shadow-lg`}
                          title={value}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((value) => (
                        <motion.button
                          key={value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all ${
                            selectedOptions[option.name] === value
                              ? "bg-[#e2c299]/20 text-[#e2c299] border-[#e2c299]"
                              : "bg-[#e2c299]/5 text-[#f5f5f5]/70 border-[#e2c299]/20 hover:bg-[#e2c299]/10 hover:border-[#e2c299]/50"
                          }`}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {value}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Quantity */}
              <div>
                <label
                  className="block text-[#f5f5f5] font-semibold mb-3 text-lg"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="bg-[#e2c299]/10 hover:bg-[#e2c299]/20 text-[#e2c299] border border-[#e2c299]/30 w-12 h-12 rounded-lg font-bold text-xl transition-all"
                  >
                    -
                  </motion.button>
                  <span
                    className="text-2xl font-bold text-[#f5f5f5] w-16 text-center"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={
                      selectedVariant?.quantityAvailable !== undefined &&
                      quantity >= selectedVariant.quantityAvailable
                    }
                    className="bg-[#e2c299]/10 hover:bg-[#e2c299]/20 text-[#e2c299] border border-[#e2c299]/30 w-12 h-12 rounded-lg font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </motion.button>
                  {selectedVariant?.quantityAvailable !== undefined && (
                    <span
                      className="text-sm text-[#f5f5f5]/50"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      (Max: {selectedVariant.quantityAvailable})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              isOutOfStock={isOutOfStock}
              className="w-full"
            />

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a0f0b]/50 border border-[#e2c299]/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaTruck className="text-[#e2c299] text-xl" />
                  <h4
                    className="text-[#f5f5f5] font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Free Shipping
                  </h4>
                </div>
                <p
                  className="text-[#f5f5f5]/60 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  On orders over \$50
                </p>
              </div>

              <div className="bg-[#1a0f0b]/50 border border-[#e2c299]/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaShieldAlt className="text-[#e2c299] text-xl" />
                  <h4
                    className="text-[#f5f5f5] font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Secure Payment
                  </h4>
                </div>
                <p
                  className="text-[#f5f5f5]/60 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  100% secure checkout
                </p>
              </div>

              <div className="bg-[#1a0f0b]/50 border border-[#e2c299]/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaClock className="text-[#e2c299] text-xl" />
                  <h4
                    className="text-[#f5f5f5] font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Fast Delivery
                  </h4>
                </div>
                <p
                  className="text-[#f5f5f5]/60 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  2-5 business days
                </p>
              </div>

              <div className="bg-[#1a0f0b]/50 border border-[#e2c299]/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaLeaf className="text-[#e2c299] text-xl" />
                  <h4
                    className="text-[#f5f5f5] font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Eco-Friendly
                  </h4>
                </div>
                <p
                  className="text-[#f5f5f5]/60 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Sustainable materials
                </p>
              </div>
            </div>

  
          </motion.div>
        </div>

        {/* Full Description Section */}
        {product.descriptionHtml && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-2xl p-8"
          >
            <h2
              className="text-[#e2c299] text-3xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Complete Product Description
            </h2>
            <div
              className="text-[#f5f5f5]/70 prose prose-invert max-w-none leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </motion.div>
        )}
      </div>

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

        .prose h1, .prose h2, .prose h3 {
          color: #e2c299;
        }

        .prose p {
          color: rgba(245, 245, 245, 0.7);
        }

        .prose a {
          color: #e2c299;
          text-decoration: underline;
        }

        .prose a:hover {
          color: #d4b589;
        }

        .prose ul, .prose ol {
          color: rgba(245, 245, 245, 0.7);
        }

        .prose strong {
          color: #f5f5f5;
        }
      `}</style>
    </div>
  );
}