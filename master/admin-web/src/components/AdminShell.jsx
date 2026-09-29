"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (isLoginPage) return;

    const timer = setTimeout(() => {
      try {
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('admin_session=');
        const session = typeof window !== 'undefined' ? sessionStorage.getItem('admin_session') : null;

        if (!hasCookie || !session) {
          setIsAuthenticated(false);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('admin_session');
            localStorage.removeItem('admin_session');
            document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          router.replace('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
        router.replace('/login');
      } finally {
        setCheckingAuth(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <main className="w-full h-screen overflow-y-auto bg-slate-950">
        {children}
      </main>
    );
  }

  if (checkingAuth || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">กำลังตรวจสอบสิทธิ์ผู้ดูแล...</span>
        </div>
      </div>
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
