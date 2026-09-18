"use client";

import { useState } from 'react';
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
  AlertCircle 
} from 'lucide-react';

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
  // Initial Mock Content
  const [contents, setContents] = useState([
    { 
      id: 1, 
      title: 'รีวิวแก็ดเจ็ตใหม่ 2026', 
      platform: 'YouTube', 
      status: 'PUBLISHED', 
      creator: 'John Creator', 
      date: '2026-09-15',
      description: 'รีวิวอุปกรณ์สมาร์ตโฮมและแก็ดเจ็ตเปิดตัวใหม่ในไตรมาส 3 เน้นจุดเด่นความคุ้มค่า'
    },
    { 
      id: 2, 
      title: 'สรุปข่าว AI ภายใน 1 นาที', 
      platform: 'TikTok', 
      status: 'REVIEW', 
      creator: 'Jane Editor', 
      date: '2026-09-16',
      description: 'วิดีโอสั้นแนวคิดใหม่ สรุปฟีเจอร์ AI ล่าสุดสำหรับคนทำงานออฟฟิศ'
    },
    { 
      id: 3, 
      title: 'Vlog พาเที่ยวออฟฟิศ', 
      platform: 'Instagram', 
      status: 'PRODUCTION', 
      creator: 'Somchai Admin', 
      date: '2026-09-18',
      description: 'คอนเทนต์สร้างภาพลักษณ์องค์กร พาดูเบื้องหลังการทำงานและบรรยากาศในทีม'
    },
    { 
      id: 4, 
      title: 'วิธีใช้ React Native', 
      platform: 'YouTube', 
      status: 'PLANNING', 
      creator: 'John Creator', 
      date: '2026-09-20',
      description: 'ซีรีส์สอนพื้นฐานการทำ Mobile App ด้วย React Native สำหรับผู้เริ่มต้น'
    },
  ]);

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
  const [newCreator, setNewCreator] = useState('Somchai Admin');
  const [newDate, setNewDate] = useState('2026-09-25');
  const [newDescription, setNewDescription] = useState('');

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
  const handleAddContent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newTitle,
      platform: newPlatform,
      status: 'PLANNING',
      creator: newCreator,
      date: newDate,
      description: newDescription || 'ยังไม่มีคำอธิบายเพิ่มเติม'
    };

    setContents([newItem, ...contents]);
    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  // Action: Delete content
  const handleDeleteContent = (id) => {
    if (confirm('คุณต้องการลบคอนเทนต์นี้ใช่หรือไม่?')) {
      setContents(contents.filter(item => item.id !== id));
      setActiveMenuId(null);
      if (selectedContent?.id === id) setSelectedContent(null);
    }
  };

  // Action: Change status
  const handleUpdateStatus = (id, nextStatus) => {
    setContents(contents.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    if (selectedContent?.id === id) {
      setSelectedContent(prev => ({ ...prev, status: nextStatus }));
    }
    setActiveMenuId(null);
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
          {/* Add Content Button */}
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
              {['ALL', 'PLANNING', 'PRODUCTION', 'REVIEW', 'PUBLISHED'].map((st) => (
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
                            {['PLANNING', 'PRODUCTION', 'REVIEW', 'PUBLISHED'].map((st) => (
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">ผู้รับผิดชอบ</label>
                <input 
                  type="text" 
                  value={newCreator}
                  onChange={(e) => setNewCreator(e.target.value)}
                  placeholder="ชื่อผู้สร้าง..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
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
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
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
