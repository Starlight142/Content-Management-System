"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  X, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2,
  Activity,
  FileText,
  CheckSquare,
  Users,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { presenceClient, apiFetch } from '../../services/presenceClient';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(() => presenceClient.isConnected);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchLogs = useCallback(async () => {
    try {
      const data = await apiFetch('/logs');
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.warn('Failed to fetch logs:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    apiFetch('/logs')
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setLogs(data);
        }
      })
      .catch((err) => console.warn('Failed to fetch logs:', err.message))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    presenceClient.connect('admin_logs_monitor');

    const handleConn = (payload) => {
      if (isMounted) setIsWsConnected(!!payload?.isConnected);
    };

    const handleNewActivity = () => {
      if (isMounted) {
        fetchLogs();
      }
    };

    const handleCleared = () => {
      if (isMounted) {
        setLogs([]);
        showToast('ประวัติ Logs ทั้งหมดในระบบถูกล้างแล้ว');
      }
    };

    presenceClient.on('CONNECTION_CHANGE', handleConn);
    presenceClient.on('ACTIVITY_CREATED', handleNewActivity);
    presenceClient.on('LOGS_CLEARED', handleCleared);

    return () => {
      isMounted = false;
      presenceClient.off('CONNECTION_CHANGE', handleConn);
      presenceClient.off('ACTIVITY_CREATED', handleNewActivity);
      presenceClient.off('LOGS_CLEARED', handleCleared);
    };
  }, [fetchLogs]);

  const getActionBadge = (action) => {
    const act = action || '';
    if (act.includes('DELETE') || act.includes('FAILED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <Trash2 size={12} />
          {act}
        </span>
      );
    }
    if (act.includes('CREATE') || act.includes('REGISTER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} />
          {act}
        </span>
      );
    }
    if (act.includes('UPDATE') || act.includes('STATUS') || act.includes('ASSIGN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Activity size={12} />
          {act}
        </span>
      );
    }
    if (act.includes('LOGIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <ShieldCheck size={12} />
          {act}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock size={12} />
        {act}
      </span>
    );
  };

  const filteredLogs = logs.filter((log) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      (log.user || '').toLowerCase().includes(s) ||
      (log.action || '').toLowerCase().includes(s) ||
      (log.title || '').toLowerCase().includes(s) ||
      (log.details || '').toLowerCase().includes(s) ||
      (log.userEmail || '').toLowerCase().includes(s);

    if (actionFilter === 'ALL') return matchesSearch;
    if (actionFilter === 'CONTENT') return matchesSearch && (log.action || '').includes('CONTENT');
    if (actionFilter === 'TASK') return matchesSearch && (log.action || '').includes('TASK');
    if (actionFilter === 'USER') return matchesSearch && ((log.action || '').includes('USER') || (log.action || '').includes('LOGIN'));
    if (actionFilter === 'SYSTEM') return matchesSearch && !(log.action || '').includes('CONTENT') && !(log.action || '').includes('TASK') && !(log.action || '').includes('USER');
    
    return matchesSearch;
  });

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('ไม่มีรายการ Logs สำหรับส่งออก');
      return;
    }
    const header = "ID,Action,User,Email,Role,Details,Date\n";
    const rows = filteredLogs.map((l, idx) => 
      `${idx + 1},"${l.action || '-'}","${(l.user || '').replace(/"/g, '""')}","${l.userEmail || '-'}","${l.actorRole || '-'}","${(l.details || l.title || '').replace(/"/g, '""')}","${l.date || '-'}"`
    ).join("\n");
    
    // Add BOM for UTF-8 so Excel displays Thai characters properly
    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลด Audit Logs เป็น CSV เรียบร้อยแล้ว!');
  };

  const handleClearLogs = async () => {
    if (!confirm('คำเตือน: คุณต้องการล้างประวัติ Audit Logs ทั้งหมดออกจากฐานข้อมูล MongoDB ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    try {
      setIsClearing(true);
      await apiFetch('/logs', { method: 'DELETE' });
      setLogs([]);
      showToast('ล้างประวัติ Logs ในฐานข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      alert(`ไม่สามารถล้าง Logs ได้: ${err.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  // Stats calculation
  const totalCount = logs.length;
  const contentEventsCount = logs.filter(l => (l.action || '').includes('CONTENT')).length;
  const taskEventsCount = logs.filter(l => (l.action || '').includes('TASK')).length;
  const userEventsCount = logs.filter(l => (l.action || '').includes('USER') || (l.action || '').includes('LOGIN')).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm z-50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Logs & Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">
            บันทึกประวัติการดำเนินงานของผู้ใช้งานและระบบตาม Non-Functional Requirement 5 (เก็บข้อมูลจริงใน MongoDB)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio size={13} className={isWsConnected ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
            <span>{isWsConnected ? 'Live Socket Sync' : 'Socket Reconnecting...'}</span>
          </div>
          <button 
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            <span>รีเฟรช</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handleClearLogs}
            disabled={isClearing || logs.length === 0}
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{isClearing ? 'กำลังล้าง...' : 'ล้าง Logs'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">บันทึกทั้งหมด (Total Logs)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalCount} รายการ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">รายการคอนเทนต์ (Content)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{contentEventsCount} รายการ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">รายการงาน (Task)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{taskEventsCount} รายการ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ผู้ใช้งานและล็อกอิน (Users/Auth)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{userEventsCount} รายการ</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Action Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหา Log ตามชื่อผู้ใช้, การกระทำ หรือรายละเอียด..." 
            className="bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400 w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'CONTENT', label: 'Content' },
            { id: 'TASK', label: 'Tasks' },
            { id: 'USER', label: 'Users & Auth' },
            { id: 'SYSTEM', label: 'System' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActionFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                actionFilter === item.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Action Type</th>
                <th className="py-3.5 px-5">ผู้ดำเนินการ (Performed By)</th>
                <th className="py-3.5 px-5">รายละเอียดเหตุการณ์ (Event Details)</th>
                <th className="py-3.5 px-5">เวลา (Timestamp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-blue-600" />
                      <p className="text-sm font-medium">กำลังโหลดประวัติ Audit Logs จาก MongoDB...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-900 block">{log.user}</span>
                        {log.userEmail && log.userEmail !== '-' && (
                          <span className="text-[11px] text-slate-400 block">{log.userEmail}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-700 text-sm max-w-md">
                      <p className="font-medium text-slate-800">{log.title}</p>
                      {log.details && log.details !== log.title && (
                        <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-400 text-xs whitespace-nowrap">
                      {log.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle size={24} className="text-slate-300" />
                      <p className="text-base font-medium text-slate-600">ไม่พบรายการ Logs ตามเงื่อนไข</p>
                      <p className="text-xs text-slate-400">เมื่อมีการกระทำในระบบ (เช่น สมาชิกส่งงาน, สร้างคอนเทนต์, ล็อกอิน) ระบบจะบันทึกลงในหน้านี้แบบเรียลไทม์</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
