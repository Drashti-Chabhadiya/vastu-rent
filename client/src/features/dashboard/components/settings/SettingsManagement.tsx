import { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Calendar, 
  User, 
  Bell, 
  CreditCard, 
  ShieldCheck,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Switch } from '#/components/ui/switch';
import { authClient } from '#/lib/auth/auth-client';
import { useUploadProfileImage, useUpdateUserSettings } from '#/hook';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const SettingsManagement = () => {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const activeUser = session?.user;

  // Active Tab State
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Profile Edit States
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Payout/Bank Settings States
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Notification Preferences States
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [settlementAlerts, setSettlementAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);

  // Profile Image Upload Hook & Settings Update Hook
  const uploadProfileImg = useUploadProfileImage();
  const updateSettings = useUpdateUserSettings();

  // Load user session details dynamically
  useEffect(() => {
    if (activeUser) {
      setProfileName(activeUser.name || '');
      setProfileImage(activeUser.image || '');
      setBankName((activeUser as any).bankName || '');
      setAccountNumber((activeUser as any).accountNumber || '');
      setIfscCode((activeUser as any).ifscCode || '');
      setUpiId((activeUser as any).upiId || '');
      setAccountHolder((activeUser as any).accountHolder || activeUser.name || '');
      setBookingAlerts((activeUser as any).bookingAlerts !== false);
      setSettlementAlerts((activeUser as any).settlementAlerts !== false);
      setMarketingAlerts((activeUser as any).marketingAlerts === true);
    }
  }, [activeUser]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSavingProfile(true);
    try {
      await authClient.updateUser({
        name: profileName,
        image: profileImage,
      });
      toast.success("Profile successfully updated in database! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile info");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Profile Picture Picker Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const promise = uploadProfileImg.mutateAsync(file);
    toast.promise(promise, {
      loading: 'Uploading new profile photo to Cloudinary...',
      success: (data) => {
        // Direct response returns user image
        const imgUrl = data.user?.image || profileImage;
        setProfileImage(imgUrl);
        return 'Profile picture successfully uploaded!';
      },
      error: 'Failed to upload photo.'
    });
  };

  // Handle Bank Account Save via API Mutation
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      accountHolder
    }, {
      onSuccess: () => {
        toast.success("Payout Bank details successfully saved in Database! 🏦");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || err.message || "Failed to save bank details");
      }
    });
  };

  // Handle Notifications Switch Changes via API Mutation
  const handleNotificationToggle = (key: string, val: boolean) => {
    const payload: any = {};
    if (key === 'bookingAlerts') {
      setBookingAlerts(val);
      payload.bookingAlerts = val;
    }
    if (key === 'settlementAlerts') {
      setSettlementAlerts(val);
      payload.settlementAlerts = val;
    }
    if (key === 'marketingAlerts') {
      setMarketingAlerts(val);
      payload.marketingAlerts = val;
    }

    updateSettings.mutate(payload, {
      onSuccess: () => {
        toast.success("Notification preferences updated in database!");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || err.message || "Failed to update notification settings");
      }
    });
  };

  if (isSessionLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 bg-gray-150 rounded-md w-32" />
          <div className="h-6 bg-gray-250 rounded-lg w-48" />
        </div>
        <div className="h-[400px] bg-white border border-slate-100 rounded-[2rem] shadow-sm" />
      </div>
    );
  }

  const sidebarItems = [
    { id: 'profile', label: 'Profile Settings', desc: 'Update your profile information', icon: User },
    { id: 'payment', label: 'Payout Settings', desc: 'Configure bank and settlement methods', icon: CreditCard },
    { id: 'notifications', label: 'Notification Preferences', desc: 'Control your alert preferences', icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-[#059669] font-extrabold">Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800">Settings</h1>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <Calendar size={14} className="text-[#059669]" />
            <span className="text-xs font-black text-slate-600 tracking-wider">
              {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar: Settings Navigation */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit space-y-1">
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

        {/* Middle Column: Dynamic Forms */}
        <div className="xl:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          
          {/* TAB 1: PROFILE SETTINGS */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-black text-slate-800">Profile Settings</h3>
                  <p className="text-[11px] font-bold text-slate-400">Update your public profile and avatar.</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[11px] px-6 h-11 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              {/* Avatar Uploader Section */}
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden shadow-md bg-slate-200 shrink-0 relative group">
                  {profileImage ? (
                    <img src={profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-extrabold text-slate-500 uppercase text-lg">
                      {profileName.slice(0, 2) || 'US'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800">Profile Photo</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Upload high-res JPG, PNG (Max 5MB)</p>
                  
                  <div className="flex gap-2">
                    <label className="h-9 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                      <Upload size={12} /> Upload Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>
                    {profileImage && (
                      <Button 
                        type="button" 
                        onClick={() => setProfileImage('')}
                        variant="ghost" 
                        className="h-9 px-3 rounded-xl text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-wider"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Full Name</label>
                  <Input 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name" 
                    className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email Address</label>
                  <Input 
                    value={activeUser?.email || ''} 
                    disabled
                    className="h-12 bg-slate-100 border-none rounded-2xl text-[12px] font-black text-slate-400 px-5 cursor-not-allowed" 
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: PAYOUT SETTINGS */}
          {activeSubTab === 'payment' && (
            <form onSubmit={handleSaveBankDetails} className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-black text-slate-800">Payout Settlements</h3>
                  <p className="text-[11px] font-bold text-slate-400">Configure bank accounts or UPI IDs to receive earnings settlements.</p>
                </div>
                <Button 
                  type="submit"
                  className="bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[11px] px-6 h-11 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Save Payout Details
                </Button>
              </div>

              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">
                  Settlements are processed via bank accounts or UPI within 24-48 hours of approved payout withdrawal requests. Ensure details are fully accurate.
                </p>
              </div>

              {/* UPI Option */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">UPI ID / Address (Recommended)</label>
                  <Input 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@upi" 
                    className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                  />
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider">Or Bank Account Transfer</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Holder Name</label>
                      <Input 
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Enter bank account name" 
                        className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Bank Name</label>
                      <Input 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank" 
                        className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Number</label>
                      <Input 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter Account Number" 
                        className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">IFSC Code</label>
                      <Input 
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        placeholder="e.g. HDFC0000123" 
                        className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: NOTIFICATION SETTINGS */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-[16px] font-black text-slate-800">Notification Preferences</h3>
                <p className="text-[11px] font-bold text-slate-400">Control when and how you receive alerts.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/20">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-800">New Booking Alerts</h4>
                    <p className="text-[10px] font-semibold text-slate-400">Receive alert when renter requests a product booking.</p>
                  </div>
                  <Switch 
                    checked={bookingAlerts}
                    onCheckedChange={(val) => handleNotificationToggle('bookingAlerts', val)}
                    className="data-[state=checked]:bg-emerald-600" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/20">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-800">Payout Settlements</h4>
                    <p className="text-[10px] font-semibold text-slate-400">Get notified when money settles to your bank.</p>
                  </div>
                  <Switch 
                    checked={settlementAlerts}
                    onCheckedChange={(val) => handleNotificationToggle('settlementAlerts', val)}
                    className="data-[state=checked]:bg-emerald-600" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/20">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-800">Marketing Updates</h4>
                    <p className="text-[10px] font-semibold text-slate-400">Receive monthly platform optimization guides.</p>
                  </div>
                  <Switch 
                    checked={marketingAlerts}
                    onCheckedChange={(val) => handleNotificationToggle('marketingAlerts', val)}
                    className="data-[state=checked]:bg-emerald-600" 
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Account Summary Info */}
        <div className="space-y-6">
          {/* Account Details summary */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[13px] font-black text-slate-800 mb-6 uppercase tracking-widest">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Account Type</span>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2.5 capitalize">{activeUser?.role || 'Lister'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Member Since</span>
                <span className="text-[11px] font-black text-slate-700">
                  {activeUser?.createdAt ? format(new Date(activeUser.createdAt), 'dd MMM yyyy') : '01 Jan 2026'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Database ID</span>
                <span className="text-[10px] font-black text-slate-700 max-w-[120px] truncate" title={activeUser?.id}>{activeUser?.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Email Status</span>
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                  {activeUser?.emailVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Secure Details Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Safety Guarantee
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              Your details are protected using industry-grade SSL encryption and are kept confidential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
