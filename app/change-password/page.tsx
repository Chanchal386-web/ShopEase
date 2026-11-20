
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Password change failed");
        return;
      }

      setMessage("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change Password Error:", error);
      setMessage("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Change Password
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Update your ShopEase account password
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-lg border p-3"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-lg border p-3"
              minLength={6}
              required
            />
          </div>

          {message && (
            <p className="text-center text-sm text-blue-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>

        <button
          onClick={() => router.push("/profile")}
          className="mt-4 w-full text-center text-sm text-blue-600 hover:underline"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
