
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-100 px-5 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl text-center">
        <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
          Welcome to ShopEase
        </span>

        <h1 className="mt-6 text-3xl font-extrabold leading-tight text-gray-900 sm:text-5xl md:text-6xl">
          Discover Your
          <span className="block text-blue-600">
            Favorite Products
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          Explore quality products at amazing prices.
          Find everything you need, all in one place.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/products"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            Shop Now
          </Link>

          <Link
            href="/products"
            className="rounded-lg border border-gray-400 bg-white px-8 py-3 font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            Explore Products
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Quality Products | Great Prices | Easy Shopping
        </p>
      </div>
    </section>
  );
}
