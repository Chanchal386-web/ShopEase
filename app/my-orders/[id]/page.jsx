
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderDetailsPage({ params }) {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get order ID from URL
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    }

    getParams();
  }, [params]);

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/user/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to fetch order.");
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error(error);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <p className="text-center p-10">
        Loading order details...
      </p>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>

        <Link
          href="/my-orders"
          className="text-blue-600 underline"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  // Order tracking steps
  const trackingSteps = ["Placed", "Shipped", "Delivered"];

  const currentStep = trackingSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        href="/my-orders"
        className="text-blue-600 hover:underline"
      >
        ← Back to My Orders
      </Link>

      <h1 className="text-3xl font-bold mt-6 mb-2">
        Order Details
      </h1>

      {/* Order Information */}
      <div className="border rounded-lg p-5 mt-5 space-y-3">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>

        <p>
          <strong>Order Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleDateString("en-IN")}
        </p>

        <p>
          <strong>Order Status:</strong>{" "}
          <span
            className={`font-semibold ${
              order.status === "Cancelled"
                ? "text-red-600"
                : order.status === "Delivered"
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {order.status}
          </span>
        </p>
      </div>

      {/* Order Tracking */}
      <div className="border rounded-lg p-5 mt-5">
        <h2 className="text-xl font-bold mb-6">
          Order Tracking
        </h2>

        {order.status === "Cancelled" ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <h3 className="font-bold text-lg">
              Order Cancelled
            </h3>
            <p>
              This order has been cancelled successfully.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {trackingSteps.map((step, index) => {
              const completed = index <= currentStep;

              return (
                <div
                  key={step}
                  className="flex items-start gap-4"
                >
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full font-bold ${
                      completed
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  <div>
                    <h3
                      className={`font-semibold ${
                        completed
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {step === "Placed"
                        ? "Order Placed"
                        : step === "Shipped"
                        ? "Order Shipped"
                        : "Order Delivered"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {step === "Placed"
                        ? "Your order has been placed successfully."
                        : step === "Shipped"
                        ? "Your order has been shipped."
                        : "Your order has been delivered."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Details */}
      <div className="border rounded-lg p-5 mt-5">
        <h2 className="text-xl font-bold mb-4">
          Customer Details
        </h2>

        <p>Name: {order.name}</p>
        <p>Email: {order.email}</p>
        <p>Mobile: {order.mobile}</p>
        <p>Address: {order.address}</p>
      </div>

      {/* Products */}
      <div className="border rounded-lg p-5 mt-5">
        <h2 className="text-xl font-bold mb-4">
          Products
        </h2>

        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between border-b py-3 gap-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ₹{item.price}</p>
            </div>

            <p className="font-bold">
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}

        <h2 className="text-xl font-bold text-right mt-5">
          Total Amount: ₹{order.totalAmount}
        </h2>
      </div>
    </div>
  );
}




