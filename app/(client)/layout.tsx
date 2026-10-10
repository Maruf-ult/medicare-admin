import type { ReactNode } from "react";
import ClientNavbar from "@/components/client/ClientNavbar";
import ClientFooter from "@/components/client/ClientFooter";

type ClientLayoutProps = {
  children: ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientNavbar />
      <main>{children}</main>
      <ClientFooter />
    </div>
  );
}