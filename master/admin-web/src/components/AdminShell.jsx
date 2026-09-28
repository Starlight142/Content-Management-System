"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="w-full h-screen overflow-y-auto bg-slate-950">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden antialiased bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
