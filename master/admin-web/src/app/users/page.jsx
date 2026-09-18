"use client";

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, UserCheck } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Somchai Admin', email: 'somchai@cms.com', role: 'ADMIN', status: 'Active' },
    { id: 2, name: 'Somsri Manager', email: 'somsri@cms.com', role: 'MANAGER', status: 'Active' },
    { id: 3, name: 'John Creator', email: 'john@cms.com', role: 'MEMBER', status: 'Offline' },
    { id: 4, name: 'Jane Editor', email: 'jane@cms.com', role: 'MEMBER', status: 'Active' },
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser = {
      id: Date.now(),
      name,
      email,
      role,
      status: 'Active',
    };

    setUsers([newUser, ...users]);
    setName('');
    setEmail('');
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleToggleRole = (id) => {
    const roles = ['MEMBER', 'MANAGER', 'ADMIN'];
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextRoleIndex = (roles.indexOf(u.role) + 1) % roles.length;
        return { ...u, role: roles[nextRoleIndex] };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Teams</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการสมาชิก ทีมงาน และบทบาทหน้าที่ในระบบ</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
        >
          <Plus size={18} />
          <span>เพิ่มพนักงานใหม่</span>
        </button>
      </div>

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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-5">Email</th>
              <th className="py-3.5 px-5">Role (คลิกเพื่อเปลี่ยน)</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-5 font-semibold text-slate-900">{user.name}</td>
                  <td className="py-4 px-5 text-slate-500">{user.email}</td>
                  <td className="py-4 px-5">
                    <button 
                      onClick={() => handleToggleRole(user.id)}
                      title="คลิกเพื่อสลับ Role (Member -> Manager -> Admin)"
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition hover:scale-105 active:scale-95 ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                        user.role === 'MANAGER' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {user.role} ⟳
                    </button>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      title="ลบผู้ใช้"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  ไม่พบผู้ใช้งานที่ตรงกับคำค้นหา
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
                  placeholder="user@cms.com"
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
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
