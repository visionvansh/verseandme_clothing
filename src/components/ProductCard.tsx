
//Volumes/vision/codes/verse/my-app/src/components/ProductCard.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

interface Price {
  amount: string;
  currencyCode: string;
}

interface VariantNode {
  price: Price;
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

interface ProductCardProps {
  product: Product;
  productId: string;
}

// Placeholder images
const placeholderImages = ["/pr4.png", "/pr3.png"];

const CrossParticle = ({ x, y, z, size }: { x: number; y: number; z: number; size: number }) => (
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

const ProductCard: React.FC<ProductCardProps> = ({ product, productId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; z: number; size: number; speed: number }[]
  >([]);
  const { scrollY } = useScroll();
  const yTransform = useTransform(scrollY, [0, 300], [0, 10]);

  // Extract numeric ID from Shopify GID
  const getNumericId = (gid: string) => {
    console.log("Extracting numeric ID from:", gid);
    const match = gid.match(/Product\/(\d+)/);
    const numericId = match ? match[1] : gid;
    console.log("Numeric ID:", numericId);
    return numericId;
  };

  useEffect(() => {
    console.log("ProductCard mounted with productId:", productId);

    // Initialize particles
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 10 - 5,
      size: Math.random() * 0.6 + 0.3,
      speed: Math.random() * 0.1 + 0.05,
    }));
    setParticles(newParticles);

    // Animate particles
    const particleInterval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          const newY = p.y + p.speed;
          return {
            ...p,
            y: newY > 100 ? -10 : newY,
            x: Math.min(100, Math.max(0, p.x + (Math.random() - 0.5) * 0.1)),
            z: p.z + (Math.random() - 0.5) * 0.05,
          };
        })
      );
    }, 100);

    // Cycle images
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % placeholderImages.length);
    }, 5000);

    return () => {
      clearInterval(particleInterval);
      clearInterval(imageInterval);
    };
  }, [productId]);

  console.log("Rendering product in ProductCard:", product);

  return (
    <Link href={`/product/${getNumericId(productId)}`} passHref>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative bg-[#1a0f0b] rounded-xl overflow-hidden shadow-xl max-w-2xl w-full mx-auto cursor-pointer"
        style={{
          y: yTransform,
          background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent)",
        }}
      >
        {/* Particle Background */}
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

        {/* Limited Edition Badge */}
        <motion.div
          className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2 py-1 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          † Limited
        </motion.div>

        {/* Faith Symbol Overlay on Hover */}
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

        {/* Product Image */}
        <div className="relative w-full aspect-auto overflow-hidden p-4">
          <motion.img
            src={product.images.edges[0]?.node.url || placeholderImages[currentImageIndex]}
            alt={product.title}
            className="w-full h-auto object-contain"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{
              filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4)) brightness(1.05)",
              maxHeight: "600px",
            }}
            onError={() =>
              console.error(
                "Image failed to load:",
                product.images.edges[0]?.node.url || placeholderImages[currentImageIndex]
              )
            }
          />
        </div>

        {/* Product Details */}
        <div className="p-6 text-center space-y-4">
          <h3
            className="text-white text-xl md:text-2xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {product.title}
          </h3>
          <p
            className="text-gray-200 text-sm md:text-base"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            {product.description.substring(0, 100)}...
          </p>
          <p
            className="text-white text-lg md:text-xl font-extrabold"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ${parseFloat(product.variants.edges[0].node.price.amount).toFixed(0)}{" "}
            {product.variants.edges[0].node.price.currencyCode}
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <motion.button
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#000000" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#1a0f0b] text-white px-6 py-3 rounded-full font-bold text-lg w-full"
              style={{ fontFamily: "'Inter', sans-serif", transition: "all 0.3s" }}
            >
              Add to Cart
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                console.log("View Details button clicked!");
                const numericId = getNumericId(productId);
                console.log("Navigating to:", `/product/${numericId}`);
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              className="border-[1px] border-white text-white px-6 py-3 rounded-full font-medium text-base w-full"
              style={{ fontFamily: "'Inter', sans-serif", transition: "all 0.3s" }}
            >
              View Details
            </motion.button>
          </div>
        </div>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800&family=Playfair+Display:wght@400;700&display=swap');

          @media (max-width: 768px) {
            .max-w-2xl {
              max-width: 90%;
            }
            .text-xl {
              font-size: 1.25rem;
            }
            .text-sm {
              font-size: 0.875rem;
            }
            .text-lg {
              font-size: 1rem;
            }
          }
        `}</style>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
