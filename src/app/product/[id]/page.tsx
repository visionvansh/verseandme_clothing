"use client";

import { use, useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import client from "@/lib/shopify";
import Link from "next/link";
import Image from "next/image";

// Define interfaces for Shopify data
interface Price {
  amount: string;
  currencyCode: string;
}

interface VariantNode {
  id: string;
  title: string;
  price: Price;
  availableForSale: boolean;
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

interface Product {
  id: string;
  title: string;
  description: string;
  images: { edges: ImageEdge[] };
  variants: { edges: VariantEdge[] };
}

interface CrossParticleProps {
  x: number;
  y: number;
  z: number;
  size: number;
}

const CrossParticle: React.FC<CrossParticleProps> = ({ x, y, z, size }) => (
  <motion.svg
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: `translateZ(${z}px) scale(${1 + z / 50})`,
      width: `${size}rem`,
      height: `${size}rem`,
      filter: `drop-shadow(0 0 4px rgba(255, 255, 255, 0.6)) blur(${Math.abs(z) / 15}px)`,
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    animate={{
      opacity: [0.1, 0.3, 0.1],
      rotate: [0, 15, -15, 0],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

// Hardcoded Shopify product ID for testing
const HARDCODED_PRODUCT_ID = "123456789"; // Replace with a valid Shopify product ID

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React's use() hook
  const resolvedParams = use(params);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantNode | null>(null);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; z: number; size: number; speed: number }[]
  >([]);
  const [zoomStyle, setZoomStyle] = useState({});
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const yTransform = useTransform(scrollY, [0, 300], [0, 10]);

  // Use hardcoded ID for testing, fallback to params.id
  const shopifyId = `gid://shopify/Product/${HARDCODED_PRODUCT_ID || resolvedParams.id}`;

  useEffect(() => {
    console.log("ProductDetail mounted with ID:", shopifyId);

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.6 + 0.3,
      speed: Math.random() * 0.1 + 0.05,
    }));
    setParticles(newParticles);

    const particleInterval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? -10 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
    }, 60);

    async function fetchProduct() {
      try {
        const query = `
          {
            product(id: "${shopifyId}") {
              id
              title
              description
              images(first: 3) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        `;
        const response = await client.request(query);
        console.log("Shopify product response:", JSON.stringify(response, null, 2));

        if (response.errors) {
          console.error("GraphQL Errors for productId:", shopifyId, response.errors);
          setError("Failed to fetch product data. Check console for details.");
          return;
        }

        if (!response.data || !response.data.product) {
          console.error("Product not found for ID:", shopifyId);
          setError("Product not found. Verify the product ID.");
          return;
        }

        setProduct(response.data.product);
        setSelectedVariant(response.data.product.variants.edges[0]?.node || null);
        console.log("Product fetched in ProductDetail:", response.data.product);
      } catch (err) {
        console.error("Fetch Error for productId:", shopifyId, err);
        setError("An error occurred while fetching the product.");
      }
    }
    fetchProduct();

    return () => clearInterval(particleInterval);
  }, [shopifyId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setZoomStyle({
      transform: `scale(2)`,
      transformOrigin: `${xPercent}% ${yPercent}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center" });
  };

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="min-h-screen bg-[#1a0f0b] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-center p-6 bg-[#1a0f0b] rounded-xl border border-gray-700"
        >
          <p className="text-lg">{error}</p>
          <Link href="/product">
            <button
              className="mt-4 border-[1px] border-white text-white px-6 py-3 rounded-full font-medium text-base hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Back to Collection
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    console.log("Rendering loading state");
    return (
      <div className="min-h-screen bg-[#1a0f0b] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-center p-6 bg-[#1a0f0b] rounded-xl"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  console.log("Rendering product:", product);

  return (
    <div className="min-h-screen bg-[#1a0f0b] py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {particles.map((particle) => (
          <CrossParticle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            z={particle.z}
            size={particle.size}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2 py-1 rounded-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        † Limited
      </motion.div>

      <motion.div
        className="w-full max-w-6xl mx-auto px-4 md:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ y: yTransform }}
      >
        <div className="bg-[#1a0f0b] rounded-xl overflow-hidden shadow-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            <motion.div
              className="relative overflow-hidden rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="relative w-full h-auto"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                ref={imageRef}
              >
                <Image
                  src={product.images.edges[0]?.node.url || "/pr4.png"}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain transition-transform duration-200"
                  style={{ maxHeight: "500px", ...zoomStyle }}
                  onError={() => console.error("Image failed to load:", product.images.edges[0]?.node.url || "/pr4.png")}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.15 }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className="text-white text-7xl font-bold"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    †
                  </span>
                </motion.div>
              </div>
              {product.images.edges.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  {product.images.edges.map((image, index) => (
                    <motion.div
                      key={index}
                      className="relative w-16 h-16 rounded-md cursor-pointer overflow-hidden"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        setProduct({
                          ...product,
                          images: { edges: [image, ...product.images.edges.filter((_, i) => i !== index)] },
                        });
                      }}
                    >
                      <Image
                        src={image.node.url}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            <div className="flex flex-col justify-center space-y-6">
              <motion.h1
                className="text-white text-3xl md:text-4xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {product.title}
              </motion.h1>
              <motion.p
                className="text-gray-200 text-base md:text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
              >
                {product.description}
              </motion.p>
              <motion.p
                className="text-white text-xl md:text-2xl font-extrabold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                ${parseFloat(selectedVariant?.price.amount || product.variants.edges[0].node.price.amount).toFixed(0)}{" "}
                {selectedVariant?.price.currencyCode || product.variants.edges[0].node.price.currencyCode}
              </motion.p>
              {product.variants.edges.length > 1 && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label
                    className="text-white text-sm font-bold"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Select Variant
                  </label>
                  <select
                    className="w-full p-2 rounded-md bg-[#2a1f1b] text-white border border-gray-700"
                    value={selectedVariant?.id || ""}
                    onChange={(e) => {
                      const variant = product.variants.edges.find(({ node }) => node.id === e.target.value)?.node;
                      if (variant) setSelectedVariant(variant);
                    }}
                  >
                    {product.variants.edges.map(({ node }) => (
                      <option key={node.id} value={node.id} disabled={!node.availableForSale}>
                        {node.title} {node.availableForSale ? "" : "(Out of Stock)"}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
              <motion.div
                className="flex flex-col md:flex-row gap-3 sticky top-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <button
                  className="bg-[#1a0f0b] text-white px-6 py-3 rounded-full font-bold text-lg w-full hover:bg-white hover:text-black transition-all duration-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  onClick={() => console.log("Add to Cart clicked", selectedVariant || product.variants.edges[0].node)}
                >
                  Add to Cart
                </button>
                <Link href="/product">
                  <button
                    className="border-[1px] border-white text-white px-6 py-3 rounded-full font-medium text-base w-full hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Back to Collection
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p
              className="text-white text-lg md:text-xl italic"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
            VerseAndMe is not a brand. It&apos;s a calling.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800&family=Playfair+Display:wght@400;700&display=swap');

        @media (max-width: 768px) {
          .max-w-6xl {
            max-width: 90%;
          }
          .text-3xl {
            font-size: 1.875rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .text-xl {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
}