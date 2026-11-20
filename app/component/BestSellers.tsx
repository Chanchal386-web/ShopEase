
"use client";

import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

const bestSellers = [
  {
    id: 7,
    name: "Travel Backpack",
    price: 1299,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    name: "Stylish Sunglasses",
    price: 899,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    name: "Digital Camera",
    price: 5999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BestSellers() {
  const { addToCart } = useCart();

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">

      <div className="mb-8">
        <p className="font-semibold text-blue-600">
          Explore More
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Best Sellers
        </h2>

        <p className="mt-2 text-gray-500">
          Discover more products from our collection.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {bestSellers.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            category={product.category}
            image={product.image}
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

    </section>
  );
}
