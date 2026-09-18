"use client";

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Clock, CheckSquare } from 'lucide-react';

export default function TaskTypesPage() {
  const [taskTypes, setTaskTypes] = useState([
    { id: 1, name: 'Scripting', description: 'เขียนบทและวางโครงสร้างเนื้อหา', defaultDuration: '2 Days' },
    { id: 2, name: 'Filming', description: 'ถ่ายทำวิดีโอหรือบันทึกเสียง', defaultDuration: '1 Day' },
    { id: 3, name: 'Editing', description: 'ตัดต่อและใส่เอฟเฟกต์ (Post-Production)', defaultDuration: '3 Days' },
    { id: 4, name: 'Graphic Design', description: 'ทำภาพปก (Thumbnail) และกราฟิกประกอบ', defaultDuration: '1 Day' },
    { id: 5, name: 'Legal Check', description: 'ตรวจสอบความถูกต้องและลิขสิทธิ์ก่อนเผยแพร่', defaultDuration: '1 Day' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultDuration, setDefaultDuration] = useState('1 Day');

  const filteredTasks = taskTypes.filter((t) => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingTask(null);
    setName('');
    setDescription('');
    setDefaultDuration('1 Day');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setName(task.name);
    setDescription(task.description);
    setDefaultDuration(task.defaultDuration);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTask) {
      setTaskTypes(taskTypes.map(t => t.id === editingTask.id ? {
        ...t,
        name,
        description,
        defaultDuration
      } : t));
    } else {
      const newTask = {
        id: Date.now(),
        name,
        description: description || 'ไม่มีรายละเอียดเพิ่มเติม',
        defaultDuration
      };
      setTaskTypes([...taskTypes, newTask]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('คุณต้องการลบประเภทงานนี้ใช่หรือไม่?')) {
      setTaskTypes(taskTypes.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Types Management</h1>
          <p className="text-slate-500 text-sm mt-1">กำหนดขั้นตอนและประเภทงานในกระบวนการผลิต Content</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
        >
          <Plus size={18} />
          <span>เพิ่มประเภทงานใหม่</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาชื่อหรือรายละเอียดประเภทงาน..." 
          className="bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400 w-full"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table Card */}
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
            {filteredTasks.length > 0 ? (
              filteredTasks.map((type) => (
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
                        onClick={() => handleOpenEdit(type)}
                        title="แก้ไขประเภทงาน"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                      >
                        <Edit2 size={17} />
                      </button>
                      <button 
                        onClick={() => handleDelete(type.id)}
                        title="ลบประเภทงาน"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  ไม่พบประเภทงานที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit Task Type */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingTask ? 'แก้ไขประเภทงาน' : 'เพิ่มประเภทงานใหม่'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อประเภทงาน *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Sound Design..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ระยะเวลาโดยประมาณ</label>
                <select
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                >
                  <option value="1 Day">1 Day</option>
                  <option value="2 Days">2 Days</option>
                  <option value="3 Days">3 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="1 Week">1 Week</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">คำอธิบาย</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดขอบเขตงาน..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
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
