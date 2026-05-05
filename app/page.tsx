import Footer from "@/components/landing/Footer";
import HeroSlider from "@/components/landing/HeroSlider";
import PrescriptionUploadBanner from "@/components/landing/PrescriptionUploadBanner";
import ProductGrid from "@/components/landing/ProductGrid";
import Testimonials from "@/components/landing/Testimonials";
import TrustBadges from "@/components/landing/TrustBadges";
import Navbar from "@/components/navbar/Navbar";

export const metadata = {
  title: "MediCare+ - Online Pharmacy Bangladesh",
  description:
    "Buy genuine medicines online with licensed pharmacists and prescription upload support.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSlider />
        </section>

        {/* Trust Badges */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <TrustBadges />
        </section>

        {/* Category Tabs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
            {[
              "All Products",
              "Medicines",
              "Baby Care",
              "Vitamins",
              "Skin Care",
              "Devices",
            ].map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-colors whitespace-nowrap text-sm font-medium"
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <ProductGrid title="Featured Products" />
        </section>

        {/* Prescription Upload Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PrescriptionUploadBanner />
        </section>

        {/* Hot Deals Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <ProductGrid title="Hot Deals" />
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <Testimonials />
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get your medicines delivered safely
            </h2>
            <p className="text-gray-600 mb-8">
              Download the MediCare+ app for exclusive deals and faster checkout
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#"
                className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>📱</span>
                <span>iOS App</span>
              </a>
              <a
                href="#"
                className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>🤖</span>
                <span>Android App</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
