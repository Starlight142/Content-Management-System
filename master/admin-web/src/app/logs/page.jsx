"use client";

import { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  X, 
  Download, 
  Trash2, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState([
    { id: 1, action: 'CREATE_USER', user: 'Somchai Admin', details: 'Created user Jane Editor', date: '2026-09-16 14:30:00' },
    { id: 2, action: 'UPDATE_CONTENT', user: 'Somsri Manager', details: 'Changed status of #2 to PRODUCTION', date: '2026-09-16 13:15:22' },
    { id: 3, action: 'DELETE_LEGAL', user: 'Somchai Admin', details: 'Deleted outdated rule #8', date: '2026-09-15 09:10:05' },
    { id: 4, action: 'LOGIN_FAILED', user: 'IP: 192.168.1.45', details: 'Invalid password attempt for admin', date: '2026-09-15 08:00:12' },
    { id: 5, action: 'CREATE_CONTENT', user: 'John Creator', details: 'Submitted draft: รีวิวแก็ดเจ็ตใหม่', date: '2026-09-14 18:22:10' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getActionBadge = (action) => {
    if (action.includes('CREATE')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{action}</span>;
    }
    if (action.includes('UPDATE')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{action}</span>;
    }
    if (action.includes('DELETE')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">{action}</span>;
    }
    if (action.includes('FAILED')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">{action}</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = actionFilter === 'ALL' || log.action.includes(actionFilter);
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    const header = "ID,Action,User,Details,Date\n";
    const rows = filteredLogs.map(l => `${l.id},"${l.action}","${l.user}","${l.details}","${l.date}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว!');
  };

  const handleClearLogs = () => {
    if (confirm('คุณต้องการล้างประวัติ Logs ทั้งหมดใช่หรือไม่?')) {
      setLogs([]);
      showToast('ล้างประวัติ Logs เรียบร้อยแล้ว');
    }
  };

  const handleRefresh = () => {
    showToast('อัปเดตข้อมูล Logs ล่าสุดแล้ว (Sync 100%)');
  };

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Logs & Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">Audit Trail ตรวจสอบประวัติการทำรายการย้อนหลังทั้งหมดของระบบ</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw size={15} />
            <span>รีเฟรช</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handleClearLogs}
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
          >
            <Trash2 size={15} />
            <span>ล้าง Logs</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหา Log ตามชื่อผู้ใช้, คำสั่ง, หรือรายละเอียด..." 
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
          {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'FAILED'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                actionFilter === act
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {act === 'ALL' ? 'คำสั่งทั้งหมด' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-5">Action Type</th>
              <th className="py-3.5 px-5">Performed By</th>
              <th className="py-3.5 px-5">Event Details</th>
              <th className="py-3.5 px-5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-5 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-900 whitespace-nowrap">
                    {log.user}
                  </td>
                  <td className="py-4 px-5 text-slate-600 text-sm">
                    {log.details}
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-xs whitespace-nowrap">
                    {log.date}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400">
                  ไม่พบรายการ Logs ตามเงื่อนไขที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
