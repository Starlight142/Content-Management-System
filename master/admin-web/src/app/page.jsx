"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileVideo, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  Clock,
  CheckSquare
} from 'lucide-react';
import { presenceClient, apiFetch } from '../services/presenceClient';

export default function Home() {
  const [timeRange, setTimeRange] = useState('7D');
  const [liveStats, setLiveStats] = useState({
    userCount: 0,
    contentCount: 0,
    reviewCount: 0,
    workflows: []
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const [users, contents] = await Promise.all([
        apiFetch('/users').catch(() => []),
        apiFetch('/contents').catch(() => [])
      ]);

      const uList = Array.isArray(users) ? users : [];
      const cList = Array.isArray(contents) ? contents : [];

      const reviewQueue = cList.filter(c => c.status === 'REVIEW' || c.status === 'REVISION');

      const workflows = cList.slice(0, 5).map(c => {
        let percent = c.progress || 0;
        if (!percent) {
          if (c.status === 'PUBLISHED' || c.status === 'APPROVED') percent = 100;
          else if (c.status === 'REVIEW') percent = 80;
          else if (c.status === 'REVISION') percent = 60;
          else if (c.status === 'PRODUCTION') percent = 45;
          else percent = 15;
        }
        return {
          id: c._id || c.id,
          title: c.title,
          platform: c.platform || 'General',
          step: c.status,
          percent,
          creator: c.createdBy?.firstName ? `${c.createdBy.firstName} ${c.createdBy.lastName || ''}`.trim() : (c.createdBy?.username || 'ผู้ผลิต')
        };
      });

      setLiveStats({
        userCount: uList.length,
        contentCount: cList.length,
        reviewCount: reviewQueue.length,
        workflows
      });
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const [users, contents] = await Promise.all([
          apiFetch('/users').catch(() => []),
          apiFetch('/contents').catch(() => [])
        ]);

        if (!isMounted) return;

        const uList = Array.isArray(users) ? users : [];
        const cList = Array.isArray(contents) ? contents : [];

        const reviewQueue = cList.filter(c => c.status === 'REVIEW' || c.status === 'REVISION');

        const workflows = cList.slice(0, 5).map(c => {
          let percent = c.progress || 0;
          if (!percent) {
            if (c.status === 'PUBLISHED' || c.status === 'APPROVED') percent = 100;
            else if (c.status === 'REVIEW') percent = 80;
            else if (c.status === 'REVISION') percent = 60;
            else if (c.status === 'PRODUCTION') percent = 45;
            else percent = 15;
          }
          return {
            id: c._id || c.id,
            title: c.title,
            platform: c.platform || 'General',
            step: c.status,
            percent,
            creator: c.createdBy?.firstName ? `${c.createdBy.firstName} ${c.createdBy.lastName || ''}`.trim() : (c.createdBy?.username || 'ผู้ผลิต')
          };
        });

        setLiveStats({
          userCount: uList.length,
          contentCount: cList.length,
          reviewCount: reviewQueue.length,
          workflows
        });
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      }
    };

    fetchInitial();

    presenceClient.connect('admin_web_home');

    const handleRefresh = () => {
      if (isMounted) loadDashboardData();
    };

    presenceClient.on('CONTENT_CREATED', handleRefresh);
    presenceClient.on('CONTENT_UPDATED', handleRefresh);
    presenceClient.on('CONTENT_DELETED', handleRefresh);
    presenceClient.on('TASK_UPDATED', handleRefresh);
    presenceClient.on('USER_CREATED', handleRefresh);
    presenceClient.on('USER_DELETED', handleRefresh);

    return () => {
      isMounted = false;
      presenceClient.off('CONTENT_CREATED', handleRefresh);
      presenceClient.off('CONTENT_UPDATED', handleRefresh);
      presenceClient.off('CONTENT_DELETED', handleRefresh);
      presenceClient.off('TASK_UPDATED', handleRefresh);
      presenceClient.off('USER_CREATED', handleRefresh);
      presenceClient.off('USER_DELETED', handleRefresh);
    };
  }, [loadDashboardData]);

  const stats = [
    { title: 'ผู้ใช้งานทั้งหมด (Users)', value: liveStats.userCount > 0 ? liveStats.userCount : '5', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', link: '/users' },
    { title: 'Content ในกระบวนการผลิต', value: liveStats.contentCount > 0 ? liveStats.contentCount : '6', icon: FileVideo, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', link: '/contents' },
    { title: 'คิวที่ต้องตรวจสอบ (Review Queue)', value: liveStats.reviewCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', link: '/contents' },
    { title: 'อัตราการเติบโต (Engagement)', value: '+18.5%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', link: '/contents' },
  ];

  const recentWorkflow = liveStats.workflows.length > 0 ? liveStats.workflows : [
    { id: 1, title: 'รีวิวแก็ดเจ็ตใหม่ 2026', platform: 'YouTube', step: 'PUBLISHED', percent: 100, creator: 'John Creator' },
    { id: 2, title: 'สรุปข่าว AI ภายใน 1 นาที', platform: 'TikTok', step: 'REVIEW', percent: 75, creator: 'Jane Editor' },
    { id: 3, title: 'Vlog พาเที่ยวออฟฟิศ', platform: 'Instagram', step: 'PRODUCTION', percent: 45, creator: 'Somchai Admin' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Studio Overview Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">สรุปภาพรวมกระบวนการผลิตและสถิติการทำงานของสตูดิโอ</p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {[
            { id: 'TODAY', label: 'วันนี้' },
            { id: '7D', label: '7 วันล่าสุด' },
            { id: '30D', label: '30 วันล่าสุด' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeRange === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link 
              href={stat.link} 
              key={idx} 
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Production Flow & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Workflow Monitoring */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">กระบวนการผลิตล่าสุด (Live Production Flow)</h2>
              <p className="text-xs text-slate-500 mt-0.5">ติดตามสถานะและความคืบหน้าของ Content ในปัจจุบัน</p>
            </div>
            <Link 
              href="/contents" 
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="space-y-4">
            {recentWorkflow.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 mr-2">
                      {item.platform}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{item.title}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {item.step} ({item.percent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.percent === 100 ? 'bg-emerald-500' :
                      item.percent >= 70 ? 'bg-amber-500' :
                      item.percent >= 40 ? 'bg-blue-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                  <span>ผู้สร้าง: {item.creator}</span>
                  <Link href="/contents" className="text-blue-600 hover:underline">
                    เปิดจัดการงาน
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Hub */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">ทางลัดการทำงาน (Quick Actions)</h2>
            <p className="text-xs text-slate-500 mt-0.5">เข้าถึงฟีเจอร์สำคัญของระบบได้ทันที</p>

            <div className="space-y-2.5 mt-5">
              <Link 
                href="/contents"
                className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-100 text-blue-800 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Plus size={16} />
                  </div>
                  <span className="text-xs font-bold">สร้าง Content ตัวใหม่</span>
                </div>
                <ArrowUpRight size={16} className="text-blue-500 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link 
                href="/users"
                className="flex items-center justify-between p-3.5 rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-100 text-purple-800 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 text-white rounded-lg">
                    <Users size={16} />
                  </div>
                  <span className="text-xs font-bold">เพิ่มสมาชิกในทีม</span>
                </div>
                <ArrowUpRight size={16} className="text-purple-500 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link 
                href="/tasks"
                className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 hover:bg-amber-50 border border-amber-100 text-amber-800 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 text-white rounded-lg">
                    <CheckSquare size={16} />
                  </div>
                  <span className="text-xs font-bold">จัดการประเภทงาน (Task Types)</span>
                </div>
                <ArrowUpRight size={16} className="text-amber-500 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link 
                href="/logs"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700 text-white rounded-lg">
                    <Clock size={16} />
                  </div>
                  <span className="text-xs font-bold">ตรวจเช็ค System Logs</span>
                </div>
                <ArrowUpRight size={16} className="text-slate-500 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
