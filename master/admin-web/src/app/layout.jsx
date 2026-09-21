import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Draftly - Content Admin Dashboard",
  description: "Admin panel for Draftly Content Production Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-slate-900 flex h-screen overflow-hidden antialiased`}>
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8 bg-slate-100">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
