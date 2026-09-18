"use client";

import { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Trash2, 
  Edit2, 
  X, 
  ShieldCheck, 
  Calendar, 
  Check, 
  ExternalLink 
} from 'lucide-react';

export default function LegalPage() {
  const [articles, setArticles] = useState([
    { 
      id: 1, 
      title: 'ลิขสิทธิ์เพลงและดนตรีประกอบเชิงพาณิชย์', 
      category: 'Music & Audio', 
      updated: '2026-09-01',
      source: 'กรมทรัพย์สินทางปัญญา',
      content: 'ต้องใช้เพลงที่ได้รับอนุญาตแบบ Commercial License เท่านั้น ห้ามนำเพลงที่มีลิขสิทธิ์ส่วนบุคคลมาตัดต่อลงคลิปที่มีสปอนเซอร์'
    },
    { 
      id: 2, 
      title: 'แนวปฏิบัติการเบลอหน้าบุคคลภายนอก (PDPA)', 
      category: 'PDPA', 
      updated: '2026-09-10',
      source: 'พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล',
      content: 'การถ่ายทำในที่สาธารณะ หากติดหน้าบุคคลภายนอกที่ไม่ใช่บุคคลสาธารณะโดยมิได้ยินยอม ต้องทำการเบลอใบหน้าหรือตัดทอนออก'
    },
    { 
      id: 3, 
      title: 'ข้อจำกัดการโฆษณาและระบุคำเตือนสินค้า', 
      category: 'Advertising', 
      updated: '2026-08-15',
      source: 'สคบ. และ อย.',
      content: 'การรีวิวสินค้าประเภทอาหารเสริม ยา หรือเครื่องสำอาง ต้องมีข้อความระบุชัดเจนว่าได้รับการจ้างวาน (Sponsored) และห้ามโฆษณาเกินจริง'
    },
    { 
      id: 4, 
      title: 'กฎชุมชนและระเบียบแพลตฟอร์ม TikTok', 
      category: 'Platform Rules', 
      updated: '2026-09-12',
      source: 'TikTok Community Guidelines 2026',
      content: 'ห้ามเนื้อหาที่มีความรุนแรง การคุกคาม และคลิปที่มีพฤติกรรมเสี่ยงอันตรายโดยไม่มีคำเตือน'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingArticle, setViewingArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Music & Audio');
  const [formSource, setFormSource] = useState('');
  const [formContent, setFormContent] = useState('');

  const categories = ['ALL', 'Music & Audio', 'PDPA', 'Advertising', 'Platform Rules', 'Copyright'];

  const filteredArticles = articles.filter((a) => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateArticle = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newArticle = {
      id: Date.now(),
      title: formTitle,
      category: formCategory,
      source: formSource || 'เอกสารภายในองค์กร',
      content: formContent || 'ไม่มีเนื้อหารายละเอียด',
      updated: new Date().toISOString().split('T')[0]
    };

    setArticles([newArticle, ...articles]);
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleUpdateArticle = (e) => {
    e.preventDefault();
    if (!editingArticle || !formTitle.trim()) return;

    setArticles(articles.map(a => a.id === editingArticle.id ? {
      ...a,
      title: formTitle,
      category: formCategory,
      source: formSource,
      content: formContent,
      updated: new Date().toISOString().split('T')[0]
    } : a));

    resetForm();
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id) => {
    if (confirm('คุณต้องการลบข้อกำหนดกฎหมายนี้ใช่หรือไม่?')) {
      setArticles(articles.filter(a => a.id !== id));
      if (viewingArticle?.id === id) setViewingArticle(null);
    }
  };

  const openEditModal = (article) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormCategory(article.category);
    setFormSource(article.source);
    setFormContent(article.content);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('Music & Audio');
    setFormSource('');
    setFormContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Legal Database & Compliance</h1>
          <p className="text-slate-500 text-sm mt-1">คลังความรู้กฎหมาย ลิขสิทธิ์ และรายการ Checklist สำหรับทีมผลิต Content</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer"
        >
          <Plus size={18} />
          <span>เพิ่มข้อกำหนดใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 w-full md:w-96 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาข้อกำหนด, หมวดหมู่, หรือเนื้อหา..." 
            className="bg-transparent border-none outline-hidden text-sm text-slate-800 placeholder:text-slate-400 w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'ทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-5">Article Title</th>
              <th className="py-3.5 px-5">Category</th>
              <th className="py-3.5 px-5">Source / แหล่งอ้างอิง</th>
              <th className="py-3.5 px-5">Last Updated</th>
              <th className="py-3.5 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-5">
                    <p 
                      onClick={() => setViewingArticle(article)}
                      className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition"
                    >
                      {article.title}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{article.content}</p>
                  </td>
                  <td className="py-4 px-5">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200">
                      {article.category}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-600 text-xs font-medium">
                    {article.source}
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-xs whitespace-nowrap">
                    {article.updated}
                  </td>
                  <td className="py-4 px-5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => setViewingArticle(article)}
                        title="ดูเนื้อหาเต็ม"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                      >
                        <FileText size={17} />
                      </button>
                      <button 
                        onClick={() => openEditModal(article)}
                        title="แก้ไข"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition cursor-pointer"
                      >
                        <Edit2 size={17} />
                      </button>
                      <button 
                        onClick={() => handleDeleteArticle(article.id)}
                        title="ลบ"
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
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  ไม่พบข้อกำหนดกฎหมายที่ตรงกับการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: View Full Details */}
      {viewingArticle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
                  {viewingArticle.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{viewingArticle.title}</h2>
              </div>
              <button 
                onClick={() => setViewingArticle(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs text-slate-500 space-y-1">
              <p><strong className="text-slate-700">แหล่งอ้างอิง:</strong> {viewingArticle.source}</p>
              <p><strong className="text-slate-700">อัปเดตล่าสุด:</strong> {viewingArticle.updated}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ข้อกำหนดและแนวทางปฏิบัติ:</label>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed max-h-60 overflow-y-auto">
                {viewingArticle.content}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                onClick={() => { const a = viewingArticle; setViewingArticle(null); openEditModal(a); }}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition cursor-pointer"
              >
                แก้ไขข้อกำหนดนี้
              </button>
              <button 
                onClick={() => setViewingArticle(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Article */}
      {(isAddModalOpen || editingArticle) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingArticle ? 'แก้ไขข้อกำหนดกฎหมาย' : 'เพิ่มข้อกำหนดกฎหมายใหม่'}
              </h2>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingArticle(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingArticle ? handleUpdateArticle : handleCreateArticle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">หัวข้อข้อกำหนด *</label>
                <input 
                  type="text" 
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น ลิขสิทธิ์รูปภาพ Stock"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">หมวดหมู่</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                  >
                    <option value="Music & Audio">Music & Audio</option>
                    <option value="PDPA">PDPA</option>
                    <option value="Advertising">Advertising</option>
                    <option value="Platform Rules">Platform Rules</option>
                    <option value="Copyright">Copyright</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">แหล่งอ้างอิง</label>
                  <input 
                    type="text" 
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="เช่น กฎกระทรวง..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เนื้อหาและแนวปฏิบัติ *</label>
                <textarea 
                  rows={4}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="ระบุข้อควรระวังหรือแนวทางที่ทีมงานต้องปฏิบัติตาม..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingArticle(null); }}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  {editingArticle ? 'บันทึกการแก้ไข' : 'เพิ่มข้อกำหนด'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
