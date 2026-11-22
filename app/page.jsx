
import { Suspense } from "react";

import Hero from "./component/Hero";
import Categories from "./component/Categories";
import Products from "./component/Products";
import Deals from "./component/Deals";
import BestSellers from "./component/BestSellers";
import WhyChooseUs from "./component/WhyChooseUs";

export default function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <Deals />

      <Suspense
        fallback={
          <p className="py-10 text-center">
            Loading products...
          </p>
        }
      >
        <Products />
      </Suspense>

      <BestSellers />
      <WhyChooseUs />
    </main>
  );
}




