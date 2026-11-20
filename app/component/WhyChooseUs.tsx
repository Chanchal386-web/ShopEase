
const features = [
  {
    icon: "🚚",
    title: "Free Shipping",
    description: "Enjoy free delivery on eligible orders.",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    description: "Your payments and information stay protected.",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    description: "Simple and convenient return experience.",
  },
  {
    icon: "🎧",
    title: "Customer Support",
    description: "We are here to help you with your shopping.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-blue-50 px-5 py-16">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 text-center">
          <p className="font-semibold text-blue-600">
            Shopping Made Better
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Why Choose ShopEase?
          </h2>

          <p className="mt-3 text-gray-600">
            We make your shopping experience simple and convenient.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">
                {feature.icon}
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
