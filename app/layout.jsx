
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import { CartProvider } from "./context/CartContext";
import "./globals.css";

export const metadata = {
  title: "ShopEase",
  description: "Online Shopping Website",
};

export default function RootLayout({ children }) {
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




