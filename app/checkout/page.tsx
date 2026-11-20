
"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState("");

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const mobile = String(formData.get("mobile") || "").trim();
    const address = String(formData.get("address") || "").trim();

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      setLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    if (address.length < 10) {
      setError("Address must contain at least 10 characters.");
      setLoading(false);
      return;
    }

    const orderData = {
      name,
      email,
      mobile,
      address,
      items: cartItems,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }

      setOrderDetails({
        ...orderData,
        totalAmount: data.totalAmount,
        orderId: data.orderId,
      });

      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  // Order Confirmation
  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm sm:p-10">
          <div className="text-center">
            <div className="text-6xl">🎉</div>

            <h1 className="mt-4 text-2xl font-extrabold text-green-600 sm:text-3xl">
              Order Placed Successfully!
            </h1>

            <p className="mt-2 text-gray-500">
              Thank you for shopping with ShopEase.
            </p>
          </div>

          <div className="mt-8 rounded-xl bg-gray-50 p-5">
            <h2 className="mb-4 text-lg font-bold">
              Customer Details
            </h2>

            <p className="mb-2 break-words">
              <strong>Name:</strong> {orderDetails.name}
            </p>
            <p className="mb-2 break-words">
              <strong>Email:</strong> {orderDetails.email}
            </p>
            <p className="mb-2">
              <strong>Mobile:</strong> {orderDetails.mobile}
            </p>
            <p className="break-words">
              <strong>Address:</strong> {orderDetails.address}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="mb-4 text-lg font-bold">
              Ordered Products
            </h2>

            {orderDetails.items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between gap-3 border-b py-3"
              >
                <span className="break-words text-gray-700">
                  {item.name} × {item.quantity}
                </span>

                <span className="shrink-0 font-semibold">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-between text-xl font-extrabold">
            <span>Total Amount</span>
            <span className="text-green-600">
              ₹{orderDetails.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <p className="mt-5 break-all rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            Order ID: {orderDetails.orderId}
          </p>

          <Link
            href="/my-orders"
            className="mt-7 block rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Checkout
        </h1>

        <p className="mb-8 text-gray-500">
          Enter your details to complete your order.
        </p>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mb-4 text-5xl">🛒</div>

            <h2 className="text-xl font-bold">
              Your cart is empty.
            </h2>

            <Link
              href="/products"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Customer Information */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
                <h2 className="mb-6 text-xl font-bold">
                  Delivery Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block font-medium text-gray-700">
                      Full Name
                    </label>

                    <input
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      minLength={2}
                      maxLength={50}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-gray-700">
                      Email Address
                    </label>

                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-gray-700">
                      Mobile Number
                    </label>

                    <input
                      name="mobile"
                      type="tel"
                      placeholder="10-digit Mobile Number"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      title="Enter a valid 10-digit Indian mobile number"
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-gray-700">
                      Delivery Address
                    </label>

                    <textarea
                      name="address"
                      placeholder="Enter your complete delivery address"
                      minLength={10}
                      maxLength={300}
                      required
                      rows={4}
                      className="w-full resize-y rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="h-fit rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
                <h2 className="mb-5 text-xl font-bold">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-3 border-b pb-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-medium text-gray-800">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex justify-between border-t pt-5">
                  <span className="font-bold">
                    Total Amount
                  </span>

                  <span className="text-xl font-extrabold text-green-600">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {error && (
                  <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Thank you for choosing ShopEase!
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}




