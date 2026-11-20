
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  createdAt?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (!response.ok) {
          router.replace("/user-login");
          return;
        }

        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (error) {
        console.error("Profile Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdate = async () => {
    setMessage("");

    if (!name.trim() || !email.trim()) {
      setMessage("Name and Email are required");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Profile update failed");
        return;
      }

      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Update Error:", error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center">
        <p>Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-8 shadow-lg">

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
            {name.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome to your ShopEase account
          </p>
        </div>

        <div className="space-y-5">

          <div className="rounded-lg bg-gray-50 p-4">
            <label className="text-sm text-gray-500">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <label className="text-sm text-gray-500">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Account Status
            </p>

            <p className="mt-1 font-semibold text-green-600">
              Active
            </p>
          </div>

        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-semibold text-blue-600">
            {message}
          </p>
        )}

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="mt-6 w-full rounded-lg bg-green-600 p-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={() => router.push("/")}
          className="mt-3 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Home
        </button>

      </div>
    </div>
  );
}


