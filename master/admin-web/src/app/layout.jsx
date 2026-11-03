import "./globals.css";
import AdminShell from "@/components/AdminShell";

export const metadata = {
  title: "Draftly - Content Admin Dashboard",
  description: "Admin panel for Draftly Content Production Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
