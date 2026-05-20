import { useState, useEffect, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
} from '#/components/ui/dialog';
import { authClient } from '#/lib/auth/auth-client';
import { useUploadProfileImage, useUpdateUserSettings, useCloudinaryUsage } from '#/hook';
import { apiClient } from '#/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Pure helper — lives outside the component so it never changes reference.
const formatBytes = (bytes: number, decimals: number = 1): { value: string; unit: string } => {
  if (bytes === 0) return { value: '0', unit: 'GB' };
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return {
    value: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toString(),
    unit: sizes[i],
  };
};

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

  // Cloudinary Integration States
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');
  const [cloudinaryHasSecret, setCloudinaryHasSecret] = useState(false);
  const [isTestingCloudinary, setIsTestingCloudinary] = useState(false);
  const [isSavingCloudinary, setIsSavingCloudinary] = useState(false);
  const [isLoadingCloudinary, setIsLoadingCloudinary] = useState(false);

  // Profile Image Upload Hook & Settings Update Hook
  const uploadProfileImg = useUploadProfileImage();
  const updateSettings = useUpdateUserSettings();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch real-time Cloudinary usage metrics — staleTime prevents
  // session re-polls from causing the storage value to flicker.
  const isCloudinaryTabActive = activeSubTab === 'cloudinary' && activeUser !== undefined;
  const { data: usageData, refetch: refetchUsage } = useCloudinaryUsage({
    enabled: isCloudinaryTabActive,
    staleTime: 60_000,          // treat data as fresh for 60 s
    refetchOnWindowFocus: false, // avoid refetch noise on focus
  });

  // Memoize derived storage stats so they only recompute when usageData changes,
  // not on every parent render (which was causing the blink).
  const { storageStats, formattedUsed, formattedLimit, usedPercent } = useMemo(() => {
    const stats = usageData?.storage || { usage: 0, limit: 10485760000, used_percent: 0 };
    return {
      storageStats: stats,
      formattedUsed: formatBytes(stats.usage),
      formattedLimit: formatBytes(stats.limit),
      usedPercent: Math.min(100, Math.max(0, stats.used_percent)),
    };
  }, [usageData]);

  // Load Cloudinary config when active tab is selected
  useEffect(() => {
    if (activeSubTab === 'cloudinary' && activeUser) {
      setIsLoadingCloudinary(true);
      apiClient.get('/users/settings/cloudinary')
        .then((res) => {
          const config = res.data.config;
          if (config) {
            setCloudinaryCloudName(config.cloudName || '');
            setCloudinaryApiKey(config.apiKey || '');
            setCloudinaryUploadPreset(config.uploadPreset || '');
            setCloudinaryHasSecret(config.hasSecret || false);
          } else {
            setCloudinaryCloudName('');
            setCloudinaryApiKey('');
            setCloudinaryUploadPreset('');
            setCloudinaryHasSecret(false);
          }
        })
        .catch(() => {
          toast.error("Failed to load Cloudinary settings");
        })
        .finally(() => {
          setIsLoadingCloudinary(false);
        });
    }
  }, [activeSubTab, activeUser]);

  // Handle Save Cloudinary Config
  const handleSaveCloudinary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudinaryCloudName.trim() || !cloudinaryApiKey.trim()) {
      toast.error("Cloud Name and API Key are required");
      return;
    }
    if (!cloudinaryHasSecret && !cloudinaryApiSecret.trim()) {
      toast.error("API Secret is required for new configurations");
      return;
    }

    setIsSavingCloudinary(true);
    try {
      const payload: any = {
        cloudName: cloudinaryCloudName.trim(),
        apiKey: cloudinaryApiKey.trim(),
        uploadPreset: cloudinaryUploadPreset.trim() || undefined,
      };
      if (cloudinaryApiSecret.trim()) {
        payload.apiSecret = cloudinaryApiSecret.trim();
      }

      await apiClient.post('/users/settings/cloudinary', payload);
      toast.success("Cloudinary credentials successfully saved and secured! ☁️");
      setCloudinaryHasSecret(true);
      setCloudinaryApiSecret('');
      refetchUsage();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save Cloudinary settings");
    } finally {
      setIsSavingCloudinary(false);
    }
  };

  // Handle Test Cloudinary Connection
  const handleTestCloudinary = async () => {
    if (!cloudinaryCloudName.trim() || !cloudinaryApiKey.trim()) {
      toast.error("Cloud Name and API Key are required to test");
      return;
    }
    if (!cloudinaryHasSecret && !cloudinaryApiSecret.trim()) {
      toast.error("API Secret is required to test");
      return;
    }

    setIsTestingCloudinary(true);
    const promise = apiClient.post('/users/settings/cloudinary/test', {
      cloudName: cloudinaryCloudName.trim(),
      apiKey: cloudinaryApiKey.trim(),
      apiSecret: cloudinaryApiSecret.trim() || undefined,
    });

    toast.promise(promise, {
      loading: 'Testing Cloudinary connection...',
      success: () => {
        setIsTestingCloudinary(false);
        refetchUsage();
        return 'Successfully connected to Cloudinary! ☁️🎉';
      },
      error: (err) => {
        setIsTestingCloudinary(false);
        return err.response?.data?.message || err.message || 'Failed to connect. Please verify keys.';
      }
    });
  };

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

  const isDashboardRole = activeUser?.role === 'owner' || activeUser?.role === 'admin' || activeUser?.role === 'superAdmin';

  const sidebarItems = [
    { id: 'profile', label: 'Profile Settings', desc: 'Update your profile information', icon: User },
    { id: 'payment', label: 'Payout Settings', desc: 'Configure bank and settlement methods', icon: CreditCard },
    { id: 'notifications', label: 'Notification Preferences', desc: 'Control your alert preferences', icon: Bell },
    ...(isDashboardRole ? [{ id: 'cloudinary', label: 'Cloudinary Storage', desc: 'Manage your custom storage keys', icon: Upload }] : []),
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

          {/* TAB 4: CLOUDINARY SETTINGS */}
          {activeSubTab === 'cloudinary' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[16px] font-black text-slate-800">Cloudinary Storage</h3>
                    <p className="text-[11px] font-bold text-slate-400">Connect your personal Cloudinary account. Images you upload will be stored here.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleTestCloudinary}
                      disabled={isTestingCloudinary || isLoadingCloudinary}
                      variant="outline"
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-wider px-4 h-11 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      {isTestingCloudinary ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleSaveCloudinary}
                      disabled={isSavingCloudinary || isLoadingCloudinary}
                      className="bg-[#059669] hover:bg-[#059669]/90 text-white font-black text-[10px] uppercase tracking-wider px-5 h-11 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                    >
                      {isSavingCloudinary ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </div>

                {isLoadingCloudinary ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-10 bg-slate-100 rounded-xl w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-16" />
                        <div className="h-12 bg-slate-50 rounded-2xl w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-16" />
                        <div className="h-12 bg-slate-50 rounded-2xl w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-16" />
                        <div className="h-12 bg-slate-50 rounded-2xl w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-16" />
                        <div className="h-12 bg-slate-50 rounded-2xl w-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form config */}
                    <div className="lg:col-span-2 space-y-6">
                      <form onSubmit={handleSaveCloudinary} className="space-y-6">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-2xl border flex items-start gap-2.5 ${
                          cloudinaryHasSecret 
                            ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-800' 
                            : 'bg-amber-50/50 border-amber-100/50 text-amber-800'
                        }`}>
                          <AlertCircle size={16} className={`${cloudinaryHasSecret ? 'text-emerald-600' : 'text-amber-600'} shrink-0 mt-0.5`} />
                          <div className="text-[10px] font-semibold leading-relaxed">
                            {cloudinaryHasSecret ? (
                              <p>
                                <strong>Connected!</strong> Your custom Cloudinary storage is active. Images for your products, categories, and profile will be uploaded securely using your credentials.
                              </p>
                            ) : (
                              <p>
                                <strong>Not Configured:</strong> You haven't connected your custom Cloudinary credentials yet. You must set them up before you can upload any product, category, or profile images.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Cloud Name */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cloud Name</label>
                            <Input 
                              value={cloudinaryCloudName}
                              onChange={(e) => setCloudinaryCloudName(e.target.value)}
                              placeholder="e.g. dxyz12345" 
                              className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                            />
                          </div>

                          {/* API Key */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">API Key</label>
                            <Input 
                              value={cloudinaryApiKey}
                              onChange={(e) => setCloudinaryApiKey(e.target.value)}
                              placeholder="e.g. 123456789012345" 
                              className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                            />
                          </div>

                          {/* API Secret */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                              API Secret {cloudinaryHasSecret && <span className="text-[9px] text-[#059669] font-black lowercase tracking-normal">(Saved)</span>}
                            </label>
                            <Input 
                              type="password"
                              value={cloudinaryApiSecret}
                              onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                              placeholder={cloudinaryHasSecret ? "••••••••••••••••••••••••••••" : "Enter Cloudinary API Secret"} 
                              className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                            />
                          </div>

                          {/* Upload Preset */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upload Preset (Optional)</label>
                            <Input 
                              value={cloudinaryUploadPreset}
                              onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                              placeholder="e.g. ml_default" 
                              className="h-12 bg-slate-50 border-none rounded-2xl text-[12px] font-black text-[#1e293b] px-5 focus:ring-2 focus:ring-emerald-500/20" 
                            />
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Right Column: Storage Usage Card */}
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[190px]">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">Storage Usage</h4>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                              Real-time
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                              <span>
                                <strong className="text-slate-800 font-black">{formattedUsed.value} {formattedUsed.unit}</strong> / {formattedLimit.value} {formattedLimit.unit} Used
                              </span>
                              <span className="font-extrabold text-slate-800">
                                {usedPercent.toFixed(0)}%
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-650 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                style={{ width: `${usedPercent}%`, backgroundColor: '#059669' }}
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsDetailsModalOpen(true)}
                          className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-[#059669] hover:text-[#059669]/80 transition-all uppercase tracking-wider group w-full text-left"
                        >
                          <span>View Storage Details</span>
                          <ChevronRight size={14} className="text-[#059669] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STORAGE DETAILS DIALOG MODAL */}
                <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                  <DialogContent className="max-w-md p-8 border-none bg-white rounded-[2.5rem] shadow-2xl font-sans animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded">
                          Storage Audit
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-800">Cloudinary Resource Metrics</h3>
                        <p className="text-[11px] font-bold text-slate-400">
                          Real-time resource and bandwidth allocations from your connected Cloudinary bucket.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Cloud name & plan */}
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Storage Bucket</span>
                            <p className="text-xs font-black text-slate-800">{usageData?.cloudName || cloudinaryCloudName || 'Global Fallback'}</p>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase">
                            Connected
                          </Badge>
                        </div>

                        {/* Storage Details */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Byte Storage Allocated</span>
                            <span className="text-slate-800">{usedPercent.toFixed(1)}% Used</span>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-slate-800">{formattedUsed.value} {formattedUsed.unit}</span>
                              <span className="text-[10px] text-slate-400 font-bold">of {formattedLimit.value} {formattedLimit.unit} limit</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400">Total size of active image resources, folders, and assets.</p>
                          </div>
                        </div>

                        {/* Billing Universal Credits */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Universal Billing Credits</span>
                            <span className="text-slate-800">{(usageData?.credits?.used_percent || 0).toFixed(1)}% Used</span>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-slate-800">{usageData?.credits?.usage || 0}</span>
                              <span className="text-[10px] text-slate-400 font-bold">of {usageData?.credits?.limit || 25} Credits limit</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400">Cloudinary's universal usage metrics (Transformations, Bandwidth & Storage combined).</p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex">
                        <Button 
                          type="button"
                          onClick={() => setIsDetailsModalOpen(false)}
                          className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center animate-all"
                        >
                          Close Metrics
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
