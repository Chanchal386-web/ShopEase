
"use client";

import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";
import { useSearchParams } from "next/navigation";

const products = [
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
  {
    id: 3,
    name: "Shoes",
    price: 2499,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
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





