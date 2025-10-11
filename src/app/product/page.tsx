"use client";

import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import client from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { FaShoppingCart, FaUser, FaBars } from "react-icons/fa";

// Define interfaces for Shopify data
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

interface ProductEdge {
  node: Product;
}

interface CrossParticleProps {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

interface HeaderCrossProps {
  x: number;
  y: number;
  size: number;
  color: string;
}

const CrossParticle: React.FC<CrossParticleProps> = ({ x, y, z, size, color }) => (
  <motion.svg
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: `translateZ(${z}px) scale(${1 + z / 50})`,
      width: `${size}rem`,
      height: `${size}rem`,
      filter: `drop-shadow(0 0 4px ${color}) blur(${Math.abs(z) / 15}px)`,
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    animate={{
      opacity: [0.2, 0.7, 0.2],
      rotate: [0, 15, -15, 0],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

const CrossSVG: React.FC<{ color: string }> = ({ color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    className="w-6 h-6"
    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
  >
    <path d="M12 2v20M2 12h20" />
  </svg>
);

const HeaderCross: React.FC<HeaderCrossProps> = ({ x, y, size, color }) => (
  <motion.svg
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}rem`,
      height: `${size}rem`,
      filter: `drop-shadow(0 0 4px ${color})`,
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(scrollY.get() > 0);
    };
    const unsubscribe = scrollY.onChange(handleScroll);
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      className="fixed w-full top-0 text-white py-2 z-50 shadow-2xl"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundColor: "transparent" }}
        animate={{ backgroundColor: isScrolled ? "#2b1e1e" : "transparent" }}
        transition={{ duration: 0.1 }}
      >
        {isScrolled && (
          <>
            <HeaderCross x={10} y={50} size={0.8} color="#f5f5f5" />
            <HeaderCross x={50} y={50} size={0.8} color="#f5f5f5" />
            <HeaderCross x={90} y={50} size={0.8} color="#f5f5f5" />
          </>
        )}
      </motion.div>
      <div className="relative z-10 container mx-auto grid grid-cols-3 items-center px-6">
        <div className="hidden md:block relative">
          <motion.button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-[#f5f5f5] p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBars className="text-lg" />
          </motion.button>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-48 bg-[#1a0f0b]/95 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-[#f5f5f5]/20"
            >
              <ul className="flex flex-col space-y-4">
                {["Home", "Shop", "About", "Lookbook", "Journal"].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item === "Shop" ? "/product" : "/"}
                      className="text-[#f5f5f5] text-lg hover:text-white transition duration-300"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        <motion.div
          className="flex justify-center"
          style={{
            filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.9))",
          }}
        >
          <Image
            src="/mainlogo.png"
            alt="Logo"
            width={80}
            height={80}
            className="h-20 w-20"
            style={{ fontFamily: "'Playfair Display', serif" }}
          />
        </motion.div>

        <div className="flex justify-end items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2"
          >
            <FaUser className="text-lg" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2 flex items-center space-x-2"
          >
            <FaShoppingCart className="text-lg" />
            <span style={{ fontFamily: "'Inter', sans-serif" }}>(0)</span>
          </motion.button>
        </div>

        <div className="md:hidden flex items-center space-x-4 justify-end col-span-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2"
          >
            <FaShoppingCart className="text-lg" />
          </motion.button>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#f5f5f5] focus:outline-none w-8 h-8"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className={`w-8 h-8 transition-opacity duration-300 ${isOpen ? "opacity-0" : "opacity-100"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <svg
              className={`w-8 h-8 absolute top-0 left-0 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </motion.button>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-4 mt-3 w-56 bg-[#1a0f0b]/95 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-[#f5f5f5]/20"
            >
              <ul className="flex flex-col space-y-4">
                {["Home", "Shop", "About", "Lookbook", "Journal"].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item === "Shop" ? "/product" : "/"}
                      className="text-[#f5f5f5] text-lg hover:text-white transition duration-300"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      onClick={() => setIsOpen(false)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; z: number; size: number; speed: number; color: string }[]
  >([]);

  useEffect(() => {
    console.log("ProductsPage mounted");

    // Initialize particles
    const particleCount = Math.floor(Math.random() * 5) + 12;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 30 - 15,
      size: Math.random() * 0.8 + 0.4,
      speed: Math.random() * 0.07 + 0.04,
      color: Math.random() > 0.5 ? "#e2c299" : "#f5f5f5",
    }));
    setParticles(newParticles);

    const particleInterval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.15,
            z: p.z + (Math.random() - 0.5) * 0.07,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
    }, 50);

    async function fetchProducts() {
      try {
        const query = `
          {
            products(first: 10) {
              edges {
                node {
                  id
                  title
                  description
                  images(first: 2) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        price {
                          amount
                          currencyCode
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
        console.log("Shopify response:", JSON.stringify(response, null, 2));

        if (response.errors) {
          console.error("GraphQL Errors:", response.errors);
          setError("Failed to fetch products. Check console for details.");
          return;
        }

        if (!response.data || !response.data.products.edges.length) {
          console.warn("No products found or empty response");
          setError("No products available.");
          return;
        }

        const fetchedProducts = response.data.products.edges.map(({ node }: ProductEdge) => node);
        console.log("Products set:", fetchedProducts);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("An error occurred while fetching products.");
      }
    }
    fetchProducts();

    return () => clearInterval(particleInterval);
  }, []);

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="min-h-screen bg-[#1a0f0b] flex items-center justify-center relative overflow-hidden">
        <Header />
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg12.png"
            alt="Background"
            fill
            className="object-cover"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="absolute inset-0 z-5 overflow-hidden">
          {particles.map((p) => (
            <CrossParticle key={`error-${p.id}`} {...p} />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-[#e2c299] text-center p-8 bg-[#1a0f0b]/80 rounded-xl border border-[#e2c299]/50 shadow-lg max-w-2xl mx-auto"
        >
          <p className="text-lg md:text-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            {error}
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#e2c299", color: "#000000" }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 border-[1px] border-[#e2c299] text-[#e2c299] px-6 py-3 rounded-full font-medium text-base transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!products.length) {
    console.log("Rendering loading state");
    return (
      <div className="min-h-screen bg-[#1a0f0b] flex items-center justify-center relative overflow-hidden">
        <Header />
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg12.png"
            alt="Background"
            fill
            className="object-cover"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="absolute inset-0 z-5 overflow-hidden">
          {particles.map((p) => (
            <CrossParticle key={`loading-${p.id}`} {...p} />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-[#e2c299] text-center p-8 bg-[#1a0f0b]/80 rounded-xl max-w-2xl mx-auto"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  console.log("Rendering products:", products);

  return (
    <div className="min-h-screen bg-[#1a0f0b] pt-24 pb-16 relative overflow-hidden">
      <Header />
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg12.png"
          alt="Background"
          fill
          className="object-cover"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        {particles.map((p) => (
          <CrossParticle key={`product-${p.id}`} {...p} />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 md:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-[#e2c299] text-4xl md:text-5xl font-bold text-center mb-12 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Our Collection
          <motion.span
            className="absolute left-0 right-0 bottom-[-8px] h-[2px] bg-[#e2c299]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
          />
        </motion.h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-16">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="relative rounded-xl overflow-hidden border border-[#e2c299]/30 max-w-2xl w-full mx-auto"
              whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(226, 194, 153, 0.4)" }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} productId={product.id} />
            </motion.div>
          ))}
        </div>
        <motion.div
          className="text-center mt-16 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p
            className="text-[#e2c299] text-lg md:text-xl italic relative"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
          VerseAndMe is not a brand. It&apos;s a calling.
            <motion.span
              className="absolute left-0 right-0 bottom-[-4px] h-[1px] bg-[#e2c299]/50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
            />
          </p>
        </motion.div>

        {/* Animated Crosses */}
        <motion.div
          className="absolute left-1/4 bottom-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CrossSVG color="#f5f5f5" />
        </motion.div>
        <motion.div
          className="absolute right-1/4 bottom-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CrossSVG color="#f5f5f5" />
        </motion.div>
      </motion.div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800&family=Playfair+Display:wght@400;700&display=swap");

        @media (max-width: 768px) {
          .max-w-2xl {
            max-width: 90%;
          }
          .text-4xl {
            font-size: 2.25rem;
            
          }
          .text-lg {
            font-size: 1.125rem;
          }
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}