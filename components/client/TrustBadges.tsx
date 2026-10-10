const badges = [
  {
    title: "Free Delivery",
    description: "On orders above ৳500.",
    icon: "🚚",
  },
  {
    title: "Genuine Medicines",
    description: "Sourced from trusted suppliers.",
    icon: "🛡️",
  },
  {
    title: "Pharmacist Support",
    description: "Prescription review support.",
    icon: "💬",
  },
  {
    title: "Easy Return",
    description: "Simple return policy.",
    icon: "↩️",
  },
];

export default function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div
            key={badge.title}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              {badge.icon}
            </div>

            <div>
              <h4 className="text-sm font-black text-gray-900">
                {badge.title}
              </h4>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}