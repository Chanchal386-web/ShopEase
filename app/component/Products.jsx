
"use client";

import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";
import { useSearchParams } from "next/navigation";

const products = [
  // Electronics
  {
    id: 1,
    name: "Smart Watch",
    price: 1999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Headphones",
    price: 1499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },

  // Fashion
  {
    id: 3,
    name: "Men's T-Shirt",
    price: 799,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Casual Jacket",
    price: 1799,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
  },

  // Shoes
  {
    id: 5,
    name: "Running Shoes",
    price: 2499,
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Casual Sneakers",
    price: 1999,
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },

  // Beauty
  {
    id: 7,
    name: "Beauty Cream",
    price: 499,
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    name: "Makeup Kit",
    price: 999,
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  },

  // Home
  {
    id: 9,
    name: "Home Decor",
    price: 799,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10,
    name: "Table Lamp",
    price: 1199,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  },

  // Accessories
  {
    id: 11,
    name: "Wrist Watch",
    price: 1299,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 12,
    name: "Sunglasses",
    price: 699,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Products() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category");

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          product.category.toLowerCase() ===
          selectedCategory.toLowerCase()
      )
    : products;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <h2 className="mb-2 text-3xl font-bold text-gray-900">
        Our Products
      </h2>

      {selectedCategory && (
        <p className="mb-6 text-gray-600">
          Category: {selectedCategory}
        </p>
      )}

      {filteredProducts.length === 0 ? (
        <p className="py-10 text-center text-gray-600">
          No products found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              category={product.category}
              image={product.image}
              priorityImage={index === 0}
              onAddToCart={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  category: product.category,
                  image: product.image,
                })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}








