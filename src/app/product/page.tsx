"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useCart } from "@/context/CartContext";
import client from "@/lib/shopify";
import Link from "next/link";
import Image from "next/image";
import {
  FaShoppingCart,
  FaSearch,
  FaTag,
  FaFire,
  FaCheckCircle,
  FaChevronRight,
} from "react-icons/fa";

// Define interfaces for Shopify data
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
  };
}

interface VariantEdge {
  node: VariantNode;
}

interface ImageNode {
  url: string;
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
  images: { edges: ImageEdge[] };
  variants: { edges: VariantEdge[] };
  options: ProductOption[];
  vendor?: string;
  productType?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductEdge {
  node: Product;
}

// ✅ Animated Add to Cart Button
const AddToCartButton = ({
  onClick,
  disabled,
  isOutOfStock,
  className = "",
  compact = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  isOutOfStock?: boolean;
  className?: string;
  compact?: boolean;
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
      className={`flex items-center justify-center gap-2 ${
        compact ? "px-2 py-1.5" : "px-3 py-2"
      } rounded-lg ${compact ? "text-[10px]" : "text-xs"} font-semibold transition-all duration-300 ${
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
            className="flex items-center gap-1.5"
          >
            <FaShoppingCart className={compact ? "text-[10px]" : "text-sm"} />
            <span>{isOutOfStock ? "Out of Stock" : compact ? "Add" : "Add to Cart"}</span>
          </motion.div>
        )}
        {status === "adding" && (
          <motion.div
            key="adding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaShoppingCart className={compact ? "text-[10px]" : "text-sm"} />
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
            className="flex items-center gap-1.5"
          >
            <FaCheckCircle className={compact ? "text-[10px]" : "text-sm"} />
            <span>Added!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const ProductSkeleton = () => (
  <motion.div
    className="relative rounded-xl overflow-hidden border border-[#e2c299]/20 w-full mx-auto bg-[#1a0f0b]/90 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="animate-pulse">
      <div className="w-full aspect-[4/3] bg-[#2b1e1e]/50" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[#2b1e1e]/50 rounded w-3/4" />
        <div className="h-3 bg-[#2b1e1e]/50 rounded w-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-[#2b1e1e]/50 rounded w-20" />
          <div className="h-8 bg-[#2b1e1e]/50 rounded w-24" />
        </div>
      </div>
    </div>
  </motion.div>
);

const MobileProductListSkeleton = () => (
  <motion.div
    className="relative rounded-xl overflow-hidden border border-[#e2c299]/20 w-full bg-[#1a0f0b]/90 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="animate-pulse flex gap-3 p-3">
      <div className="w-28 h-32 bg-[#2b1e1e]/50 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#2b1e1e]/50 rounded w-3/4" />
        <div className="h-3 bg-[#2b1e1e]/50 rounded w-full" />
        <div className="h-6 bg-[#2b1e1e]/50 rounded w-20" />
      </div>
    </div>
  </motion.div>
);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        console.log("🔍 Fetching products from Shopify...");

        const query = `
          {
            products(first: 20) {
              edges {
                node {
                  id
                  title
                  description
                  vendor
                  productType
                  tags
                  createdAt
                  updatedAt
                  options {
                    name
                    values
                  }
                  images(first: 5) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                  variants(first: 20) {
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
                        selectedOptions {
                          name
                          value
                        }
                        image {
                          url
                        }
                      }
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
          setError(`GraphQL Error: ${JSON.stringify(response.errors)}`);
          return;
        }

        if (
          !response.data?.products?.edges ||
          response.data.products.edges.length === 0
        ) {
          console.warn("⚠️ No products found in store");
          setError("No products available in the store yet.");
          return;
        }

        const fetchedProducts = response.data.products.edges.map(
          ({ node }: ProductEdge) => node
        );
        console.log(
          "✅ Products fetched successfully:",
          fetchedProducts.length
        );
        setProducts(fetchedProducts);
        setError(null);
      } catch (err: any) {
        console.error("❌ Fetch Error:", err);
        setError(`Failed to fetch products: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center p-10 bg-[#1a0f0b]/90 backdrop-blur-xl rounded-2xl border border-[#e2c299]/30 shadow-2xl max-w-2xl mx-4"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#e2c299]/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#e2c299]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2
            className="text-[#e2c299] text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Oops! Something went wrong
          </h2>
          <p
            className="text-[#f5f5f5]/80 text-base md:text-lg mb-6"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {error}
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ backgroundColor: "#e2c299", color: "#1a0f0b" }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-[#e2c299] text-[#e2c299] px-8 py-3 rounded-full font-semibold text-base transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Return Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <motion.div
        className="relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ opacity: headerOpacity }}
      >
        <motion.div
          className="mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative mb-6 sm:mb-8">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black tracking-tight">
              <span className="inline-block text-[#f5f5f5]">Our</span>
              <span className="inline-block text-[#e2c299] ml-3 sm:ml-4 md:ml-6">
                Collection
              </span>
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-1 sm:h-1.5 bg-gradient-to-r from-[#e2c299] to-transparent mt-2 sm:mt-3 rounded-full"
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto"
          >
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e2c299]/60 text-base sm:text-lg" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a0f0b]/80 border border-[#e2c299]/30 rounded-lg pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-[#f5f5f5] placeholder-[#f5f5f5]/50 focus:border-[#e2c299] focus:outline-none text-sm sm:text-base transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          </motion.div>
        </motion.div>

        {loading ? (
          <>
            {/* Desktop Grid Skeleton */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
            {/* Mobile List Skeleton */}
            <div className="flex sm:hidden flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <MobileProductListSkeleton key={i} />
              ))}
            </div>
          </>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16 md:py-20 px-4"
          >
            <FaShoppingCart className="text-[#e2c299]/30 text-4xl sm:text-5xl md:text-6xl mx-auto mb-4 sm:mb-6" />
            <h2
              className="text-[#f5f5f5] text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              No Products Found
            </h2>
            <p
              className="text-[#f5f5f5]/60 text-base sm:text-lg mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Check back soon for new arrivals"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Desktop Grid View */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCardComponent
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>

            {/* Mobile List View (Amazon Style) */}
            <div className="flex sm:hidden flex-col gap-3">
              {filteredProducts.map((product, index) => (
                <MobileProductListItem
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </>
        )}

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p
            className="text-[#e2c299] text-xl md:text-2xl italic px-6 py-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            VerseAndMe is not a brand. It&apos;s a calling.
          </p>
        </motion.div>
      </motion.div>

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

// ✅ UPDATED: Mobile List Item Component with ALL Details
function MobileProductListItem({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [imageError, setImageError] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<VariantNode | null>(null);

  const { addToCart } = useCart();

  const colorOption = product.options?.find(
    (opt) => opt.name.toLowerCase() === "color"
  );
  const colors = colorOption?.values.slice(0, 5) || [];

  const sizeOption = product.options?.find(
    (opt) => opt.name.toLowerCase() === "size"
  );
  const sizes = sizeOption?.values.slice(0, 5) || [];

  const variantCount = product.variants.edges.length;

  useEffect(() => {
    const initialImage = product.images.edges[0]?.node.url || "";
    const initialColor = colors.length > 0 ? colors[0] : "";
    const initialSize = sizes.length > 0 ? sizes[0] : "";
    const firstVariant = product.variants.edges[0]?.node || null;

    setCurrentImage(initialImage);
    setSelectedColor(initialColor);
    setSelectedSize(initialSize);
    setCurrentVariant(firstVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (!selectedColor && !selectedSize) return;

    let matchingVariant = product.variants.edges.find((v) => {
      const hasColor = v.node.selectedOptions.some(
        (opt) =>
          opt.name.toLowerCase() === "color" &&
          opt.value.toLowerCase() === selectedColor?.toLowerCase()
      );
      const hasSize = v.node.selectedOptions.some(
        (opt) =>
          opt.name.toLowerCase() === "size" &&
          opt.value.toLowerCase() === selectedSize?.toLowerCase()
      );
      return hasColor && hasSize;
    });

    if (!matchingVariant && selectedColor) {
      matchingVariant = product.variants.edges.find((v) =>
        v.node.selectedOptions.some(
          (opt) =>
            opt.name.toLowerCase() === "color" &&
            opt.value.toLowerCase() === selectedColor.toLowerCase()
        )
      );
    }

    if (matchingVariant) {
      setCurrentVariant(matchingVariant.node);
      if (matchingVariant.node.image?.url) {
        setCurrentImage(matchingVariant.node.image.url);
      }
    }
  }, [selectedColor, selectedSize, product.variants.edges]);

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (
      !currentVariant?.availableForSale ||
      (currentVariant.quantityAvailable !== undefined &&
        currentVariant.quantityAvailable <= 0)
    ) {
      return;
    }

    setIsAddingToCart(true);

    addToCart({
      productId: product.id,
      variantId: currentVariant.id,
      title: product.title,
      description: product.description,
      image: currentImage,
      options: {
        ...(selectedColor && { Color: selectedColor }),
        ...(selectedSize && { Size: selectedSize }),
      },
      quantity: 1,
      price: parseFloat(currentVariant.price.amount),
      compareAtPrice: currentVariant.compareAtPrice
        ? parseFloat(currentVariant.compareAtPrice.amount)
        : undefined,
      vendor: product.vendor,
      productType: product.productType,
      availableForSale: currentVariant.availableForSale,
      quantityAvailable: currentVariant.quantityAvailable,
    });

    setIsAddingToCart(false);
  };

  const price = currentVariant?.price;
  const compareAtPrice = currentVariant?.compareAtPrice;

  const discountPercentage =
    compareAtPrice && price
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100
        )
      : 0;

  const isOutOfStock =
    !currentVariant?.availableForSale ||
    (currentVariant.quantityAvailable !== undefined &&
      currentVariant.quantityAvailable <= 0);

  const isLowStock =
    currentVariant?.quantityAvailable !== undefined &&
    currentVariant.quantityAvailable > 0 &&
    currentVariant.quantityAvailable <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={`relative bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl overflow-hidden ${
          isOutOfStock ? "opacity-75" : ""
        }`}
      >
        <div className="flex gap-3 p-3">
          {/* Product Image */}
          <Link href={`/product/${product.id.split("/").pop()}`} className="flex-shrink-0">
            <div className="relative w-28 h-32 bg-gradient-to-br from-[#2b1e1e] to-black rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                {currentImage && !imageError ? (
                  <Image
                    src={currentImage}
                    alt={product.title}
                    fill
                    unoptimized
                    className={`object-cover ${isOutOfStock ? "grayscale" : ""}`}
                    onError={() => setImageError(true)}
                    sizes="112px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaShoppingCart className="text-[#e2c299] text-2xl opacity-30" />
                  </div>
                )}
              </AnimatePresence>

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-bold">
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Section */}
            <div className="flex-1">
              {/* Product Type Tag */}
              {product.productType && (
                <div className="flex items-center gap-1 mb-1">
                  <FaTag className="text-[8px] text-[#e2c299]" />
                  <span
                    className="text-[9px] text-[#e2c299]/80 font-medium uppercase tracking-wide"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {product.productType}
                  </span>
                </div>
              )}

              {/* Title */}
              <Link href={`/product/${product.id.split("/").pop()}`}>
                <h3
                  className="text-[#f5f5f5] text-sm font-bold mb-1 line-clamp-2 leading-tight hover:text-[#e2c299] transition-colors"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {product.title}
                </h3>
              </Link>

              {/* Description */}
              <p
                className="text-[#f5f5f5]/60 text-[10px] mb-1.5 line-clamp-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {compareAtPrice && !isOutOfStock ? (
                  <>
                    <span
                      className="text-[#e2c299] font-bold text-base"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ${parseFloat(price?.amount || "0").toFixed(2)}
                    </span>
                    <span
                      className="text-[#f5f5f5]/30 line-through text-xs"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ${parseFloat(compareAtPrice.amount).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/30">
                      {discountPercentage}% OFF
                    </span>
                  </>
                ) : (
                  <span
                    className="text-[#e2c299] font-bold text-base"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    ${parseFloat(price?.amount || "0").toFixed(2)}
                  </span>
                )}
              </div>

              {/* Low Stock Warning */}
              {isLowStock && !isOutOfStock && (
                <div className="flex items-center gap-1 mb-2">
                  <FaFire className="text-[9px] text-orange-500" />
                  <span className="text-[9px] text-orange-400 font-semibold">
                    Only {currentVariant?.quantityAvailable} left!
                  </span>
                </div>
              )}

              {/* Color Options */}
              {colors.length > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] text-[#f5f5f5]/50">Colors:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {colors.map((color, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleColorClick(color)}
                        className={`w-3.5 h-3.5 rounded-full ${getColorClass(
                          color
                        )} border-2 ${
                          selectedColor === color
                            ? "border-[#e2c299] ring-1 ring-[#e2c299]/50"
                            : "border-[#f5f5f5]/30"
                        } transition-all`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Options */}
              {sizes.length > 0 && (
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="text-[9px] text-[#f5f5f5]/50">Sizes:</span>
                  {sizes.map((size, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSizeClick(size)}
                      className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${
                        selectedSize === size
                          ? "bg-[#e2c299]/20 text-[#e2c299] border-[#e2c299] font-semibold"
                          : "bg-[#e2c299]/5 text-[#f5f5f5]/70 border-[#e2c299]/20"
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Variant Count */}
              {variantCount > 1 && (
                <div className="text-[9px] text-[#f5f5f5]/50 mb-2">
                  +{variantCount} variants available
                </div>
              )}
            </div>

            {/* Bottom Section - Actions */}
            <div className="flex items-center gap-2 mt-2">
              <AddToCartButton
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                isOutOfStock={isOutOfStock}
                className="flex-1"
                compact={true}
              />

              <Link
                href={`/product/${product.id.split("/").pop()}`}
                className="flex-1"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full border border-[#e2c299]/30 text-[#e2c299] px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all active:bg-[#e2c299]/10 flex items-center justify-center gap-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span>View</span>
                  <FaChevronRight className="text-[8px]" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* Vendor Badge */}
        {product.vendor && (
          <div className="absolute top-2 right-2 bg-[#e2c299]/10 border border-[#e2c299]/30 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] text-[#e2c299] font-bold">
            {product.vendor}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ✅ Desktop Product Card Component (Red badge removed from image)
function ProductCardComponent({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [imageError, setImageError] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<VariantNode | null>(
    null
  );

  const { addToCart } = useCart();

  const colorOption = product.options?.find(
    (opt) => opt.name.toLowerCase() === "color"
  );
  const colors = colorOption?.values.slice(0, 5) || [];

  const sizeOption = product.options?.find(
    (opt) => opt.name.toLowerCase() === "size"
  );
  const sizes = sizeOption?.values.slice(0, 5) || [];

  const variantCount = product.variants.edges.length;

  useEffect(() => {
    const initialImage = product.images.edges[0]?.node.url || "";
    const initialColor = colors.length > 0 ? colors[0] : "";
    const initialSize = sizes.length > 0 ? sizes[0] : "";
    const firstVariant = product.variants.edges[0]?.node || null;

    setCurrentImage(initialImage);
    setSelectedColor(initialColor);
    setSelectedSize(initialSize);
    setCurrentVariant(firstVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return (
      colorMap[colorLower] || "bg-gradient-to-br from-[#e2c299] to-[#d4b589]"
    );
  };

  useEffect(() => {
    if (!selectedColor && !selectedSize) return;

    let matchingVariant = product.variants.edges.find((v) => {
      const hasColor = v.node.selectedOptions.some(
        (opt) =>
          opt.name.toLowerCase() === "color" &&
          opt.value.toLowerCase() === selectedColor?.toLowerCase()
      );
      const hasSize = v.node.selectedOptions.some(
        (opt) =>
          opt.name.toLowerCase() === "size" &&
          opt.value.toLowerCase() === selectedSize?.toLowerCase()
      );
      return hasColor && hasSize;
    });

    if (!matchingVariant && selectedColor) {
      matchingVariant = product.variants.edges.find((v) =>
        v.node.selectedOptions.some(
          (opt) =>
            opt.name.toLowerCase() === "color" &&
            opt.value.toLowerCase() === selectedColor.toLowerCase()
        )
      );
    }

    if (!matchingVariant && selectedSize) {
      matchingVariant = product.variants.edges.find((v) =>
        v.node.selectedOptions.some(
          (opt) =>
            opt.name.toLowerCase() === "size" &&
            opt.value.toLowerCase() === selectedSize.toLowerCase()
        )
      );
    }

    if (matchingVariant) {
      setCurrentVariant(matchingVariant.node);

      if (matchingVariant.node.image?.url) {
        setCurrentImage(matchingVariant.node.image.url);
      } else {
        const colorIndex = colors.indexOf(selectedColor || "");
        if (colorIndex >= 0 && colorIndex < product.images.edges.length) {
          setCurrentImage(product.images.edges[colorIndex].node.url);
        } else if (product.images.edges[0]) {
          setCurrentImage(product.images.edges[0].node.url);
        }
      }
    } else {
      setCurrentVariant(product.variants.edges[0]?.node || null);
    }
  }, [selectedColor, selectedSize, product.variants.edges, product.images.edges, colors]);

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!currentVariant?.availableForSale || (currentVariant.quantityAvailable !== undefined && currentVariant.quantityAvailable <= 0)) {
      return;
    }

    setIsAddingToCart(true);

    addToCart({
      productId: product.id,
      variantId: currentVariant.id,
      title: product.title,
      description: product.description,
      image: currentImage,
      options: {
        ...(selectedColor && { Color: selectedColor }),
        ...(selectedSize && { Size: selectedSize }),
      },
      quantity: 1,
      price: parseFloat(currentVariant.price.amount),
      compareAtPrice: currentVariant.compareAtPrice
        ? parseFloat(currentVariant.compareAtPrice.amount)
        : undefined,
      vendor: product.vendor,
      productType: product.productType,
      availableForSale: currentVariant.availableForSale,
      quantityAvailable: currentVariant.quantityAvailable,
    });

    setIsAddingToCart(false);
  };

  const price = currentVariant?.price;
  const compareAtPrice = currentVariant?.compareAtPrice;

  const discountPercentage =
    compareAtPrice && price
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100
        )
      : 0;

  const isOutOfStock =
    !currentVariant?.availableForSale ||
    (currentVariant.quantityAvailable !== undefined &&
      currentVariant.quantityAvailable <= 0);
  const isLowStock =
    currentVariant?.quantityAvailable !== undefined &&
    currentVariant.quantityAvailable > 0 &&
    currentVariant.quantityAvailable <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer"
    >
      <div
        className={`relative bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl overflow-hidden hover:border-[#e2c299]/40 transition-all duration-300 hover:-translate-y-1 ${
          isOutOfStock ? "opacity-75" : ""
        }`}
      >
        <div className="relative aspect-[4/3] bg-gradient-to-br from-[#2b1e1e] to-black overflow-hidden">
          <AnimatePresence mode="wait">
            {currentImage && !imageError ? (
              <motion.div
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Image
                  src={currentImage}
                  alt={product.title}
                  fill
                  unoptimized
                  className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                    isOutOfStock ? "grayscale" : ""
                  }`}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index < 4}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2b1e1e] to-black">
                <FaShoppingCart className="text-[#e2c299] text-3xl md:text-4xl opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
            )}
          </AnimatePresence>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-2xl">
                OUT OF STOCK
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute top-2 left-2 right-2 flex items-start justify-end gap-2 z-20">
            {product.productType && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#e2c299] text-[#1a0f0b] px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"
              >
                <FaTag className="text-xs" />
                <span className="hidden sm:inline">{product.productType}</span>
              </motion.div>
            )}
          </div>

          {isLowStock && !isOutOfStock && (
            <div className="absolute bottom-2 left-2 bg-orange-500/90 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <FaFire className="text-xs" />
              Only {currentVariant?.quantityAvailable} left!
            </div>
          )}
        </div>

        <div className="p-3">
          <h3
            className="text-[#f5f5f5] text-sm sm:text-base font-bold mb-1 line-clamp-1 group-hover:text-[#e2c299] transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {product.title}
          </h3>

          <p
            className="text-[#f5f5f5]/60 text-xs mb-2 line-clamp-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#e2c299]/10">
            {colors.length > 0 && (
              <div className="flex items-center gap-1.5">
                {colors.map((color, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleColorClick(color)}
                    className={`w-4 h-4 rounded-full ${getColorClass(
                      color
                    )} border-2 ${
                      selectedColor === color
                        ? "border-[#e2c299] ring-2 ring-[#e2c299]/30"
                        : "border-[#f5f5f5]/20"
                    } cursor-pointer shadow-sm transition-all`}
                    title={color}
                  />
                ))}
              </div>
            )}

            {variantCount > 1 && (
              <span
                className="text-[#f5f5f5]/50 text-xs"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                +{variantCount}
              </span>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-[#e2c299]/10">
              <span
                className="text-[#f5f5f5]/50 text-xs"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Sizes:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {sizes.map((size, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSizeClick(size)}
                    className={`text-xs px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                      selectedSize === size
                        ? "bg-[#e2c299]/20 text-[#e2c299] border-[#e2c299] font-semibold"
                        : "bg-[#e2c299]/5 text-[#f5f5f5]/70 border-[#e2c299]/20 hover:bg-[#e2c299]/10"
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mb-3">
            {compareAtPrice && !isOutOfStock ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[#f5f5f5]/30 line-through text-xs"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  ${parseFloat(compareAtPrice.amount).toFixed(2)}
                </span>
                <span
                  className="text-[#e2c299] font-bold text-base sm:text-lg"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  ${parseFloat(price?.amount || "0").toFixed(2)}
                </span>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/30">
                  {discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span
                  className="text-[#e2c299] font-bold text-base sm:text-lg"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  ${parseFloat(price?.amount || "0").toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              isOutOfStock={isOutOfStock}
              className="flex-1"
            />

            <Link
              href={`/product/${product.id.split("/").pop()}`}
              className="flex-1"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full border-2 border-[#e2c299] text-[#e2c299] hover:bg-[#e2c299] hover:text-[#1a0f0b] px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                View
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}