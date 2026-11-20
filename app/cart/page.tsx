
"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          My Shopping Cart
        </h1>

        <p className="mb-8 text-gray-500">
          Review your products before checkout.
        </p>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border bg-white px-5 py-12 text-center shadow-sm">
            <div className="mb-4 text-5xl">🛒</div>

            <h2 className="text-xl font-bold text-gray-800">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Looks like you haven't added any products yet.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Cart Products */}
            <div className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-lg font-bold text-gray-800">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-gray-500">
                      Price: ₹{item.price.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold transition hover:bg-gray-200"
                      >
                        -
                      </button>

                      <span className="min-w-6 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        aria-label={`Increase ${item.name} quantity`}
                        className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold transition hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-3 text-sm font-semibold text-red-600 transition hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="text-lg font-extrabold text-gray-900 sm:text-right">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-5 flex justify-between text-gray-600">
                <span>Products</span>
                <span>{cartItems.length}</span>
              </div>

              <div className="mt-4 flex justify-between border-t pt-4">
                <span className="font-bold text-gray-800">
                  Total Amount
                </span>

                <span className="text-xl font-extrabold text-blue-600">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-lg bg-green-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-green-700 active:scale-95"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="mt-4 block text-center text-sm font-medium text-blue-600 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







