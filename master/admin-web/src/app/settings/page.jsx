"use client";

import { useState } from 'react';
import { 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Shield, 
  Key, 
  Globe 
} from 'lucide-react';

export default function SettingsPage() {
  const [studioName, setStudioName] = useState('Production Studio 69');
  const [adminEmail, setAdminEmail] = useState('admin@studio.com');
  const [timezone, setTimezone] = useState('Asia/Bangkok (UTC+07:00)');
  const [language, setLanguage] = useState('th');

  // Toggle states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [managerApprovalRequired, setManagerApprovalRequired] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // API keys mock
  const [ytKey, setYtKey] = useState('AIzaSyD-mock-youtube-api-key-2026');
  const [tiktokSecret, setTiktokSecret] = useState('tt_secret_client_token_99x');

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!');
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่ากลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      setStudioName('Production Studio 69');
      setAdminEmail('admin@studio.com');
      setEmailAlerts(true);
      setManagerApprovalRequired(true);
      setTwoFactorAuth(false);
      showToast('รีเซ็ตการตั้งค่าสำเร็จ');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm z-50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">ตั้งค่าทั่วไป สิทธิ์ความปลอดภัย และการเชื่อมต่อ API ของระบบ</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>คืนค่าเดิม</span>
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            <Save size={15} />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>

      {/* Form Settings Cards */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Globe size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">ข้อมูลสตูดิโอทั่วไป (General Info)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อทีม / สตูดิโอ</label>
              <input 
                type="text" 
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมลผู้ดูแลระบบ (Admin Email)</label>
              <input 
                type="email" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เขตเวลา (Timezone)</label>
              <input 
                type="text" 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ภาษาเริ่มต้น</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-blue-500"
              >
                <option value="th">ไทย (Thai)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workflow & Compliance Policies */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield size={18} className="text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">นโยบายและการอนุมัติ (Workflow Policies)</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">บังคับให้ Manager อนุมัติชิ้นงานก่อนเผยแพร่ (Manager Approval Required)</p>
                <p className="text-xs text-slate-500">Content จะเปลี่ยนสถานะเป็น PUBLISHED ไม่ได้จนกว่า Manager จะกดอนุมัติคุณภาพชิ้นงาน</p>
              </div>
              <input 
                type="checkbox" 
                checked={managerApprovalRequired}
                onChange={(e) => setManagerApprovalRequired(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">การแจ้งเตือนทางอีเมลเมื่อมีงานส่งตรวจ</p>
                <p className="text-xs text-slate-500">ส่งอีเมลแจ้งเตือนไปยัง Manager ทันทีเมื่อ Member อัปเดตงานเป็น REVIEW</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">เปิดใช้งาน Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-500">เพิ่มการยืนยันตัวตน 2 ขั้นตอนสำหรับบัญชี Admin ทุกคน</p>
              </div>
              <input 
                type="checkbox" 
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* API Integration Keys */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Key size={18} className="text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">การเชื่อมต่อ Platform APIs (Phase 4)</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">YouTube Data API v3 Key</label>
              <input 
                type="password" 
                value={ytKey}
                onChange={(e) => setYtKey(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">TikTok Developer Client Secret</label>
              <input 
                type="password" 
                value={tiktokSecret}
                onChange={(e) => setTiktokSecret(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            <Save size={16} />
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>
        </div>
      </form>
    </div>
  );
}

