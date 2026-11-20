
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 px-5 py-12 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            ShopEase
          </h2>
          <p className="mt-4 text-sm leading-6 text-gray-400">
            Your one-stop online shopping destination.
            Discover quality products at amazing prices.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/cart">Cart</Link></li>
            <li><Link href="/profile">My Profile</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="font-bold text-white">Customer Service</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/my-orders">My Orders</Link></li>
            <li><Link href="/products">Shop Now</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-white">Contact Us</h3>
          <p className="mt-4 text-sm leading-6 text-gray-400">
            We are here to help you with your shopping experience.
          </p>
          <p className="mt-3 text-sm">
            Email: support@shopease.com
          </p>
        </div>

      </div>

      {/* Copyright */}
      <div className="mx-auto mt-10 max-w-7xl border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </div>
    </footer>
  );
}
