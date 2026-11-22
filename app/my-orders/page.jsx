
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [message, setMessage] = useState("");

  async function fetchOrders() {
    try {
      const response = await fetch("/api/user/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.orders);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleCancelOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(orderId);
      setMessage("");

      const response = await fetch(
        `/api/user/orders/${orderId}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel order");
      }

      setMessage("Order cancelled successfully!");

      // Refresh orders after cancellation
      await fetchOrders();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setCancellingId("");
    }
  }

  if (loading) {
    return <p className="text-center p-10">Loading your orders...</p>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600">{error}</p>

        {error === "Please login first." && (
          <Link
            href="/user-login"
            className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded"
          >
            Login
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {message && (
        <p className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
          {message}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="text-center border rounded-lg p-8">
          <p className="text-lg mb-4">
            You have not placed any orders yet.
          </p>

          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-bold">
                    Order #{order._id}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded ${
                    order.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : order.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <h3 className="font-semibold mb-2">Products</h3>

              {order.items.map((item, index) => (
                <p key={index} className="text-gray-700">
                  {item.name} × {item.quantity} = ₹
                  {item.price * item.quantity}
                </p>
              ))}

              <div className="border-t mt-4 pt-3">
                <p className="font-bold">
                  Total Amount: ₹{order.totalAmount}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 items-center mt-4">
                <Link
                  href={`/my-orders/${order._id}`}
                  className="text-blue-600 underline"
                >
                  View Order Details
                </Link>

                {order.status === "Placed" && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancellingId === order._id}
                    className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {cancellingId === order._id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

