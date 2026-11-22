
"use client";

import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

const deals = [
  {
    id: 4,
    name: "Premium Smart Watch",
    price: 1599,
    originalPrice: 2499,
    discountLabel: "36% OFF",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Wireless Headphones",
    price: 999,
    originalPrice: 1499,
    discountLabel: "33% OFF",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Running Shoes",
    price: 1799,
    originalPrice: 2499,
    discountLabel: "28% OFF",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Deals() {
  const { addToCart } = useCart();

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-semibold text-red-600">
            Limited Time Offers
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Today's Deals
          </h2>

          <p className="mt-2 text-gray-500">
            Grab your favorite products at special prices.
          </p>
        </div>

        <span className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
          Hot Offers 🔥
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {deals.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            discountLabel={product.discountLabel}
            category={product.category}
            image={product.image}
            priorityImage={false}
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

