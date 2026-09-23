"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileVideo, 
  Settings,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Users & Teams', icon: Users, href: '/users' },
    { name: 'Contents', icon: FileVideo, href: '/contents' },
    { name: 'Task Types', icon: CheckSquare, href: '/tasks' },
    { name: 'System Logs', icon: ShieldCheck, href: '/logs' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col shrink-0 border-r border-slate-800 select-none">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
          D
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white leading-tight">Draftly Admin</h1>
          <p className="text-[11px] text-slate-400">Content Studio</p>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">Admin Supervisor</p>
            <p className="text-xs text-slate-400 truncate">admin@studio.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
