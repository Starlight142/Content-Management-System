"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  MoreVertical, 
  Plus, 
  X, 
  Check, 
  Trash2, 
  Video, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Radio,
  CheckSquare,
} from 'lucide-react';
import { presenceClient, apiFetch } from '../../services/presenceClient';

// Brand SVG Icons (ปลอดภัย ไม่พึ่งพา external library)
const YoutubeIcon = () => (
  <svg className="w-4 h-4 text-red-600 inline mr-1.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 text-pink-600 inline mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TiktokIcon = () => (
  <svg className="w-4 h-4 text-slate-900 inline mr-1.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export default function ContentsPage() {
  const [contents, setContents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);

  // States for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // States for Modals
  const [selectedContent, setSelectedContent] = useState(null); // for View Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // for Create Modal
  const [activeMenuId, setActiveMenuId] = useState(null); // for Actions dropdown

  // Form state for new content
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('TikTok');
  const [newDate, setNewDate] = useState('2026-09-30');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Subtask assignment inside content modal
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('Editing');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-05');
  const [taskNotes, setTaskNotes] = useState('');
  const [subtaskSubmitting, setSubtaskSubmitting] = useState(false);

  // Format backend content document to table view model
  const formatContentItem = (c) => ({
    id: c._id || c.id,
    _id: c._id || c.id,
    title: c.title,
    platform: c.platform || 'General',
    status: c.status || 'PLANNING',
    creator: c.createdBy?.firstName ? `${c.createdBy.firstName} ${c.createdBy.lastName || ''}`.trim() : (c.createdBy?.username || 'ผู้ดูแลระบบ'),
    date: c.dueDate ? c.dueDate.split('T')[0] : (c.createdAt ? c.createdAt.split('T')[0] : '2026-09-30'),
    description: c.description || 'ยังไม่มีคำอธิบายเพิ่มเติม',
    category: c.category || 'General',
    progress: c.progress || 0,
    reviewHistory: c.reviewHistory || [],
    versions: c.versions || [],
  });

  const refreshContents = useCallback(async () => {
    try {
      const [cData, tData] = await Promise.all([
        apiFetch('/contents').catch(() => null),
        apiFetch('/tasks').catch(() => null),
      ]);
      if (Array.isArray(cData)) {
        setContents(cData.map(formatContentItem));
      }
      if (Array.isArray(tData)) {
        setTasks(tData);
      }
    } catch (err) {
      console.warn('Failed to load data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const [cData, tData, uData] = await Promise.all([
          apiFetch('/contents').catch(() => null),
          apiFetch('/tasks').catch(() => null),
          apiFetch('/users').catch(() => null),
        ]);
        if (isMounted) {
          if (Array.isArray(cData)) setContents(cData.map(formatContentItem));
          if (Array.isArray(tData)) setTasks(tData);
          if (Array.isArray(uData)) {
            setUsers(uData);
            if (uData.length > 0) setTaskAssignee(uData[0]._id || uData[0].id);
          }
        }
      } catch (err) {
        console.warn('Initial contents load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitial();

    // Connect WebSocket
    presenceClient.connect('admin_web_contents');

    const handleConn = (payload) => {
      if (isMounted) setIsWsConnected(!!payload?.isConnected);
    };

    const handleContentEvent = () => {
      if (isMounted) refreshContents();
    };

    presenceClient.on('CONNECTION_CHANGE', handleConn);
    presenceClient.on('CONTENT_CREATED', handleContentEvent);
    presenceClient.on('CONTENT_UPDATED', handleContentEvent);
    presenceClient.on('CONTENT_DELETED', handleContentEvent);
    presenceClient.on('TASK_CREATED', handleContentEvent);
    presenceClient.on('TASK_UPDATED', handleContentEvent);
    presenceClient.on('TASK_DELETED', handleContentEvent);

    return () => {
      isMounted = false;
      presenceClient.off('CONNECTION_CHANGE', handleConn);
      presenceClient.off('CONTENT_CREATED', handleContentEvent);
      presenceClient.off('CONTENT_UPDATED', handleContentEvent);
      presenceClient.off('CONTENT_DELETED', handleContentEvent);
      presenceClient.off('TASK_CREATED', handleContentEvent);
      presenceClient.off('TASK_UPDATED', handleContentEvent);
      presenceClient.off('TASK_DELETED', handleContentEvent);
    };
  }, [refreshContents]);

  // Status visual mapping with clean, high-contrast colors
  const getStatusBadge = (status) => {
    switch(status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            PUBLISHED
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} className="text-amber-600" />
            REVIEW
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            APPROVED
          </span>
        );
      case 'REVISION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertCircle size={13} className="text-orange-600" />
            REVISION
          </span>
        );
      case 'PRODUCTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Video size={13} className="text-blue-600" />
            PRODUCTION
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle size={13} className="text-slate-500" />
            PLANNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Platform icon helper
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'YouTube':
        return <YoutubeIcon />;
      case 'Instagram':
        return <InstagramIcon />;
      case 'TikTok':
        return <TiktokIcon />;
      default:
        return <Video size={16} className="text-slate-700 inline mr-1.5" />;
    }
  };

  // Filter content logic
  const filteredContents = contents.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.platform.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action: Add new content
  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const created = await apiFetch('/contents', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          platform: newPlatform,
          description: newDescription.trim(),
          dueDate: newDate,
        }),
      });

      if (created?.content) {
        const item = formatContentItem(created.content);
        setContents((prev) => [item, ...prev.filter((c) => c.id !== item.id)]);
      } else {
        await refreshContents();
      }

      setNewTitle('');
      setNewDescription('');
      setIsAddModalOpen(false);
    } catch (err) {
      alert('ไม่สามารถสร้างคอนเทนต์ได้: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Delete content
  const handleDeleteContent = async (id) => {
    if (confirm('คุณต้องการลบคอนเทนต์นี้ใช่หรือไม่?')) {
      try {
        await apiFetch(`/contents/${id}`, { method: 'DELETE' });
        setContents((prev) => prev.filter((item) => item.id !== id));
        setActiveMenuId(null);
        if (selectedContent?.id === id) setSelectedContent(null);
      } catch (err) {
        alert('ไม่สามารถลบคอนเทนต์ได้: ' + err.message);
      }
    }
  };

  // Action: Change status
  const handleUpdateStatus = async (id, nextStatus) => {
    // Optimistic update
    setContents((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
    if (selectedContent?.id === id) {
      setSelectedContent((prev) => ({ ...prev, status: nextStatus }));
    }
    setActiveMenuId(null);

    try {
      await apiFetch(`/contents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.warn('Status update API error, falling back to refresh:', err.message);
      await refreshContents();
    }
  };

  // Action: Create Subtask for Content (Admin Req 3 & 4)
  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedContent) return;

    try {
      setSubtaskSubmitting(true);
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle.trim(),
          contentId: selectedContent.id,
          taskType,
          assignedTo: taskAssignee || null,
          dueDate: taskDueDate,
          notes: taskNotes,
        }),
      });

      if (res?.task) {
        setTasks((prev) => [res.task, ...prev]);
      } else {
        const assigneeObj = users.find((u) => String(u._id || u.id) === String(taskAssignee));
        const fallback = {
          _id: `task_${Date.now()}`,
          id: Date.now(),
          title: taskTitle.trim(),
          contentId: { _id: selectedContent.id, title: selectedContent.title },
          taskType,
          assignedTo: assigneeObj || null,
          status: 'TODO',
          dueDate: taskDueDate,
          notes: taskNotes,
        };
        setTasks((prev) => [fallback, ...prev]);
      }

      setTaskTitle('');
      setTaskNotes('');
      setIsAssignTaskOpen(false);
    } catch (err) {
      alert(`ไม่สามารถมอบหมายงานได้: ${err.message}`);
    } finally {
      setSubtaskSubmitting(false);
    }
  };

  // Action: Toggle Subtask Status
  const handleToggleSubtaskStatus = async (taskId, currentStatus) => {
    const cycle = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'REVIEW',
      REVIEW: 'DONE',
      DONE: 'TODO',
    };
    const next = cycle[currentStatus] || 'TODO';

    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? { ...t, status: next } : t)));
    } catch {
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? { ...t, status: next } : t)));
    }
  };


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contents Management</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการและติดตามสถานะกระบวนการผลิต Content ทั้งหมดในระบบ</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio size={14} className={isWsConnected ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
            <span>{isWsConnected ? 'Real-time WebSocket Live' : 'Connecting WebSocket...'}</span>
          </div>
          <button
            onClick={refreshContents}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium shadow-2xs cursor-pointer transition-all"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>สร้าง Content ใหม่</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อคอนเทนต์, ผู้สร้าง, หรือแพลตฟอร์ม..." 
            className="bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400 w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 p-0.5">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Buttons & Dropdown */}
        <div className="relative flex items-center gap-2">
          <button 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
              statusFilter !== 'ALL' 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} />
            <span>สถานะ: {statusFilter === 'ALL' ? 'ทั้งหมด' : statusFilter}</span>
          </button>

          {/* Filter Dropdown Popover */}
          {isFilterMenuOpen && (
            <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
              {['ALL', 'PLANNING', 'PRODUCTION', 'REVIEW', 'REVISION', 'APPROVED', 'PUBLISHED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    statusFilter === st ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{st === 'ALL' ? 'ทั้งหมด (All)' : st}</span>
                  {statusFilter === st && <Check size={16} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}

          {statusFilter !== 'ALL' && (
            <button 
              onClick={() => setStatusFilter('ALL')}
              className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 ml-1"
            >
              รีเซ็ต
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-5">Content Title</th>
                <th className="py-3.5 px-5">Platform</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Creator</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredContents.length > 0 ? (
                filteredContents.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedContent(item)}>
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-700 whitespace-nowrap">
                      {getPlatformIcon(item.platform)}
                      {item.platform}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {item.creator}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 whitespace-nowrap text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {item.date}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <div className="relative inline-flex items-center justify-center gap-1">
                        {/* View Button */}
                        <button 
                          onClick={() => setSelectedContent(item)}
                          title="ดูรายละเอียด"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>

                        {/* More Actions Toggle */}
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          title="เมนูเพิ่มเติม"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu for single row */}
                        {activeMenuId === item.id && (
                          <div className="absolute right-0 top-8 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left">
                            <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              เปลี่ยนสถานะเป็น
                            </p>
                            {['PLANNING', 'PRODUCTION', 'REVIEW', 'REVISION', 'APPROVED', 'PUBLISHED'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateStatus(item.id, st)}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  item.status === st ? 'text-blue-600 font-semibold' : 'text-slate-700'
                                }`}
                              >
                                <span>{st}</span>
                                {item.status === st && <Check size={14} />}
                              </button>
                            ))}
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => handleDeleteContent(item.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 size={14} />
                              <span>ลบ Content นี้</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-base font-medium text-slate-600">ไม่พบคอนเทนต์ที่ตรงกับคำค้นหา</p>
                    <p className="text-sm text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p>
                    <button 
                      onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                      className="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                    >
                      ล้างการค้นหาทั้งหมด
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Content Detail */}
      {selectedContent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
                  Content Details #{selectedContent.id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedContent.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedContent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">แพลตฟอร์ม</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  {getPlatformIcon(selectedContent.platform)}
                  {selectedContent.platform}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">สถานะปัจจุบัน</span>
                <div className="mt-1">{getStatusBadge(selectedContent.status)}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">ผู้รับผิดชอบ</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedContent.creator}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">กำหนดส่งงาน</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedContent.date}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-medium mb-1">รายละเอียดงาน</span>
              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedContent.description}
              </p>
            </div>

            {/* Change Status Fast Buttons */}
            <div>
              <span className="text-xs text-slate-400 block font-medium mb-2">อัปเดตสถานะงานด่วน:</span>
              <div className="grid grid-cols-4 gap-2">
                {['PLANNING', 'PRODUCTION', 'REVIEW', 'PUBLISHED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedContent.id, st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      selectedContent.status === st
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtasks Management (Admin Req 3 & 4) */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    งานย่อยใน Content นี้ ({
                      tasks.filter((t) => {
                        const cId = t.contentId?._id || t.contentId?.id || t.contentId;
                        return String(cId) === String(selectedContent.id);
                      }).length
                    })
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssignTaskOpen(!isAssignTaskOpen)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{isAssignTaskOpen ? 'ยกเลิก' : '+ มอบหมายงานย่อย'}</span>
                </button>
              </div>

              {/* Subtask Creation Form */}
              {isAssignTaskOpen && (
                <form onSubmit={handleCreateSubtask} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-100">
                  <p className="text-xs font-bold text-slate-800">มอบหมายงานย่อยใหม่</p>
                  <div>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="ชื่องานย่อย เช่น ตัดต่อคลิปความยาว 60 วินาที..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ประเภทงาน</label>
                      <select
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500"
                      >
                        <option value="Scripting">Scripting (เขียนบท)</option>
                        <option value="Filming">Filming (ถ่ายทำ)</option>
                        <option value="Editing">Editing (ตัดต่อ)</option>
                        <option value="Graphic Design">Graphic Design (ทำภาพ/ปก)</option>
                        <option value="Sound Design">Sound Design (ทำเสียง)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ผู้รับผิดชอบ</label>
                      <select
                        value={taskAssignee}
                        onChange={(e) => setTaskAssignee(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500"
                      >
                        <option value="">-- ยังไม่ระบุ --</option>
                        {users.map((u) => {
                          const uid = u._id || u.id;
                          const uName = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || u.username);
                          return (
                            <option key={uid} value={uid}>
                              {uName} ({u.role})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">กำหนดส่ง</label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">บันทึกเพิ่มเติม</label>
                      <input
                        type="text"
                        value={taskNotes}
                        onChange={(e) => setTaskNotes(e.target.value)}
                        placeholder="ระบุข้อกำหนดเพิ่มเติม..."
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAssignTaskOpen(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={subtaskSubmitting}
                      className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {subtaskSubmitting ? 'กำลังมอบหมาย...' : 'บันทึกงานย่อย'}
                    </button>
                  </div>
                </form>
              )}

              {/* Subtask Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(() => {
                  const contentTasks = tasks.filter((t) => {
                    const cId = t.contentId?._id || t.contentId?.id || t.contentId;
                    return String(cId) === String(selectedContent.id);
                  });

                  if (contentTasks.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        ยังไม่มีงานย่อยในคอนเทนต์นี้ (คลิก &quot;+ มอบหมายงานย่อย&quot; เพื่อเริ่มแจกจ่ายงาน)
                      </p>
                    );
                  }

                  return contentTasks.map((t) => {
                    const tid = t._id || t.id;
                    const assignee = t.assignedTo || {};
                    const assigneeName = assignee.firstName
                      ? `${assignee.firstName} ${assignee.lastName || ''}`.trim()
                      : (assignee.username || 'ยังไม่ระบุ');

                    return (
                      <div
                        key={tid}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                            {t.taskType || 'Task'}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{t.title}</p>
                            <p className="text-[10px] text-slate-400">
                              ผู้รับผิดชอบ: {assigneeName} • กำหนดส่ง: {t.dueDate ? t.dueDate.split('T')[0] : 'เร็วๆ นี้'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSubtaskStatus(tid, t.status)}
                          title="คลิกเพื่อสลับสถานะ (TODO -> IN_PROGRESS -> REVIEW -> DONE)"
                          className={`shrink-0 ml-2 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border transition hover:scale-105 active:scale-95 ${
                            t.status === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : t.status === 'REVIEW'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {t.status} ⟳
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button 
                onClick={() => setSelectedContent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Content */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">สร้าง Content ใหม่</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddContent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อ Content *</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น รีวิว iPhone 17..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">แพลตฟอร์ม</label>
                  <select 
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                  >
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">กำหนดส่ง</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">รายละเอียด</label>
                <textarea 
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="สรุปเนื้อหาคร่าวๆ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  <span>{submitting ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
