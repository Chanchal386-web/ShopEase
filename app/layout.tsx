
import type { Metadata } from "next";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import { CartProvider } from "./context/CartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopEase",
  description: "Online Shopping Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />

          {children}

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}



