"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { presenceClient, apiFetch } from '../services/presenceClient';

const Topbar = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      const logs = await apiFetch('/logs?limit=6');
      if (Array.isArray(logs)) {
        const mapped = logs.map((l) => ({
          id: l._id || l.id,
          title: l.title || l.action,
          desc: l.details || l.title || '',
          time: l.date ? l.date.substring(5, 16) : 'ล่าสุด',
          unread: true,
          action: l.action,
        }));
        setNotifications(mapped);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    apiFetch('/logs?limit=6')
      .then((logs) => {
        if (!isMounted || !Array.isArray(logs)) return;
        const mapped = logs.map((l) => ({
          id: l._id || l.id,
          title: l.title || l.action,
          desc: l.details || l.title || '',
          time: l.date ? l.date.substring(5, 16) : 'ล่าสุด',
          unread: true,
          action: l.action,
        }));
        setNotifications(mapped);
      })
      .catch(() => {});

    presenceClient.connect('admin_topbar');
    const unsub = presenceClient.subscribe((_, onlineSet) => {
      if (isMounted) setOnlineCount(onlineSet.size);
    });

    const handleNewActivity = () => {
      if (isMounted) fetchRecentNotifications();
    };

    presenceClient.on('ACTIVITY_CREATED', handleNewActivity);

    return () => {
      isMounted = false;
      unsub();
      presenceClient.off('ACTIVITY_CREATED', handleNewActivity);
    };
  }, [fetchRecentNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/contents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 shrink-0 relative z-30">
      {/* Global Quick Search */}
      <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70 w-80 md:w-96 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search size={17} className="text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="ค้นหาด่วน (พิมพ์แล้วกด Enter เพื่อค้นหา Content)..." 
          className="bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder:text-slate-400 w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Presence Badge */}
        <Link
          href="/users"
          title="ดูสถานะสมาชิกที่ออนไลน์อยู่ขณะนี้"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 rounded-full text-xs font-semibold text-emerald-800 transition shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{onlineCount > 0 ? `${onlineCount} คนออนไลน์` : 'Live Presence'}</span>
        </Link>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="การแจ้งเตือน"
            className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
              isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Floating Notification Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 mt-1 w-84 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">การแจ้งเตือนล่าสุด</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} ใหม่
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    อ่านทั้งหมด
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3 hover:bg-slate-50 transition cursor-pointer ${n.unread ? 'bg-blue-50/30' : ''}`}
                      onClick={() => setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item))}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{n.title}</p>
                        {n.unread && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1 shrink-0"></span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    ยังไม่มีการแจ้งเตือนใหม่
                  </div>
                )}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <Link 
                  href="/logs" 
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline block"
                >
                  ดูบันทึก Audit Logs ทั้งหมด →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1"></div>

        {/* Sign out button */}
        <button 
          onClick={() => setIsSignoutModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Sign out Confirmation Modal */}
      {isSignoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <LogOut size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการออกจากระบบ?</h3>
              <p className="text-xs text-slate-500 mt-1">คุณต้องการลงชื่อออกจากระบบ Admin ใช่หรือไม่</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsSignoutModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setIsSignoutModalOpen(false);
                  if (typeof window !== 'undefined') {
                    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    sessionStorage.removeItem('admin_session');
                    localStorage.removeItem('admin_session');
                    router.replace('/login');
                  }
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                ยืนยัน ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
