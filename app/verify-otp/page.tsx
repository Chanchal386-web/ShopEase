
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOTPPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "OTP verification failed");
        return;
      }

      setMessage("OTP verified successfully!");

      router.push(
        `/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setMessage("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Verify OTP
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Enter your email and the 6-digit OTP.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            required
            className="w-full border p-3 rounded-lg mb-4"
          />

          <label className="block mb-2 font-medium">
            6-Digit OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter OTP"
            required
            className="w-full border p-3 rounded-lg mb-4"
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
