import Footer from '@/components/landing/Footer';
import Navbar from '@/components/navbar/Navbar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
