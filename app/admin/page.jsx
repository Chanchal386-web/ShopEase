
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function fetchOrders() {
    try {
      setLoading(true);

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

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

  async function updateStatus(orderId, status) {
    try {
      setUpdatingId(orderId);
      setMessage("");
      setError("");

      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, status }
            : order
        )
      );

      setMessage("Order status updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      setError("");

      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Logout failed"
      );
      setLoggingOut(false);
    }
  }

  const totalRevenue = orders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const placedOrders = orders.filter(
    (order) => order.status === "Placed"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="rounded-xl bg-red-50 p-5 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-blue-600">
              ShopEase Admin
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Orders Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage and track all customer orders.
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        {/* Dashboard Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Orders
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
              {orders.length}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Placed Orders
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-blue-600">
              {placedOrders}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Shipped Orders
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-orange-500">
              {shippedOrders}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Delivered Orders
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-green-600">
              {deliveredOrders}
            </h2>
          </div>
        </div>

        {/* Revenue */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md">
          <p className="text-sm font-medium text-blue-100">
            Total Order Value
          </p>

          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h2>
        </div>

        {/* Cancelled Orders Count */}
        <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Cancelled Orders
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-red-600">
            {cancelledOrders}
          </h2>
        </div>

        {/* Messages */}
        {message && (
          <p className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {/* Orders List */}
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            All Customer Orders
          </h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
              No orders found.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const isFinalStatus =
                  order.status === "Cancelled" ||
                  order.status === "Delivered";

                return (
                  <div
                    key={order._id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col justify-between gap-3 border-b bg-gray-50 p-5 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Customer: {order.name}
                        </h3>

                        <p className="mt-1 break-all text-xs text-gray-500">
                          Order ID: {order._id}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Shipped"
                            ? "bg-orange-100 text-orange-700"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">

                      {/* Customer Details */}
                      <div>
                        <h4 className="mb-3 font-bold text-gray-800">
                          Customer Details
                        </h4>

                        <p className="mb-2 break-words text-sm text-gray-600">
                          <strong>Email:</strong> {order.email}
                        </p>

                        <p className="mb-2 text-sm text-gray-600">
                          <strong>Mobile:</strong> {order.mobile}
                        </p>

                        <p className="break-words text-sm text-gray-600">
                          <strong>Address:</strong> {order.address}
                        </p>
                      </div>

                      {/* Ordered Products */}
                      <div>
                        <h4 className="mb-3 font-bold text-gray-800">
                          Ordered Products
                        </h4>

                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="mb-2 flex justify-between gap-3 text-sm text-gray-600"
                          >
                            <span className="break-words">
                              {item.name} × {item.quantity}
                            </span>

                            <span className="shrink-0 font-medium">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}

                        <div className="mt-4 border-t pt-3">
                          <p className="text-lg font-extrabold text-gray-900">
                            Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col gap-4 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Update Order Status
                        </label>

                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order._id, e.target.value)
                          }
                          disabled={
                            updatingId === order._id ||
                            isFinalStatus
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 sm:w-48"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        {isFinalStatus && (
                          <p className="mt-2 text-xs text-gray-500">
                            This order has a final status and cannot be changed.
                          </p>
                        )}

                        {updatingId === order._id && (
                          <p className="mt-2 text-sm text-blue-600">
                            Updating status...
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        <p>
                          <strong>Order Date:</strong>
                        </p>

                        <p>
                          {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





