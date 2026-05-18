import { 
  Settings, 
  ChevronRight, 
  Calendar, 
  User, 
  Lock, 
  Mail, 
  Bell, 
  CreditCard, 
  Palette, 
  Code, 
  Database, 
  RefreshCcw, 
  Trash2, 
  Download, 
  Upload, 
  FileText, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Switch } from '#/components/ui/switch';
import { useState } from 'react';

export const SettingsManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('general');

  const sidebarItems = [
    { id: 'general', label: 'General Settings', desc: 'Platform and basic settings', icon: Settings },
    { id: 'profile', label: 'Profile Settings', desc: 'Update your profile information', icon: User },
    { id: 'security', label: 'Security Settings', desc: 'Password and security', icon: Lock },
    { id: 'email', label: 'Email Settings', desc: 'Email preferences', icon: Mail },
    { id: 'notifications', label: 'Notification Settings', desc: 'Notification preferences', icon: Bell },
    { id: 'payment', label: 'Payment Settings', desc: 'Payment and payout settings', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', desc: 'Theme and appearance', icon: Palette },
    { id: 'api', label: 'API Settings', desc: 'API keys and integrations', icon: Code },
    { id: 'system', label: 'System Settings', desc: 'System configuration', icon: Settings },
    { id: 'backup', label: 'Backup & Restore', desc: 'Backup and restore data', icon: Database },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Settings</h1>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 px-4 py-1.5 border-r border-slate-50">
               <Calendar size={14} className="text-dash-brand" />
               <span className="text-[11px] font-bold text-slate-600">May 12 - May 18, 2024</span>
               <ChevronRight size={12} className="rotate-90 text-slate-300" />
             </div>
             <div className="p-1.5 px-2">
                <div className="w-6 h-6 rounded-lg bg-dash-brand/5 flex items-center justify-center text-dash-brand">
                  <Settings size={14} />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar: Settings Navigation */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${
                  activeSubTab === item.id 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activeSubTab === item.id ? 'bg-white shadow-sm' : 'bg-slate-50'
                }`}>
                  <item.icon size={16} strokeWidth={activeSubTab === item.id ? 2.5 : 2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black leading-tight">{item.label}</p>
                  <p className={`text-[9px] font-bold truncate ${
                    activeSubTab === item.id ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column: General Settings Form */}
        <div className="xl:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[16px] font-black text-[#1e293b]">General Settings</h3>
              <p className="text-[11px] font-bold text-slate-400">Manage your platform general settings and preferences.</p>
            </div>
            <Button className="bg-white hover:bg-emerald-600 hover:text-white text-emerald-600 border border-emerald-100 font-black text-[11px] px-6 h-10 rounded-xl transition-all shadow-sm">
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Name</label>
              <Input defaultValue="Vastu-Rent" className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Tagline</label>
              <Input defaultValue="Rent Anything. Live in Harmony." className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email</label>
              <Input defaultValue="support@vastu-rent.com" className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
              <Input defaultValue="+91 98765 43210" className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Currency</label>
              <div className="relative">
                <select className="w-full h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20">
                  <option>INR (₹) - Indian Rupee</option>
                  <option>USD ($) - US Dollar</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-4.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Timezone</label>
              <div className="relative">
                <select className="w-full h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20">
                  <option>(GMT+05:30) Asia/Kolkata</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-4.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Format</label>
              <div className="relative">
                <select className="w-full h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20">
                  <option>DD MMM YYYY</option>
                  <option>MM/DD/YYYY</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-4.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Format</label>
              <div className="relative">
                <select className="w-full h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20">
                  <option>12 Hour (AM/PM)</option>
                  <option>24 Hour</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-4.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {[
              { label: 'Allow New User Registration', desc: 'Allow new users to register on the platform', active: true },
              { label: 'Email Verification Required', desc: 'Require email verification for new users', active: true },
              { label: 'Auto Approve Listings', desc: 'Automatically approve new listings', active: false },
              { label: 'Maintenance Mode', desc: 'Put platform in maintenance mode', active: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-black text-[#1e293b]">{item.label}</p>
                  <p className="text-[10px] font-bold text-slate-400">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.active} className="data-[state=checked]:bg-emerald-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions & Account Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[15px] font-black text-[#1e293b] mb-6 uppercase tracking-widest">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Clear Cache', desc: 'Clear application cache', icon: Trash2 },
                { label: 'System Backup', desc: 'Create system backup', icon: RefreshCcw },
                { label: 'Import Data', desc: 'Import data from file', icon: Upload },
                { label: 'Export Data', desc: 'Export platform data', icon: Download },
                { label: 'System Logs', desc: 'View system logs', icon: FileText },
              ].map((action, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors border border-transparent group-hover:border-slate-100">
                    <action.icon size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-[#1e293b]">{action.label}</p>
                    <p className="text-[9px] font-bold text-slate-400">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[15px] font-black text-[#1e293b] mb-6 uppercase tracking-widest">Account Information</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">User Type</span>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2.5">Super Admin</Badge>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Member Since</span>
                  <span className="text-[11px] font-black text-[#1e293b]">01 Jan 2024</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Last Login</span>
                  <span className="text-[11px] font-black text-[#1e293b]">18 May 2024, 10:30 AM</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Account Status</span>
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
               </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-[15px] font-black text-[#1e293b] mb-6 uppercase tracking-widest">Storage Usage</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[11px] font-black text-[#1e293b]">45.8 GB / 100 GB Used</p>
                   <p className="text-[11px] font-black text-[#1e293b]">45%</p>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <button className="w-full flex items-center justify-between text-[11px] font-black text-slate-400 hover:text-dash-brand mt-2 group">
                   View Storage Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Security Notice Footer */}
      <div className="bg-slate-50 p-6 px-10 rounded-[2rem] border border-slate-100 flex items-center justify-between group">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[13px] font-black text-[#1e293b]">Security Notice</p>
               <p className="text-[10px] font-bold text-slate-400">Make sure to keep your settings secure and monitor platform activity regularly.</p>
            </div>
         </div>
         <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-[11px] flex items-center gap-2 hover:bg-white transition-all shadow-sm">
            View Security Settings <ChevronRight size={14} />
         </Button>
      </div>
    </div>
  );
};
