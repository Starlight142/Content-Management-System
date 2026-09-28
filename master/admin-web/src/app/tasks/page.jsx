"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Clock, 
  CheckSquare, 
  Calendar,
  RefreshCw,
  Radio,
  CheckCircle2,
  FolderKanban,
  Settings2
} from 'lucide-react';
import { presenceClient, apiFetch } from '../../services/presenceClient';

const INITIAL_TASK_TYPES = [
  { id: 1, name: 'Scripting', description: 'เขียนบทและวางโครงสร้างเนื้อหา', defaultDuration: '2 Days' },
  { id: 2, name: 'Filming', description: 'ถ่ายทำวิดีโอหรือบันทึกเสียง', defaultDuration: '1 Day' },
  { id: 3, name: 'Editing', description: 'ตัดต่อและใส่เอฟเฟกต์ (Post-Production)', defaultDuration: '3 Days' },
  { id: 4, name: 'Graphic Design', description: 'ทำภาพปก (Thumbnail) และกราฟิกประกอบ', defaultDuration: '1 Day' },
  { id: 5, name: 'Sound Design', description: 'ออกแบบเสียงและดนตรีประกอบ (Sound & Mixing)', defaultDuration: '1 Day' },
  { id: 6, name: 'SEO & Publishing', description: 'จัดทำ Metadata, แฮชแท็ก และตั้งเวลาโพสต์', defaultDuration: '1 Day' },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('ALL_TASKS'); // 'ALL_TASKS' | 'TASK_TYPES'

  // Tab 1: Real System Tasks from /api/tasks
  const [tasks, setTasks] = useState([]);
  const [contents, setContents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');

  // Modal: Create New Task
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContentId, setNewTaskContentId] = useState('');
  const [newTaskType, setNewTaskType] = useState('Editing');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Tab 2: Task Types Master (Persisted in localStorage)
  const [taskTypes, setTaskTypes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_master_task_types');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // fallback to INITIAL_TASK_TYPES
        }
      }
    }
    return INITIAL_TASK_TYPES;
  });
  const [typeSearch, setTypeSearch] = useState('');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [typeDescription, setTypeDescription] = useState('');
  const [typeDefaultDuration, setTypeDefaultDuration] = useState('1 Day');

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Save Task Types to localStorage when changed
  const saveTaskTypes = (newTypes) => {
    setTaskTypes(newTypes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_master_task_types', JSON.stringify(newTypes));
    }
  };

  // Fetch real Tasks, Contents, and Users
  const fetchTasksData = useCallback(async () => {
    try {
      const [tData, cData, uData] = await Promise.all([
        apiFetch('/tasks').catch(() => []),
        apiFetch('/contents').catch(() => []),
        apiFetch('/users').catch(() => []),
      ]);

      if (Array.isArray(tData)) setTasks(tData);
      if (Array.isArray(cData)) {
        setContents(cData);
        if (cData.length > 0) {
          setNewTaskContentId((prev) => prev || (cData[0]._id || cData[0].id));
        }
      }
      if (Array.isArray(uData)) {
        setUsers(uData);
        if (uData.length > 0) {
          setNewTaskAssignee((prev) => prev || (uData[0]._id || uData[0].id));
        }
      }
    } catch (err) {
      console.warn('Error fetching tasks data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    Promise.all([
      apiFetch('/tasks').catch(() => []),
      apiFetch('/contents').catch(() => []),
      apiFetch('/users').catch(() => []),
    ]).then(([tData, cData, uData]) => {
      if (!isMounted) return;
      if (Array.isArray(tData)) setTasks(tData);
      if (Array.isArray(cData)) {
        setContents(cData);
        if (cData.length > 0) {
          setNewTaskContentId((prev) => prev || (cData[0]._id || cData[0].id));
        }
      }
      if (Array.isArray(uData)) {
        setUsers(uData);
        if (uData.length > 0) {
          setNewTaskAssignee((prev) => prev || (uData[0]._id || uData[0].id));
        }
      }
    }).catch((err) => {
      console.warn('Initial tasks load error:', err.message);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    presenceClient.connect('admin_tasks_monitor');

    const handleConn = (payload) => {
      if (isMounted) setIsWsConnected(!!payload?.isConnected);
    };

    const handleTaskChange = () => {
      if (isMounted) fetchTasksData();
    };

    presenceClient.on('CONNECTION_CHANGE', handleConn);
    presenceClient.on('TASK_CREATED', handleTaskChange);
    presenceClient.on('TASK_UPDATED', handleTaskChange);
    presenceClient.on('TASK_DELETED', handleTaskChange);

    return () => {
      isMounted = false;
      presenceClient.off('CONNECTION_CHANGE', handleConn);
      presenceClient.off('TASK_CREATED', handleTaskChange);
      presenceClient.off('TASK_UPDATED', handleTaskChange);
      presenceClient.off('TASK_DELETED', handleTaskChange);
    };
  }, [fetchTasksData]);

  // Handle Create Task in MongoDB
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert('กรุณากรอกชื่องาน');
      return;
    }

    try {
      setSubmittingTask(true);
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          contentId: newTaskContentId || null,
          taskType: newTaskType,
          assignedTo: newTaskAssignee || null,
          dueDate: newTaskDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          notes: newTaskNotes,
        }),
      });

      if (res?.task) {
        setTasks((prev) => [res.task, ...prev]);
      }
      showToast('มอบหมายงานใหม่ลงในฐานข้อมูลสำเร็จ!');
      setIsCreateTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskNotes('');
      fetchTasksData();
    } catch (err) {
      alert(`ไม่สามารถสร้างงานได้: ${err.message}`);
    } finally {
      setSubmittingTask(false);
    }
  };

  // Handle Quick Status Change
  const handleQuickStatusChange = async (taskId, nextStatus) => {
    // Optimistic
    setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? { ...t, status: nextStatus } : t)));

    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`เปลี่ยนสถานะงานเป็น ${nextStatus} สำเร็จ`);
    } catch (err) {
      alert(`เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ${err.message}`);
      fetchTasksData();
    }
  };

  // Handle Delete Task from MongoDB
  const handleDeleteTask = async (taskId) => {
    if (!confirm('คุณต้องการลบงานนี้ออกจากระบบใช่หรือไม่?')) return;

    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
      showToast('ลบงานออกจากระบบเรียบร้อยแล้ว');
    } catch (err) {
      alert(`ไม่สามารถลบงานได้: ${err.message}`);
    }
  };

  // Task Types Master Handlers
  const handleOpenAddType = () => {
    setEditingType(null);
    setTypeName('');
    setTypeDescription('');
    setTypeDefaultDuration('1 Day');
    setIsTypeModalOpen(true);
  };

  const handleOpenEditType = (type) => {
    setEditingType(type);
    setTypeName(type.name);
    setTypeDescription(type.description);
    setTypeDefaultDuration(type.defaultDuration);
    setIsTypeModalOpen(true);
  };

  const handleSubmitType = (e) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    if (editingType) {
      const updated = taskTypes.map((t) => 
        t.id === editingType.id ? { ...t, name: typeName.trim(), description: typeDescription.trim(), defaultDuration: typeDefaultDuration } : t
      );
      saveTaskTypes(updated);
      showToast('แก้ไขประเภทงานมาตรฐานสำเร็จ');
    } else {
      const newType = {
        id: Date.now(),
        name: typeName.trim(),
        description: typeDescription.trim() || 'ไม่มีรายละเอียดเพิ่มเติม',
        defaultDuration: typeDefaultDuration,
      };
      saveTaskTypes([...taskTypes, newType]);
      showToast('เพิ่มประเภทงานมาตรฐานใหม่เรียบร้อย');
    }

    setIsTypeModalOpen(false);
  };

  const handleDeleteType = (id) => {
    if (confirm('คุณต้องการลบประเภทงานนี้ใช่หรือไม่?')) {
      const updated = taskTypes.filter((t) => t.id !== id);
      saveTaskTypes(updated);
      showToast('ลบประเภทงานมาตรฐานเรียบร้อยแล้ว');
    }
  };

  // Filtered lists
  const filteredTasks = tasks.filter((t) => {
    const s = taskSearch.toLowerCase();
    const assigneeName = t.assignedTo
      ? `${t.assignedTo.firstName || ''} ${t.assignedTo.lastName || ''} ${t.assignedTo.username || ''}`.toLowerCase()
      : 'unassigned';
    const contentTitle = (t.contentId?.title || '').toLowerCase();
    const titleMatch = (t.title || '').toLowerCase().includes(s);
    const typeMatch = (t.taskType || '').toLowerCase().includes(s);
    const searchMatch = titleMatch || typeMatch || assigneeName.includes(s) || contentTitle.includes(s);

    if (taskStatusFilter === 'ALL') return searchMatch;
    return searchMatch && t.status === taskStatusFilter;
  });

  const filteredTypes = taskTypes.filter((t) => 
    t.name.toLowerCase().includes(typeSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(typeSearch.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks & Workflow Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            ศูนย์กลางติดตามงานจริงในระบบ (Admin Req 4 & User Req 7) เชื่อมต่อฐานข้อมูล MongoDB แบบเรียลไทม์
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio size={13} className={isWsConnected ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
            <span>{isWsConnected ? 'Socket Live' : 'Connecting...'}</span>
          </div>
          {activeTab === 'ALL_TASKS' ? (
            <>
              <button 
                onClick={fetchTasksData}
                disabled={loading}
                className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
                <span>รีเฟรช</span>
              </button>
              <button 
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
              >
                <Plus size={16} />
                <span>มอบหมายงานใหม่</span>
              </button>
            </>
          ) : (
            <button 
              onClick={handleOpenAddType}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
            >
              <Plus size={16} />
              <span>เพิ่มประเภทงานใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ALL_TASKS')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
            activeTab === 'ALL_TASKS'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderKanban size={17} />
          <span>งานทั้งหมดในระบบ ({tasks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('TASK_TYPES')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
            activeTab === 'TASK_TYPES'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings2 size={17} />
          <span>ประเภทงานมาตรฐาน Master ({taskTypes.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL TASKS (REAL DATABASE) */}
      {activeTab === 'ALL_TASKS' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={17} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="ค้นหางาน, คอนเทนต์, หรือชื่อผู้รับผิดชอบ..." 
                className="bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder:text-slate-400 w-full"
              />
              {taskSearch && (
                <button onClick={() => setTaskSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((st) => (
                <button
                  key={st}
                  onClick={() => setTaskStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    taskStatusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'ALL' ? 'ทั้งหมด' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-5">ชื่องาน (Task Name)</th>
                    <th className="py-3.5 px-5">คอนเทนต์ที่เกี่ยวข้อง (Content)</th>
                    <th className="py-3.5 px-5">ผู้รับผิดชอบ (Assignee)</th>
                    <th className="py-3.5 px-5">กำหนดส่ง (Due Date)</th>
                    <th className="py-3.5 px-5">สถานะ (Status)</th>
                    <th className="py-3.5 px-5 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw size={22} className="animate-spin text-blue-600" />
                          <p className="text-sm font-medium">กำลังโหลดข้อมูลงานจากฐานข้อมูล MongoDB...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((t) => {
                      const taskId = t._id || t.id;
                      const assigneeName = t.assignedTo
                        ? `${t.assignedTo.firstName || ''} ${t.assignedTo.lastName || ''}`.trim() || t.assignedTo.username
                        : 'ยังไม่ได้มอบหมาย';
                      const dueDate = t.dueDate ? t.dueDate.split('T')[0] : '-';

                      return (
                        <tr key={taskId} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-5">
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <CheckSquare size={16} className="text-blue-600 shrink-0" />
                                <span>{t.title}</span>
                              </div>
                              <span className="text-[11px] text-slate-500 inline-block mt-0.5 font-medium px-2 py-0.5 bg-slate-100 rounded">
                                {t.taskType || 'General'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-700 text-sm">
                            {t.contentId?.title ? (
                              <span className="font-medium text-slate-900">{t.contentId.title}</span>
                            ) : (
                              <span className="text-slate-400 italic">งานทั่วไป (ไม่มี Content แม่)</span>
                            )}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                {assigneeName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-slate-800">{assigneeName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-600 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <Calendar size={13} className="text-slate-400" />
                              {dueDate}
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <select
                              value={t.status || 'TODO'}
                              onChange={(e) => handleQuickStatusChange(taskId, e.target.value)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-hidden hover:border-blue-400 focus:border-blue-500 cursor-pointer shadow-2xs"
                            >
                              <option value="TODO">⚪ TODO</option>
                              <option value="IN_PROGRESS">🔵 IN_PROGRESS</option>
                              <option value="REVIEW">🟠 REVIEW</option>
                              <option value="DONE">🟢 DONE</option>
                            </select>
                          </td>
                          <td className="py-4 px-5 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteTask(taskId)}
                              title="ลบงานนี้"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CheckSquare size={24} className="text-slate-300" />
                          <p className="text-base font-medium text-slate-600">ไม่พบรายการงาน</p>
                          <p className="text-xs text-slate-400">กดปุ่ม &quot;มอบหมายงานใหม่&quot; เพื่อสร้างงานจริงลงในระบบ</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASK TYPES MASTER */}
      {activeTab === 'TASK_TYPES' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรือคำอธิบายประเภทงาน..." 
              className="bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400 w-full"
            />
            {typeSearch && (
              <button onClick={() => setTypeSearch('')} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Types Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Task Type Name</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Default Duration</th>
                  <th className="py-3.5 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTypes.length > 0 ? (
                  filteredTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-900 flex items-center gap-2">
                          <CheckSquare size={16} className="text-blue-600" />
                          {type.name}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-600 text-sm">{type.description}</td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Clock size={13} className="text-slate-400" />
                          {type.defaultDuration}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleOpenEditType(type)}
                            title="แก้ไขประเภทงาน"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteType(type.id)}
                            title="ลบประเภทงาน"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      ไม่พบประเภทงานที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Real Task */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">มอบหมายงานใหม่ (Assign Task)</h3>
              <button 
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่องาน (Task Title) *</label>
                <input 
                  type="text" 
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="เช่น ตัดต่อคลิป EP.1, ออกแบบภาพปก Thumbnail" 
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ผูกกับ Content (ไม่บังคับ)</label>
                <select
                  value={newTaskContentId}
                  onChange={(e) => setNewTaskContentId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="">-- ไม่ระบุ (งานทั่วไป) --</option>
                  {contents.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.title} ({c.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทงาน (Task Type)</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 bg-white"
                  >
                    {taskTypes.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">มอบหมายให้ (Assignee)</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="">-- ยังไม่ระบุ --</option>
                    {users.map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">กำหนดส่งงาน (Due Date)</label>
                <input 
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำแนะนำหรือโน้ตเพิ่มเติม (Notes)</label>
                <textarea 
                  rows={2}
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="ระบุข้อกำหนดเฉพาะ เช่น ใช้โทนสีฟ้า, เน้นช่วงนาทีที่ 01:20..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingTask ? 'กำลังสร้าง...' : 'บันทึกและมอบหมายงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Task Type Master */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingType ? 'แก้ไขประเภทงานมาตรฐาน' : 'เพิ่มประเภทงานมาตรฐานใหม่'}
              </h3>
              <button 
                onClick={() => setIsTypeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitType} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อประเภทงาน (Task Name) *</label>
                <input 
                  type="text" 
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="เช่น Video Editing, Sound Mixing, Color Grading" 
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบายงาน (Description)</label>
                <textarea 
                  rows={2}
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  placeholder="อธิบายขอบเขตของประเภทงานนี้ในกระบวนการผลิต..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ระยะเวลามาตรฐาน (Default Duration)</label>
                <select
                  value={typeDefaultDuration}
                  onChange={(e) => setTypeDefaultDuration(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="1 Day">1 วัน (1 Day)</option>
                  <option value="2 Days">2 วัน (2 Days)</option>
                  <option value="3 Days">3 วัน (3 Days)</option>
                  <option value="5 Days">5 วัน (5 Days)</option>
                  <option value="1 Week">1 สัปดาห์ (1 Week)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTypeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  {editingType ? 'บันทึกการแก้ไข' : 'เพิ่มประเภทงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
