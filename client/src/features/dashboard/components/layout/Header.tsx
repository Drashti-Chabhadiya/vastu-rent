import { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  ChevronDown,
  Menu,
} from 'lucide-react';
import { authClient } from '#/lib/auth/auth-client';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [rangeType, setRangeType] = useState<'7days' | '30days' | 'thisMonth'>('7days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getFormattedRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (rangeType === '7days') {
      startDate.setDate(endDate.getDate() - 6);
    } else if (rangeType === '30days') {
      startDate.setDate(endDate.getDate() - 29);
    } else {
      // This Month
      startDate.setDate(1);
    }

    const formatMonthDay = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}, ${endDate.getFullYear()}`;
  };

  const getLabel = () => {
    switch (rangeType) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'thisMonth': return 'This Month';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors lg:hidden"
        >
          <Menu size={22} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-lg md:text-xl font-bold text-dash-text">Dashboard</h2>
          <p className="hidden md:block text-sm text-dash-text-muted">Welcome back! Here's what's happening with your platform.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Date Range Picker */}
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Calendar size={18} className="text-dash-brand" />
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{getLabel()}</span>
              <span className="text-xs font-bold text-[#1e293b]">{getFormattedRange()}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </div>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => { setRangeType('7days'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${
                    rangeType === '7days' ? 'text-dash-brand bg-emerald-50/50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Last 7 Days
                  {rangeType === '7days' && <span className="w-1.5 h-1.5 bg-dash-brand rounded-full" />}
                </button>
                <button
                  onClick={() => { setRangeType('30days'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${
                    rangeType === '30days' ? 'text-dash-brand bg-emerald-50/50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Last 30 Days
                  {rangeType === '30days' && <span className="w-1.5 h-1.5 bg-dash-brand rounded-full" />}
                </button>
                <button
                  onClick={() => { setRangeType('thisMonth'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${
                    rangeType === 'thisMonth' ? 'text-dash-brand bg-emerald-50/50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  This Month
                  {rangeType === 'thisMonth' && <span className="w-1.5 h-1.5 bg-dash-brand rounded-full" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 transition-all group">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Profile */}
        <button className="p-1 hover:bg-gray-50 rounded-full transition-all">
          {user?.image ? (
            <img 
              src={user.image} 
              alt={user.name || 'User'} 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-emerald-50"
            />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-dash-brand rounded-full flex items-center justify-center text-white font-black text-sm uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
