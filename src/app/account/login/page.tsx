///Volumes/vision/codes/verse/my-app/src/app/account/login/page.tsx
"use client";

import { useState } from "react";
import { useCustomer } from "@/context/CustomerContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, createAccount, recoverPassword } = useCustomer();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isRecovering) {
        await recoverPassword(formData.email);
        setSuccess("Password recovery email sent! Check your inbox.");
        setIsRecovering(false);
      } else if (isSignUp) {
        await createAccount(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
        router.push("/account");
      } else {
        await login(formData.email, formData.password);
        router.push("/account");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a0f0b]/90 to-black/95 border border-[#e2c299]/20 rounded-xl p-8"
        >
          <h1 className="text-3xl font-bold text-[#e2c299] mb-6 text-center">
            {isRecovering ? "Recover Password" : isSignUp ? "Create Account" : "Sign In"}
          </h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isRecovering && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#e2c299]/30 text-white"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#e2c299]/30 text-white"
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#e2c299]/30 text-white"
            />

            {!isRecovering && (
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#e2c299]/30 text-white"
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e2c299] hover:bg-[#d4b589] text-[#1a0f0b] py-3 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {isLoading ? "Loading..." : isRecovering ? "Send Recovery Email" : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isRecovering && (
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#e2c299] hover:text-[#d4b589] text-sm"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            )}
            
            <button
              onClick={() => setIsRecovering(!isRecovering)}
              className="block w-full text-[#e2c299] hover:text-[#d4b589] text-sm"
            >
              {isRecovering ? "Back to sign in" : "Forgot password?"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}