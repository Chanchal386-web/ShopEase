
import Image from "next/image";

type ProductCardProps = {
  name: string;
  price: number;
  category?: string;
  image: string;
  onAddToCart: () => void;
  priorityImage?: boolean;
  originalPrice?: number;
  discountLabel?: string;
};

export default function ProductCard({
  name,
  price,
  category,
  image,
  onAddToCart,
  priorityImage = false,
  originalPrice,
  discountLabel,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">

      {/* Product Image */}
      <div className="relative flex h-56 items-center justify-center bg-gray-50 p-5">

        {discountLabel && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white">
            {discountLabel}
          </span>
        )}

        <Image
          src={image}
          alt={name}
          width={500}
          height={500}
          loading={priorityImage ? "eager" : "lazy"}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-110"
        />
      </div>

      {/* Product Details */}
      <div className="p-5">

        {category && (
          <p className="text-sm font-medium text-blue-600">
            {category}
          </p>
        )}

        <h2 className="mt-2 line-clamp-1 text-lg font-bold text-gray-800">
          {name}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-2xl font-extrabold text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </p>

          {originalPrice && (
            <p className="text-sm text-gray-400 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        <button
          onClick={onAddToCart}
          className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}




