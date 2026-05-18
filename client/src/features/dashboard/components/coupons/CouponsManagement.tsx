import { useState } from 'react';
import { 
  Ticket, 
  ChevronRight, 
  Search, 
  Plus, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Zap,
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { useCoupons, useCreateCoupon, useDeleteCoupon } from '#/hook';
import { authClient } from '#/lib/auth/auth-client';

export const CouponsManagement = () => {
  const { data: coupons, isLoading } = useCoupons();
  const createMutation = useCreateCoupon();
  const deleteMutation = useDeleteCoupon();
  
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Coupon Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minBooking, setMinBooking] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discount || !endDate) return;

    createMutation.mutate({
      code,
      discount: parseFloat(discount),
      type,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      minBooking: minBooking ? parseFloat(minBooking) : undefined,
      startDate: new Date().toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined
    }, {
      onSuccess: () => {
        setIsFormOpen(false);
        setCode('');
        setDiscount('');
        setMaxDiscount('');
        setMinBooking('');
        setEndDate('');
        setUsageLimit('');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCoupons = coupons?.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">Coupons</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Coupons</h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column: All Coupons */}
         <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
               <div>
                  <h3 className="text-[15px] font-black text-[#1e293b]">All Active & Inactive Coupons</h3>
                  <p className="text-[11px] font-bold text-slate-400">View and manage all coupons and discount offers.</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="relative">
                     <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                     <Input 
                        placeholder="Search coupons..." 
                        className="h-10 pl-9 pr-4 w-48 bg-slate-50 border-none rounded-xl text-[11px] font-bold focus:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  {isAdmin && (
                    <Button 
                      onClick={() => setIsFormOpen(true)}
                      className="h-10 px-4 rounded-xl bg-dash-brand hover:bg-dash-brand/90 text-white font-black text-[11px] flex items-center gap-2"
                    >
                       <Plus size={14} /> Create Coupon
                    </Button>
                  )}
               </div>
            </div>

            <div className="overflow-x-auto -mx-2">
               <table className="w-full">
                  <thead>
                     <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="text-left px-4 py-3">Coupon Code</th>
                        <th className="text-left px-4 py-3">Discount</th>
                        <th className="text-left px-4 py-3">Min. Booking</th>
                        <th className="text-left px-4 py-3">Expiry Date</th>
                        <th className="text-left px-4 py-3">Used Status</th>
                        {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {isLoading ? (
                       <tr>
                         <td colSpan={6} className="text-center py-10 text-xs text-slate-400">Loading coupons...</td>
                       </tr>
                     ) : filteredCoupons?.length === 0 ? (
                       <tr>
                         <td colSpan={6} className="text-center py-10 text-xs text-slate-400">No coupons available.</td>
                       </tr>
                     ) : (
                       filteredCoupons?.map((coupon) => (
                          <tr key={coupon.id} className="group hover:bg-slate-50/50 transition-all">
                             <td className="px-4 py-5">
                                <div className="inline-flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed bg-emerald-50 text-emerald-600 border-emerald-100">
                                   <span className="text-[11px] font-black tracking-widest uppercase">{coupon.code}</span>
                                   <button 
                                     onClick={() => handleCopy(coupon.code)}
                                     className="flex items-center gap-1 text-[8px] font-bold mt-1 opacity-70 hover:opacity-100"
                                   >
                                      {copiedCode === coupon.code ? 'Copied!' : 'Copy'} <Copy size={8} />
                                   </button>
                                </div>
                             </td>
                             <td className="px-4 py-5">
                                <p className="text-[12px] font-black text-[#1e293b]">
                                  {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                                </p>
                                {coupon.maxDiscount && <p className="text-[9px] font-bold text-slate-400">Upto ₹{coupon.maxDiscount}</p>}
                             </td>
                             <td className="px-4 py-5 font-black text-[#1e293b] text-[11px]">
                               ₹{coupon.minBooking || '0'}
                             </td>
                             <td className="px-4 py-5">
                                <p className="text-[10px] font-black text-[#1e293b] leading-tight">
                                  {new Date(coupon.endDate).toLocaleDateString()}
                                </p>
                             </td>
                             <td className="px-4 py-5">
                                <p className="text-[10px] font-black text-[#1e293b] mb-1">
                                  {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'times'}
                                </p>
                                <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-emerald-500 rounded-full" 
                                     style={{ 
                                       width: coupon.usageLimit 
                                         ? `${(coupon.usedCount / coupon.usageLimit) * 100}%` 
                                         : '10%' 
                                     }}
                                   />
                                </div>
                             </td>
                             {isAdmin && (
                               <td className="px-4 py-5 text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(coupon.id)}
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                  >
                                     <Trash2 size={16} />
                                  </Button>
                               </td>
                             )}
                          </tr>
                       ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Right Column: Dynamic Promo Block */}
         <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 bg-dash-brand/5 transition-transform group-hover:scale-150" />
               <Zap className="text-dash-brand mb-4" size={32} />
               <h3 className="text-[15px] font-black text-[#1e293b] mb-2 uppercase tracking-widest">Promotion Booster</h3>
               <p className="text-[11px] font-bold text-slate-400 mb-6 leading-relaxed">
                 Apply a coupon code at checkout to reduce rental fee. Code must match specific conditions.
               </p>
               {isAdmin && (
                 <Button 
                   onClick={() => setIsFormOpen(true)}
                   className="w-full h-12 rounded-xl bg-dash-brand hover:bg-dash-brand/90 text-white font-black text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-50"
                 >
                    <Ticket size={16} className="rotate-[-10deg]" /> Add New Coupon Code
                 </Button>
               )}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-[15px] font-black text-[#1e293b] mb-6 uppercase tracking-widest">Helpful Tips</h3>
               <div className="space-y-4">
                 <div className="flex gap-3">
                   <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                     <CheckCircle2 size={12} />
                   </div>
                   <p className="text-[11px] font-bold text-slate-500">Percentage type reduces rent by a relative amount.</p>
                 </div>
                 <div className="flex gap-3">
                   <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                     <CheckCircle2 size={12} />
                   </div>
                   <p className="text-[11px] font-bold text-slate-500">Usage Limit bounds how many times customers can apply the code.</p>
                 </div>
               </div>
            </div>
         </div>
      </div>

      {/* Help Footer */}
      <div className="bg-white p-6 px-10 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[13px] font-black text-[#1e293b]">Platform Guarantee & Integrity</p>
               <p className="text-[10px] font-bold text-slate-400">Coupon deductions are automatically adjusted in final landlord payout invoices.</p>
            </div>
         </div>
      </div>

      {/* Create Coupon Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl relative">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Create Coupon Code</h3>
            <p className="text-sm text-gray-500 mb-6">Create a voucher code to offer rental discounts on the marketplace.</p>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Coupon Code</label>
                <Input
                  required
                  placeholder="e.g. WELCOME20, SUMMER50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 rounded-xl uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-11 border border-gray-200 rounded-xl px-3 bg-white text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Discount Value</label>
                  <Input
                    required
                    type="number"
                    placeholder="e.g. 10 or 150"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Max Discount (₹)</label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Min Booking (₹)</label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={minBooking}
                    onChange={(e) => setMinBooking(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Expiry Date</label>
                  <Input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Usage Limit</label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-dash-brand hover:bg-dash-brand/90 text-white rounded-xl h-12 font-bold mt-2"
              >
                {createMutation.isPending ? 'Generating Coupon...' : 'Create Coupon'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
