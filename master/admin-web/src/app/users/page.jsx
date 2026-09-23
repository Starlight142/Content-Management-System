"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, RefreshCw, Radio } from 'lucide-react';
import { presenceClient, apiFetch } from '../../services/presenceClient';

export default function UsersPage() {
  const [users, setUsers] = useState([
    { _id: '1', id: 1, name: 'Somchai Admin', firstName: 'สมชาย', lastName: 'ดูแลระบบ', email: 'admin@studio.com', role: 'ADMIN', status: 'Active', isOnline: false },
    { _id: '2', id: 2, name: 'Somsri Manager', firstName: 'สมศรี', lastName: 'จัดการทีม', email: 'manager@studio.com', role: 'MANAGER', status: 'Active', isOnline: false },
    { _id: '3', id: 3, name: 'John Creator', firstName: 'John', lastName: 'Editor', email: 'member@studio.com', role: 'MEMBER', status: 'Offline', isOnline: false },
    { _id: '4', id: 4, name: 'Jane Script', firstName: 'Jane', lastName: 'Script', email: 'jane@studio.com', role: 'MEMBER', status: 'Active', isOnline: false },
    { _id: '5', id: 5, name: 'Mike Graphic', firstName: 'Mike', lastName: 'Graphic', email: 'mike@studio.com', role: 'MEMBER', status: 'Active', isOnline: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ONLINE, OFFLINE
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [submitting, setSubmitting] = useState(false);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/users');
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      }
    } catch {
      // Keep state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Initial load from MongoDB
    const fetchInitial = async () => {
      try {
        const data = await apiFetch('/users');
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      } catch {
        // Fallback to initial seed
      }
    };

    fetchInitial();

    // Connect to WebSocket Presence Server
    presenceClient.connect('admin_web_dashboard');

    // Subscribe to Real-time Presence & Database change events
    const unsubscribe = presenceClient.subscribe((event) => {
      if (event.type === 'CONNECTION_CHANGE') {
        setIsWsConnected(event.isConnected);
      } else if (event.type === 'ONLINE_USERS_SYNC') {
        const onlineSet = new Set((event.onlineUserIds || []).map(String));
        setUsers((prev) =>
          prev.map((u) => {
            const uid = String(u._id || u.id);
            const isOnline = onlineSet.has(uid);
            return {
              ...u,
              isOnline,
              status: isOnline ? 'Active' : 'Offline',
            };
          })
        );
      } else if (event.type === 'USER_STATUS_CHANGED') {
        const targetId = String(event.userId);
        setUsers((prev) =>
          prev.map((u) => {
            const uid = String(u._id || u.id);
            if (uid === targetId) {
              return {
                ...u,
                isOnline: !!event.isOnline,
                status: event.isOnline ? 'Active' : 'Offline',
                lastActiveAt: event.lastActiveAt || u.lastActiveAt,
                workingStatus: event.workingStatus || u.workingStatus,
              };
            }
            return u;
          })
        );
      } else if (event.type === 'USER_CREATED' && event.user) {
        setUsers((prev) => {
          const exists = prev.some((u) => String(u._id || u.id) === String(event.user._id || event.user.id));
          return exists ? prev : [event.user, ...prev];
        });
      } else if (event.type === 'USER_UPDATED' && event.user) {
        const updatedId = String(event.user._id || event.user.id);
        setUsers((prev) =>
          prev.map((u) => (String(u._id || u.id) === updatedId ? { ...u, ...event.user } : u))
        );
      } else if (event.type === 'USER_DELETED' && event.userId) {
        const deletedId = String(event.userId);
        setUsers((prev) => prev.filter((u) => String(u._id || u.id) !== deletedId));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const onlineCount = users.filter((u) => u.isOnline).length;
  const offlineCount = users.length - onlineCount;

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''} ${u.username || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ONLINE') return u.isOnline;
    if (statusFilter === 'OFFLINE') return !u.isOnline;
    return true;
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      setSubmitting(true);
      const names = name.trim().split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '';

      const created = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          username: email.split('@')[0],
          email,
          role,
        }),
      });

      if (created?.user) {
        setUsers((prev) => [created.user, ...prev.filter((u) => u.email !== email)]);
      } else {
        // Fallback local state
        const fallback = {
          _id: `u_${Date.now()}`,
          id: Date.now(),
          firstName,
          lastName,
          name,
          email,
          role,
          status: 'Active',
          isOnline: false,
        };
        setUsers((prev) => [fallback, ...prev]);
      }

      setName('');
      setEmail('');
      setIsModalOpen(false);
    } catch (err) {
      alert(`ไม่สามารถเพิ่มผู้ใช้ได้: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('คุณต้องการลบผู้ใช้นี้ออกจากระบบและฐานข้อมูลใช่หรือไม่?')) return;

    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
    } catch {
      // Local fallback removal
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
    }
  };

  const handleToggleRole = async (id) => {
    const roles = ['MEMBER', 'MANAGER', 'ADMIN'];
    const target = users.find((u) => (u._id || u.id) === id);
    if (!target) return;

    const nextRoleIndex = (roles.indexOf(target.role) + 1) % roles.length;
    const nextRole = roles[nextRoleIndex];

    try {
      await apiFetch(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      });
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === id ? { ...u, role: nextRole } : u))
      );
    } catch {
      // Local fallback
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === id ? { ...u, role: nextRole } : u))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Teams</h1>
            {/* Live Sync Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isWsConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Radio size={13} className={isWsConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />
              <span>{isWsConnected ? 'Real-time WebSocket Live' : 'Connecting WebSocket...'}</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            จัดการสมาชิกในทีม พร้อมตรวจจับสถานะ Online / Offline สดเชื่อมตรงกับฐานข้อมูล
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshUsers}
            title="รีเฟรชข้อมูลจากฐานข้อมูล"
            className="p-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
          >
            <Plus size={18} />
            <span>เพิ่มพนักงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, อีเมล หรือตำแหน่ง..."
            className="bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Presence Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('ONLINE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'ONLINE'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ออนไลน์ ({onlineCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('OFFLINE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'OFFLINE'
                ? 'bg-white text-slate-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>ออฟไลน์ ({offlineCount})</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-5">Member / Name</th>
              <th className="py-3.5 px-5">Email</th>
              <th className="py-3.5 px-5">Role (คลิกเพื่อเปลี่ยน)</th>
              <th className="py-3.5 px-5">Real-time Presence</th>
              <th className="py-3.5 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const uid = user._id || user.id;
                const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || user.username || 'User');
                const isOnline = !!user.isOnline;

                return (
                  <tr key={uid} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          {/* Live Presence Dot on Avatar */}
                          <span
                            title={isOnline ? 'ออนไลน์ขณะนี้' : 'ออฟไลน์'}
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              isOnline ? 'bg-emerald-500 ring-2 ring-emerald-200 animate-pulse' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{displayName}</p>
                          <p className="text-xs text-slate-400">@{user.username || user.email?.split('@')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500">{user.email}</td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleRole(uid)}
                        title="คลิกเพื่อสลับ Role (Member -> Manager -> Admin)"
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition hover:scale-105 active:scale-95 ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.role === 'MANAGER'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {user.role} ⟳
                      </button>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isOnline
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isOnline ? 'Online (กำลังใช้งาน)' : 'Offline (ไม่อยู่)'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleDeleteUser(uid)}
                        title="ลบผู้ใช้"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  {loading ? 'กำลังโหลดข้อมูลผู้ใช้...' : 'ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">เพิ่มผู้ใช้งานใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมล *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@studio.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ตำแหน่ง (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                >
                  <option value="MEMBER">MEMBER (ทีมงานผลิต)</option>
                  <option value="MANAGER">MANAGER (ผู้จัดการ/รีวิวงาน)</option>
                  <option value="ADMIN">ADMIN (ผู้ดูแลระบบ)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกลงฐานข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
