import { 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { useDisputes, useResolveDispute } from '#/hook';
import { useState } from 'react';
import { authClient } from '#/lib/auth/auth-client';

export const DisputesManagement = () => {
  const { data: disputes, isLoading } = useDisputes();
  const resolveMutation = useResolveDispute();
  const { data: session } = authClient.useSession();
  
  const user = session?.user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';

  const [activeDispute, setActiveDispute] = useState<any>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveType, setResolveType] = useState<'resolved' | 'dismissed'>('resolved');

  const selectedDispute = activeDispute || disputes?.[0];

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !resolutionText.trim()) return;

    resolveMutation.mutate({
      id: selectedDispute.id,
      status: resolveType,
      resolution: resolutionText
    }, {
      onSuccess: () => {
        setIsResolveModalOpen(false);
        setResolutionText('');
        setActiveDispute(null);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">Disputes</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#1e293b]">Disputes & Disputes Reports</h1>
        </div>
      </div>

      {/* Main Grid: Disputes List & Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: All Disputes Table */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-[15px] font-black text-[#1e293b]">Incoming Disputes</h3>
              <p className="text-[11px] font-bold text-slate-400">Review reported issues for orders and items.</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="text-left px-4 py-3">Dispute Detail</th>
                  <th className="text-left px-4 py-3">Rental ID</th>
                  <th className="text-left px-4 py-3">Reported By</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-xs text-slate-400">Loading disputes...</td>
                  </tr>
                ) : disputes?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-xs text-slate-400">No disputes reported.</td>
                  </tr>
                ) : (
                  disputes?.map((dispute) => (
                    <tr 
                      key={dispute.id} 
                      onClick={() => setActiveDispute(dispute)}
                      className={`group cursor-pointer hover:bg-slate-50/50 transition-all ${selectedDispute?.id === dispute.id ? 'bg-slate-50/80' : ''}`}
                    >
                      <td className="px-4 py-5">
                        <p className="text-[11px] font-black text-[#1e293b] leading-tight">{dispute.reason}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate max-w-[150px]">{dispute.description}</p>
                      </td>
                      <td className="px-4 py-5 font-mono text-[10px] text-[#1e293b]">{dispute.rentalId.substring(0, 10)}...</td>
                      <td className="px-4 py-5">
                         <p className="text-[10px] font-black text-[#1e293b]">{dispute.reportedBy?.name || 'Anonymous'}</p>
                         <p className="text-[8px] font-bold text-slate-400">{dispute.reportedBy?.email}</p>
                      </td>
                      <td className="px-4 py-5 text-[10px] font-bold text-slate-500">
                         {new Date(dispute.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-5">
                         <Badge className={`px-2.5 py-0.5 rounded-lg border-none text-[8px] font-black uppercase tracking-wider ${
                           dispute.status === 'open' ? 'bg-rose-50 text-rose-500' :
                           dispute.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                         }`}>
                           {dispute.status}
                         </Badge>
                      </td>
                      <td className="px-4 py-5 text-right">
                         <ChevronRight size={14} className="text-slate-300 group-hover:text-dash-brand transition-colors" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Dispute Details Sidebar */}
        <div className="space-y-6">
          {selectedDispute ? (
            <>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h3 className="text-[15px] font-black text-[#1e293b] mb-6 uppercase tracking-widest">Dispute Case</h3>
                 
                 <div className="space-y-4">
                    <div>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issue reason</span>
                       <p className="text-[12px] font-black text-[#1e293b]">{selectedDispute.reason}</p>
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Detailed Description</span>
                       <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{selectedDispute.description}</p>
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Product Details</span>
                       <p className="text-[11px] font-black text-slate-700">
                         {selectedDispute.rental?.product?.title || 'Unknown Item'} (₹{selectedDispute.rental?.product?.price}/day)
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reported By</span>
                          <p className="text-[10px] font-black text-[#1e293b]">{selectedDispute.reportedBy?.name || 'Anonymous'}</p>
                          <p className="text-[8px] font-bold text-slate-400">{selectedDispute.reportedBy?.email}</p>
                       </div>
                       <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                          <Badge className="bg-rose-50 text-rose-500 border-none px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider">{selectedDispute.status}</Badge>
                       </div>
                    </div>

                    {selectedDispute.resolution && (
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block mb-1">Official Resolution</span>
                        <p className="text-[11px] font-bold text-emerald-700">{selectedDispute.resolution}</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Buttons */}
              {isAdmin && selectedDispute.status === 'open' && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3">
                   <h3 className="text-[13px] font-black text-[#1e293b] mb-1 uppercase tracking-widest">Dispute Actions</h3>
                   <Button 
                     onClick={() => {
                       setResolveType('resolved');
                       setIsResolveModalOpen(true);
                     }}
                     className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[11px] flex items-center justify-center gap-2"
                   >
                      <CheckCircle2 size={16} /> Resolve Dispute Case
                   </Button>
                   <Button 
                     onClick={() => {
                       setResolveType('dismissed');
                       setIsResolveModalOpen(true);
                     }}
                     variant="ghost" 
                     className="w-full h-12 rounded-xl text-rose-500 hover:bg-rose-50 font-black text-[11px] flex items-center justify-center gap-2 border border-rose-100"
                   >
                      <XCircle size={16} /> Dismiss Dispute Case
                   </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center text-slate-400 py-12">
               Select a dispute from the list to display its metrics and action controls.
            </div>
          )}
        </div>
      </div>

      {/* Support Footer */}
      <div className="bg-emerald-50 p-8 px-12 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between group">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
               <ShieldCheck size={24} />
            </div>
            <div>
               <h4 className="text-[15px] font-black text-[#1e293b]">Dispute Management Center</h4>
               <p className="text-[11px] font-bold text-slate-500">Admins verify facts from both renters and owners to guarantee payouts and transaction safety.</p>
            </div>
         </div>
      </div>

      {/* Resolution Dialog Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl relative">
            <button 
              onClick={() => setIsResolveModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              {resolveType === 'resolved' ? 'Resolve Dispute' : 'Dismiss Dispute'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Write the official resolution verdict. Both renter and landlord will receive notifications.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Veritable Verdict Remarks</label>
                <textarea
                  required
                  placeholder="Provide detailed feedback on this resolution..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 h-28 focus:ring-1 focus:ring-dash-brand text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={resolveMutation.isPending}
                className={`w-full text-white rounded-xl h-12 font-bold mt-2 ${
                  resolveType === 'resolved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {resolveMutation.isPending ? 'Submitting resolution...' : 'Submit Verdict'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
