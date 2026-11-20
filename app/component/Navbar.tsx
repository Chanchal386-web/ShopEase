
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Check customer login session
  useEffect(() => {
    let isActive = true;

    const checkUserSession = async () => {
      setCheckingSession(true);

      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (isActive) {
          setIsLoggedIn(response.ok);
        }
      } catch (error) {
        console.error("Session Error:", error);

        if (isActive) {
          setIsLoggedIn(false);
        }
      } finally {
        if (isActive) {
          setCheckingSession(false);
        }
      }
    };

    checkUserSession();

    return () => {
      isActive = false;
    };
  }, [pathname]);

  // Customer logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setIsLoggedIn(false);
      setMenuOpen(false);

      router.push("/user-login");
      router.refresh();
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="text-2xl font-bold text-blue-600"
        >
          ShopEase
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>

          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>

          <Link href="/cart" className="hover:text-blue-600">
            Cart ({totalQuantity})
          </Link>

          {!checkingSession && (
            <>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="font-semibold text-blue-600"
                  >
                    Profile
                  </Link>

                  <Link href="/my-orders" className="hover:text-blue-600">
                    My Orders
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="font-semibold text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/user-login"
                    className="font-semibold text-blue-600"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="font-semibold text-blue-600"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-gray-800 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="flex flex-col gap-4 border-t bg-white px-6 py-4 md:hidden">
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>

          <Link href="/products" onClick={closeMenu}>
            Products
          </Link>

          <Link href="/cart" onClick={closeMenu}>
            Cart ({totalQuantity})
          </Link>

          {!checkingSession && (
            <>
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={closeMenu}>
                    Profile
                  </Link>

                  <Link href="/my-orders" onClick={closeMenu}>
                    My Orders
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-left font-semibold text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/user-login"
                    onClick={closeMenu}
                    className="font-semibold text-blue-600"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="font-semibold text-blue-600"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}





