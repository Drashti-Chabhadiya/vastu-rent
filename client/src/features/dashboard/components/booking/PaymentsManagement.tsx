import { 
  ChevronRight, 
  Calendar, 
  IndianRupee, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Zap
} from 'lucide-react';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { format } from 'date-fns';
import { useOrders } from '#/hook';

export const PaymentsManagement = () => {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Breadcrumbs */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-md w-32" />
          <div className="h-6 bg-gray-200 rounded-lg w-48" />
        </div>

        {/* Payment Overview Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="space-y-2 mb-8">
            <div className="h-5 bg-gray-250 rounded-md w-36" />
            <div className="h-3.5 bg-gray-150 rounded-md w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-3xl border border-slate-50 bg-white">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-2.5 bg-gray-250 rounded-md w-20" />
                  <div className="h-5 bg-gray-200 rounded-lg w-16" />
                  <div className="h-2.5 bg-gray-150 rounded-md w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid: Transactions & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Payment Transactions */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-250 rounded-md w-40" />
              <div className="h-3 bg-gray-200 rounded-md w-16" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-2.5 bg-gray-150 rounded-md w-24" />
                      <div className="h-4 bg-gray-200 rounded-lg w-36" />
                      <div className="h-2.5 bg-gray-100 rounded-md w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-4 bg-gray-200 rounded-md w-16" />
                    <div className="h-6 bg-gray-150 rounded-lg w-16" />
                    <div className="w-4 h-4 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Payment Method & Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="h-5 bg-gray-250 rounded-md w-32" />
              <div className="h-20 bg-gray-50 rounded-2xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="h-5 bg-gray-250 rounded-md w-32" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-150 rounded-md w-20" />
                    <div className="h-3 bg-gray-200 rounded-md w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalEarnings = orders
    ?.filter((o: any) => o.status === 'approved' || o.status === 'completed')
    ?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0;

  const pendingEarnings = orders
    ?.filter((o: any) => o.status === 'pending')
    ?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0;

  const pendingCount = orders?.filter((o: any) => o.status === 'pending')?.length || 0;
  const completedCount = orders?.filter((o: any) => o.status === 'approved' || o.status === 'completed')?.length || 0;

  const refundValue = orders
    ?.filter((o: any) => o.status === 'cancelled')
    ?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0;
  const refundCount = orders?.filter((o: any) => o.status === 'cancelled')?.length || 0;

  const stats = [
    { label: 'Total Earnings', value: `₹ ${totalEarnings.toLocaleString()}`, sub: `From ${completedCount} listings`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Payments', value: `₹ ${pendingEarnings.toLocaleString()}`, sub: `${pendingCount} pending orders`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Completed Payments', value: `₹ ${totalEarnings.toLocaleString()}`, sub: `${completedCount} payments`, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Refunds / Penalty', value: `₹ ${refundValue.toLocaleString()}`, sub: `${refundCount} cancelled`, icon: ArrowUpRight, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span>Payments</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">Payment Details</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Payment</h1>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 px-4 py-1.5 border-r border-slate-50">
               <Calendar size={14} className="text-dash-brand" />
               <span className="text-[11px] font-bold text-slate-600">May 12 - May 18, 2024</span>
               <ChevronRight size={12} className="rotate-90 text-slate-300" />
             </div>
             <div className="p-1.5 px-2">
                <div className="w-6 h-6 rounded-lg bg-dash-brand/5 flex items-center justify-center text-dash-brand">
                  <Zap size={14} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Payment Overview Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="mb-8">
           <h3 className="text-[15px] font-black text-[#1e293b]">Payment Overview</h3>
           <p className="text-[11px] font-bold text-slate-400 mt-0.5">Track and manage all your payments and transactions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-3xl border border-slate-50 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] transition-all hover:shadow-md cursor-default">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-black text-[#1e293b]">{stat.value}</p>
                <p className={`text-[9px] font-bold ${stat.color === 'text-emerald-600' ? 'text-emerald-500' : 'text-slate-400'}`}>{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Transactions & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payment Transactions */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-black text-[#1e293b]">Payment Transactions</h3>
            <button className="text-[11px] font-black text-emerald-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="h-40 flex items-center justify-center text-slate-400 font-bold text-sm">Loading transactions...</div>
            ) : orders?.slice(0, 5).map((order: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
                    <img src={order.product?.images?.[0]} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order #ORD-2024-{order.id.slice(-4).toUpperCase()}</p>
                    <p className="text-[13px] font-black text-[#1e293b]">{order.product?.title}</p>
                    <p className="text-[10px] font-bold text-slate-400">{format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[14px] font-black text-[#1e293b]">₹{order.totalPrice.toLocaleString()}</p>
                  </div>
                  <Badge className={`px-3 py-1 rounded-lg border-none font-black text-[9px] uppercase tracking-wider ${
                    order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                    order.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    {order.status || 'Pending'}
                  </Badge>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-dash-brand transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Payment Method & Summary */}
        <div className="space-y-6">
          {/* Payment Method Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-[15px] font-black text-[#1e293b] mb-6">Payment Method</h3>
             <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 relative group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-dash-brand/5 flex items-center justify-center text-dash-brand border border-dash-brand/10">
                      <Zap size={20} strokeWidth={2.5} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                         <span className="text-[12px] font-black text-[#1e293b]">Razorpay</span>
                         <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0 font-bold text-[8px] uppercase">Default</Badge>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 truncate">drashti.chabhadiya.hvg@gmail.com</p>
                      <p className="text-[10px] font-black text-slate-700 mt-1">•••• •••• •••• 4242</p>
                   </div>
                   <button className="text-[10px] font-black text-emerald-600 hover:underline">Edit</button>
                </div>
             </div>
             <Button variant="outline" className="w-full mt-4 h-12 rounded-xl border-dashed border-2 border-slate-200 text-slate-500 font-black text-[11px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <Plus size={16} /> Add New Payment Method
             </Button>
          </div>

          {/* Payment Summary Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="text-[15px] font-black text-[#1e293b] mb-6">Payment Summary</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                   <span>Total Earnings</span>
                   <span className="text-[#1e293b] font-black">₹1,25,000</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                   <span>Platform Fee</span>
                   <span className="text-red-500 font-black">- ₹12,500</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                   <span>Refunds</span>
                   <span className="text-red-500 font-black">- ₹2,500</span>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[13px] font-black text-[#1e293b]">Net Earnings</span>
                   <span className="text-base font-black text-emerald-600">₹1,10,000</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Security Footer Card */}
      <div className="bg-white p-6 px-10 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-8">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[13px] font-black text-[#1e293b]">Secure Payments</p>
               <p className="text-[10px] font-bold text-slate-400">Your payments are secure and encrypted with bank-level security.</p>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px]">
               <Lock size={14} className="text-emerald-500" /> SSL SECURED
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px]">
               <CheckCircle2 size={14} className="text-dash-brand" /> PCI DSS COMPLIANT
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px]">
               <Zap size={14} className="text-emerald-500" /> RAZORPAY TRUSTED
            </div>
         </div>
      </div>
    </div>
  );
};
