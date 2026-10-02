"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  X, 
  RefreshCw, 
  Radio, 
  Users, 
  Briefcase, 
  UserPlus
} from 'lucide-react';
import { presenceClient, apiFetch } from '../../services/presenceClient';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('USERS'); // 'USERS' | 'TEAMS'

  const [users, setUsers] = useState([
    { _id: '1', id: 1, name: 'Somchai Admin', firstName: 'สมชาย', lastName: 'ดูแลระบบ', email: 'admin@studio.com', role: 'ADMIN', status: 'Active', isOnline: false },
    { _id: '2', id: 2, name: 'Somsri Manager', firstName: 'สมศรี', lastName: 'จัดการทีม', email: 'manager@studio.com', role: 'MANAGER', status: 'Active', isOnline: false },
    { _id: '3', id: 3, name: 'John Creator', firstName: 'John', lastName: 'Editor', email: 'member@studio.com', role: 'MEMBER', status: 'Offline', isOnline: false },
    { _id: '4', id: 4, name: 'Jane Script', firstName: 'Jane', lastName: 'Script', email: 'jane@studio.com', role: 'MEMBER', status: 'Active', isOnline: false },
    { _id: '5', id: 5, name: 'Mike Graphic', firstName: 'Mike', lastName: 'Graphic', email: 'mike@studio.com', role: 'MEMBER', status: 'Active', isOnline: false },
  ]);

  const [teams, setTeams] = useState([
    {
      _id: 't1',
      id: 1,
      name: 'ทีมผลิตวิดีโอ & คอนเทนต์หลัก',
      description: 'รับผิดชอบงานตัดต่อ โปรดักชัน และวางแผนปล่อยคอนเทนต์ YouTube ประจำสัปดาห์',
      members: [
        { user: { _id: '2', firstName: 'สมศรี', lastName: 'จัดการทีม', username: 'manager', role: 'MANAGER' }, roleInTeam: 'LEAD' },
        { user: { _id: '3', firstName: 'John', lastName: 'Editor', username: 'member', role: 'MEMBER' }, roleInTeam: 'EDITOR' },
        { user: { _id: '4', firstName: 'Jane', lastName: 'Script', username: 'jane', role: 'MEMBER' }, roleInTeam: 'CREATOR' },
      ],
      createdAt: '2026-09-01T00:00:00.000Z',
    },
    {
      _id: 't2',
      id: 2,
      name: 'ทีมครีเอทีฟ & ไวรัลสั้น (Short-Form)',
      description: 'โฟกัสคอนเทนต์สั้น TikTok, Instagram Reels และคลิปเกาะกระแสโซเชียล',
      members: [
        { user: { _id: '5', firstName: 'Mike', lastName: 'Graphic', username: 'mike', role: 'MEMBER' }, roleInTeam: 'DESIGNER' },
        { user: { _id: '3', firstName: 'John', lastName: 'Editor', username: 'member', role: 'MEMBER' }, roleInTeam: 'MEMBER' },
      ],
      createdAt: '2026-09-05T00:00:00.000Z',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(() => presenceClient.isConnected);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ONLINE, OFFLINE
  const [search, setSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  // Modals for User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [submitting, setSubmitting] = useState(false);

  // Modals for Teams
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCode, setNewTeamCode] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState('');

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState(null);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRoleInTeam, setNewMemberRoleInTeam] = useState('MEMBER');

  const refreshUsers = useCallback(async () => {
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
  }, []);

  const refreshTeams = useCallback(async () => {
    try {
      const data = await apiFetch('/teams');
      if (Array.isArray(data) && data.length > 0) {
        setTeams(data);
      }
    } catch {
      // Keep state
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshUsers(), refreshTeams()]);
  }, [refreshUsers, refreshTeams]);

  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const [uData, tData] = await Promise.all([
          apiFetch('/users').catch(() => null),
          apiFetch('/teams').catch(() => null),
        ]);
        if (isMounted) {
          if (Array.isArray(uData) && uData.length > 0) setUsers(uData);
          if (Array.isArray(tData) && tData.length > 0) setTeams(tData);
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
      isMounted = false;
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

  const filteredTeams = teams.filter((t) => {
    const matchesName = (t.name || '').toLowerCase().includes(teamSearch.toLowerCase());
    const matchesDesc = (t.description || '').toLowerCase().includes(teamSearch.toLowerCase());
    const matchesMembers = (t.members || []).some((m) => {
      const u = m.user || {};
      const uName = `${u.firstName || ''} ${u.lastName || ''} ${u.username || ''}`.toLowerCase();
      return uName.includes(teamSearch.toLowerCase());
    });
    return matchesName || matchesDesc || matchesMembers;
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
      setUsers((prev) =>
        prev.map((u) => ((u._id || u.id) === id ? { ...u, role: nextRole } : u))
      );
    }
  };

  // --- Team Actions ---
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      setSubmitting(true);
      const members = selectedLeaderId
        ? [{ user: selectedLeaderId, roleInTeam: 'LEAD' }]
        : [];

      const res = await apiFetch('/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: newTeamName.trim(),
          code: newTeamCode.trim().toUpperCase() || undefined,
          description: newTeamDesc.trim(),
          members,
        }),
      });

      if (res?.team) {
        // Populate leader object for display
        const leaderObj = users.find((u) => String(u._id || u.id) === String(selectedLeaderId));
        const finalTeam = {
          ...res.team,
          members: selectedLeaderId
            ? [{ user: leaderObj || { _id: selectedLeaderId, username: 'Leader' }, roleInTeam: 'LEAD' }]
            : [],
        };
        setTeams((prev) => [finalTeam, ...prev]);
      } else {
        const fallbackTeam = {
          _id: `t_${Date.now()}`,
          id: Date.now(),
          name: newTeamName.trim(),
          code: newTeamCode.trim().toUpperCase() || 'TEAM-NEW',
          description: newTeamDesc.trim(),
          members: selectedLeaderId
            ? [{ user: users.find((u) => String(u._id || u.id) === String(selectedLeaderId)), roleInTeam: 'LEAD' }]
            : [],
          createdAt: new Date().toISOString(),
        };
        setTeams((prev) => [fallbackTeam, ...prev]);
      }

      setNewTeamName('');
      setNewTeamCode('');
      setNewTeamDesc('');
      setSelectedLeaderId('');
      setIsCreateTeamModalOpen(false);
    } catch (err) {
      alert(`ไม่สามารถสร้างทีมได้: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('คุณต้องการลบโครงสร้างทีมนี้ใช่หรือไม่? (สมาชิกในทีมจะไม่ถูกลบออกจากระบบ)')) return;

    try {
      await apiFetch(`/teams/${teamId}`, { method: 'DELETE' });
      setTeams((prev) => prev.filter((t) => (t._id || t.id) !== teamId));
    } catch {
      setTeams((prev) => prev.filter((t) => (t._id || t.id) !== teamId));
    }
  };

  const handleOpenAddMember = (team) => {
    setSelectedTeamForMember(team);
    setNewMemberUserId(users[0]?._id || users[0]?.id || '');
    setNewMemberRoleInTeam('MEMBER');
    setIsAddMemberModalOpen(true);
  };

  const handleAddMemberToTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeamForMember || !newMemberUserId) return;

    const teamId = selectedTeamForMember._id || selectedTeamForMember.id;
    try {
      setSubmitting(true);
      await apiFetch(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify({
          userId: newMemberUserId,
          roleInTeam: newMemberRoleInTeam,
        }),
      });

      const memberUserObj = users.find((u) => String(u._id || u.id) === String(newMemberUserId));
      setTeams((prev) =>
        prev.map((t) => {
          if ((t._id || t.id) === teamId) {
            const currentMembers = t.members || [];
            return {
              ...t,
              members: [
                ...currentMembers.filter((m) => String(m.user?._id || m.user?.id) !== String(newMemberUserId)),
                { user: memberUserObj || { _id: newMemberUserId, username: 'Member' }, roleInTeam: newMemberRoleInTeam },
              ],
            };
          }
          return t;
        })
      );

      setIsAddMemberModalOpen(false);
    } catch (err) {
      alert(`ไม่สามารถเพิ่มสมาชิกเข้าทีมได้: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleInTeamBadge = (r) => {
    switch (r) {
      case 'LEAD':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">LEAD หัวหน้าทีม</span>;
      case 'CREATOR':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">CREATOR คิดคอนเทนต์</span>;
      case 'EDITOR':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">EDITOR ตัดต่อ</span>;
      case 'DESIGNER':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">DESIGNER กราฟิก</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">MEMBER สมาชิก</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Teams Management</h1>
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
            จัดการสมาชิกในระบบ พร้อมโครงสร้างทีม และตรวจจับสถานะ Online / Offline สดเชื่อมตรงกับฐานข้อมูล
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            title="รีเฟรชข้อมูลจากฐานข้อมูล"
            className="p-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {activeTab === 'USERS' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
            >
              <Plus size={18} />
              <span>เพิ่มพนักงานใหม่</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreateTeamModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
            >
              <Plus size={18} />
              <span>สร้างทีมใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users size={16} />
          <span>รายชื่อผู้ใช้งาน ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('TEAMS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'TEAMS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Briefcase size={16} />
          <span>โครงสร้างทีม ({teams.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
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
        </div>
      )}

      {/* TAB 2: TEAMS */}
      {activeTab === 'TEAMS' && (
        <div className="space-y-4">
          {/* Search Teams */}
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              placeholder="ค้นหาชื่อทีม, รายละเอียด หรือสมาชิก..."
              className="bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400 w-full"
            />
            {teamSearch && (
              <button onClick={() => setTeamSearch('')} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => {
                const teamId = team._id || team.id;
                const members = team.members || [];
                return (
                  <div
                    key={teamId}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      {/* Team Card Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-slate-900">{team.name}</h3>
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-[11px]">
                                {team.code || 'TEAM-A'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Users size={13} />
                              <span>สมาชิก {members.length} คน</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTeam(teamId)}
                          title="ลบทีม"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {team.description || 'ไม่มีคำอธิบายสำหรับทีมนี้'}
                      </p>

                      {/* Member Roster */}
                      <div className="mt-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          สมาชิกในทีม
                        </span>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {members.length > 0 ? (
                            members.map((m, idx) => {
                              const u = m.user || {};
                              const uName = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || 'สมาชิก');
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                                      {uName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800 leading-tight">{uName}</p>
                                      <p className="text-[10px] text-slate-400">@{u.username || 'user'}</p>
                                    </div>
                                  </div>
                                  <div>{getRoleInTeamBadge(m.roleInTeam)}</div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">ยังไม่มีสมาชิกในทีมนี้</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleOpenAddMember(team)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <UserPlus size={14} />
                        <span>เพิ่มสมาชิกเข้าทีม</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                ไม่พบโครงสร้างทีมที่ค้นหา
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Modal Create Team */}
      {isCreateTeamModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">สร้างโครงสร้างทีมใหม่</h2>
              <button onClick={() => setIsCreateTeamModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อทีม *</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="เช่น ทีมวิดีโอ & คอนเทนต์หลัก"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">รหัสเข้าร่วมทีม (Team Code)</label>
                <input
                  type="text"
                  value={newTeamCode}
                  onChange={(e) => setNewTeamCode(e.target.value.toUpperCase())}
                  placeholder="เช่น TEAM-C (เว้นว่างเพื่อสร้างให้อัตโนมัติ)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 font-mono uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">ใช้สำหรับให้สมาชิกกรอกตอนลงทะเบียนบน Mobile App</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">คำอธิบายทีม</label>
                <textarea
                  rows={3}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="หน้าที่ความรับผิดชอบของทีมนี้..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">หัวหน้าทีม (Team Lead)</label>
                <select
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                >
                  <option value="">-- เลือกหัวหน้าทีม (ถ้ามี) --</option>
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
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTeamModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'สร้างทีม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Member To Team */}
      {isAddMemberModalOpen && selectedTeamForMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">เพิ่มสมาชิกเข้าทีม</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTeamForMember.name}</p>
              </div>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMemberToTeam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เลือกผู้ใช้งาน *</label>
                <select
                  required
                  value={newMemberUserId}
                  onChange={(e) => setNewMemberUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                >
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
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">บทบาทในทีม (Role In Team)</label>
                <select
                  value={newMemberRoleInTeam}
                  onChange={(e) => setNewMemberRoleInTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                >
                  <option value="LEAD">LEAD (หัวหน้าทีม)</option>
                  <option value="CREATOR">CREATOR (คิดบท/คอนเทนต์)</option>
                  <option value="EDITOR">EDITOR (ตัดต่อวิดีโอ)</option>
                  <option value="DESIGNER">DESIGNER (กราฟิก/ปก)</option>
                  <option value="MEMBER">MEMBER (สมาชิกทั่วไป)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'เพิ่มเข้าทีม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
