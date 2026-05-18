import { 
  Bell, 
  ChevronRight, 
  Search, 
  ShoppingCart, 
  CreditCard, 
  AlertCircle, 
  Check
} from 'lucide-react';
import { Input } from '#/components/ui/input';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '#/hook';
import { useState } from 'react';

export const NotificationsManagement = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return ShoppingCart;
      case 'payment': return CreditCard;
      case 'alert': return AlertCircle;
      default: return Bell;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-emerald-50 text-emerald-600';
      case 'payment': return 'bg-amber-50 text-amber-500';
      case 'alert': return 'bg-rose-50 text-rose-500';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const filteredNotifs = notifications?.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                          (filterType === 'unread' && !n.isRead) ||
                          n.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">Notifications</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Live System Alerts & Notifications</h1>
        </div>
      </div>

      {/* Main Grid: Content & Settings Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Notifications List */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
             <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <Input 
                  placeholder="Search notifications..." 
                  className="h-10 pl-9 pr-4 bg-slate-50 border-none rounded-xl text-[11px] font-bold focus:ring-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div>
                <select 
                  className="h-10 border border-slate-200 rounded-xl px-3 bg-white text-xs font-bold"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Alerts</option>
                  <option value="unread">Unread Only</option>
                  <option value="booking">Bookings</option>
                  <option value="payment">Payments</option>
                  <option value="alert">Alerts</option>
                </select>
             </div>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading alerts...</div>
            ) : filteredNotifs?.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No alerts matching your criteria.</div>
            ) : (
              filteredNotifs?.map((notif) => {
                const Icon = getIcon(notif.type);
                const colorCls = getColorClasses(notif.type);
                return (
                  <div 
                    key={notif.id} 
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group ${
                      !notif.isRead ? 'bg-slate-50/70 border-slate-100' : ''
                    }`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                           <Icon size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                           <p className="text-[12px] font-black text-[#1e293b]">{notif.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-300">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                     </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Settings & Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-[15px] font-black text-[#1e293b] mb-1 uppercase tracking-widest">Notification Summary</h3>
             <p className="text-[11px] font-bold text-slate-400 mb-8">System summary stats.</p>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Bell size={14} className="text-blue-500" />
                      <span className="text-[11px] font-black text-slate-500">Unread count</span>
                   </div>
                   <span className="text-[11px] font-black text-[#1e293b]">{unreadCount}</span>
                </div>
             </div>

             {unreadCount > 0 && (
               <button 
                 onClick={handleMarkAllRead}
                 className="w-full mt-8 text-emerald-600 text-[11px] font-black flex items-center justify-center gap-2 hover:underline"
               >
                  <Check size={14} /> Mark all as read
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
