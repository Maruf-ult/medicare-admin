import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminHeader />
        <main className="bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
