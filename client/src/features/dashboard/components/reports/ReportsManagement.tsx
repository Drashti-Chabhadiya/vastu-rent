import { 
  BarChart3, 
  ChevronRight, 
  Calendar, 
  Download, 
  Users, 
  Package, 
  Star, 
  ShoppingCart,
  FileText,
  Layout,
  IndianRupee,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';

export const ReportsManagement = () => {
  const stats = [
    { label: 'Total Orders', value: '1,245', sub: '+18.6% from last week', icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Revenue', value: '₹12,45,000', sub: '+22.4% from last week', icon: IndianRupee, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Users', value: '2,580', sub: '+12.8% from last week', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Listings', value: '1,850', sub: '+15.3% from last week', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total Reviews', value: '890', sub: '+9.5% from last week', icon: Star, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const categories = [
    { name: 'Home Decor', orders: 320, revenue: '₹3,20,000', growth: '+24.5%', color: 'emerald' },
    { name: 'Electronics', orders: 280, revenue: '₹2,80,000', growth: '+18.2%', color: 'blue' },
    { name: 'Vehicles', orders: 210, revenue: '₹2,10,000', growth: '+15.7%', color: 'amber' },
    { name: 'Fashion', orders: 180, revenue: '₹1,80,000', growth: '+10.3%', color: 'emerald' },
    { name: 'Event Essentials', orders: 150, revenue: '₹1,55,000', growth: '- 5.6%', color: 'rose' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">Reports</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Reports</h1>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 px-4 py-1.5 border-r border-slate-50">
               <Calendar size={14} className="text-dash-brand" />
               <span className="text-[11px] font-bold text-slate-600">May 12 - May 18, 2024</span>
               <ChevronRight size={12} className="rotate-90 text-slate-300" />
             </div>
             <div className="p-1.5 px-2">
                <div className="w-6 h-6 rounded-lg bg-dash-brand/5 flex items-center justify-center text-dash-brand">
                  <BarChart3 size={14} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide">
         <div className="mb-8">
            <h3 className="text-[15px] font-black text-[#1e293b]">Overview</h3>
         </div>
         <div className="flex gap-6 min-w-max pb-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex-1 min-w-[200px] flex items-center gap-4 p-5 rounded-3xl border border-slate-50 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] transition-all hover:shadow-md cursor-default group">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-black text-[#1e293b]">{stat.value}</p>
                  <p className={`text-[9px] font-bold ${stat.color}`}>{stat.sub}</p>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart & Table */}
        <div className="lg:col-span-2 space-y-6">
           {/* Revenue Overview Chart */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[15px] font-black text-[#1e293b]">Revenue Overview</h3>
                 <div className="relative">
                    <button className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-[11px] font-black text-slate-700">
                       This Week <ChevronDown size={14} />
                    </button>
                 </div>
              </div>
              
              {/* Mock Chart SVG */}
              <div className="h-64 w-full relative pt-8">
                 <div className="absolute inset-0 flex flex-col justify-between py-2">
                    {[200000, 150000, 100000, 50000, 0].map(val => (
                      <div key={val} className="flex items-center gap-4">
                         <span className="text-[10px] font-bold text-slate-300 w-12">₹{val.toLocaleString()}</span>
                         <div className="flex-1 h-px bg-slate-50"></div>
                      </div>
                    ))}
                 </div>
                 <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <path 
                      d="M 50,150 L 150,120 L 250,120 L 350,70 L 450,110 L 550,120 L 650,160" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    <path 
                      d="M 50,150 L 150,120 L 250,120 L 350,70 L 450,110 L 550,120 L 650,160 L 650,200 L 50,200 Z" 
                      fill="url(#gradient)" 
                      opacity="0.1"
                    />
                    <defs>
                       <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                       </linearGradient>
                    </defs>
                    {[50, 150, 250, 350, 450, 550, 650].map((x, i) => (
                      <circle key={i} cx={x} cy={[150, 120, 120, 70, 110, 120, 160][i]} r="4" fill="#10b981" />
                    ))}
                 </svg>
                 
                 {/* Tooltip Mock */}
                 <div className="absolute top-[30px] left-[320px] bg-[#1e293b] p-3 rounded-2xl shadow-xl z-10 pointer-events-none animate-in fade-in zoom-in duration-300">
                    <p className="text-[8px] font-bold text-slate-400 mb-1">15 May 2024</p>
                    <p className="text-[14px] font-black text-white">₹1,85,000</p>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e293b] rotate-45"></div>
                 </div>

                 {/* X-Axis Labels */}
                 <div className="absolute bottom-[-30px] left-0 right-0 flex justify-between px-10">
                    {['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May'].map(day => (
                      <span key={day} className="text-[10px] font-bold text-slate-400">{day}</span>
                    ))}
                 </div>
              </div>
           </div>

           {/* Top Performing Categories */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-[15px] font-black text-[#1e293b]">Top Performing Categories</h3>
                 </div>
                 <button className="text-[11px] font-black text-emerald-600 hover:underline">View Full Report</button>
              </div>
              <div className="overflow-x-auto -mx-2">
                 <table className="w-full">
                    <thead>
                       <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                          <th className="text-left px-4 py-3">Category</th>
                          <th className="text-left px-4 py-3">Total Orders</th>
                          <th className="text-left px-4 py-3">Revenue</th>
                          <th className="text-left px-4 py-3">Growth</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {categories.map((cat, i) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                             <td className="px-4 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                      {/* Placeholder for category image */}
                                      <Layout size={16} className="w-full h-full p-2.5 text-slate-300" />
                                   </div>
                                   <p className="text-[12px] font-black text-[#1e293b]">{cat.name}</p>
                                </div>
                             </td>
                             <td className="px-4 py-5 font-bold text-slate-700 text-[12px]">{cat.orders}</td>
                             <td className="px-4 py-5 font-black text-[#1e293b] text-[12px]">{cat.revenue}</td>
                             <td className="px-4 py-5">
                                <Badge className={`px-2 py-0.5 rounded-lg border-none text-[8px] font-black ${
                                   cat.growth.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                                }`}>
                                   {cat.growth.includes('+') ? '↑' : '↓'} {cat.growth.replace('+', '').replace('-', '')}
                                </Badge>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <Button variant="ghost" className="w-full mt-6 h-12 bg-slate-50 rounded-2xl text-[11px] font-black text-slate-700 flex items-center justify-center gap-2">
                 <FileText size={16} /> View Category Report
              </Button>
           </div>
        </div>

        {/* Right Column: Reports Summary & Downloads */}
        <div className="space-y-6">
           {/* Reports Summary */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[15px] font-black text-[#1e293b]">Reports Summary</h3>
                 <button className="text-[11px] font-black text-emerald-600 hover:underline">View All</button>
              </div>
              <div className="space-y-2">
                 {[
                   { label: 'Sales Report', desc: 'Overview of sales and revenue', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600' },
                   { label: 'User Report', desc: 'Summary of user registrations and activity', icon: Users, color: 'bg-blue-50 text-blue-600' },
                   { label: 'Order Report', desc: 'Detailed report of all orders', icon: Package, color: 'bg-purple-50 text-purple-600' },
                   { label: 'Listing Report', desc: 'Overview of all listings and performance', icon: Layout, color: 'bg-orange-50 text-orange-600' },
                   { label: 'Review Report', desc: 'Summary of reviews and ratings', icon: Star, color: 'bg-rose-50 text-rose-600' },
                   { label: 'Payout Report', desc: 'Overview of payouts and transactions', icon: IndianRupee, color: 'bg-indigo-50 text-indigo-600' },
                 ].map((report, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className={`w-9 h-9 rounded-xl ${report.color} flex items-center justify-center`}>
                            <report.icon size={16} strokeWidth={2.5} />
                         </div>
                         <div>
                            <p className="text-[11px] font-black text-[#1e293b]">{report.label}</p>
                            <p className="text-[9px] font-bold text-slate-400">{report.desc}</p>
                         </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-dash-brand" />
                   </div>
                ))}
              </div>
           </div>

           {/* Download Reports */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-[15px] font-black text-[#1e293b] mb-2">Download Reports</h3>
              <p className="text-[11px] font-bold text-slate-400 mb-8">Download and export reports in your preferred format.</p>
              
              <div className="space-y-4">
                 {[
                   { label: 'Sales Report (This Week)', type: 'PDF • Generated on 18 May 2024' },
                   { label: 'User Report (This Week)', type: 'Excel • Generated on 18 May 2024' },
                   { label: 'Order Report (This Week)', type: 'PDF • Generated on 18 May 2024' },
                   { label: 'Revenue Report (This Week)', type: 'Excel • Generated on 18 May 2024' },
                 ].map((dl, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 group hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-600 border border-slate-50 shadow-sm">
                            <Download size={14} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-[#1e293b]">{dl.label}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{dl.type}</p>
                         </div>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 hover:text-emerald-600 border border-slate-50 shadow-sm">
                         <Download size={14} />
                      </button>
                   </div>
                 ))}
              </div>

              <Button variant="outline" className="w-full mt-8 h-12 rounded-2xl border-emerald-100 text-emerald-600 font-black text-[11px] flex items-center justify-center gap-2 hover:bg-emerald-50 shadow-sm transition-all">
                 <Layout size={16} /> View All Reports
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};
