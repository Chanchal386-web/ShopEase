
import Link from "next/link";

const categories = [
  {
    name: "Electronics",
    icon: "💻",
    description: "Gadgets & Accessories",
  },
  {
    name: "Fashion",
    icon: "👕",
    description: "Trendy Fashion",
  },
  {
    name: "Shoes",
    icon: "👟",
    description: "Latest Footwear",
  },
  {
    name: "Beauty",
    icon: "💄",
    description: "Beauty Products",
  },
  {
    name: "Home",
    icon: "🏠",
    description: "Home Essentials",
  },
  {
    name: "Accessories",
    icon: "⌚",
    description: "Daily Accessories",
  },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8">
        <p className="font-semibold text-blue-600">
          Explore Collections
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Shop by Category
        </h2>

        <p className="mt-2 text-gray-500">
          Find your favorite products from our collections.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="group rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl transition group-hover:bg-blue-100">
              {category.icon}
            </div>

            <h3 className="mt-4 font-bold text-gray-800">
              {category.name}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
