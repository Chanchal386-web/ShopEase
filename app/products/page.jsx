
import { Suspense } from "react";
import ProductsList from "../component/Products";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <Suspense fallback={<p className="text-center py-10">Loading products...</p>}>
        <ProductsList />
      </Suspense>
    </div>
  );
}

