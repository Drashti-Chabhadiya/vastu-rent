import { StatCard } from './StatCard';
import { BookingsChart } from '../booking/BookingsChart';
import { CategoryDonut } from '../category/CategoryDonut';
import { RecentOrders } from '../order/RecentOrders';
import { UsersOverviewTable } from '../user/UsersOverviewTable';
import { RevenueChart } from './RevenueChart';
import { TopCities } from './TopCities';
import { RecentListingsTable } from '../listing/RecentListingsTable';
import { RecentReviews } from '../review/RecentReviews';
import { 
  Users, 
  Tag, 
  ShoppingBag, 
  IndianRupee,
  Building,
  Clock,
  Coins,
  Star,
  Heart,
  CalendarDays,
  Check,
  X,
  Compass,
  ArrowUpRight
} from 'lucide-react';

import { authClient } from '#/lib/auth/auth-client';
import { 
  useMyListings, 
  useOrders, 
  useUpdateRentalStatus,
  useMyRentals,
  useWishlistProducts
} from '#/hook';
import { Button } from '#/components/ui/button';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { cn } from '#/lib/utils';
import { DashboardOverviewSkeleton } from '#/components/skeletons';

interface DashboardOverviewProps {
  statsData: any;
  statsLoading: boolean;
  recentUsers: any[];
  usersLoading: boolean;
  recentProducts: any[];
  productsLoading: boolean;
}

export const DashboardOverview = ({
  statsData,
  statsLoading,
  recentUsers,
  usersLoading,
  recentProducts,
  productsLoading
}: DashboardOverviewProps) => {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const role = session?.user?.role;

  // Owner/Lister Hooks
  const { data: myListings, isLoading: listLoading } = useMyListings();
  const { data: listerOrders, isLoading: ordersLoading } = useOrders();
  const updateRentalStatus = useUpdateRentalStatus();

  // User/Renter Hooks
  const { data: myRentals, isLoading: rentalsLoading } = useMyRentals();
  const { data: likedProducts, isLoading: likedLoading } = useWishlistProducts();

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateRentalStatus.mutateAsync({ id, status });
      toast.success(`Booking request successfully ${status}!`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update booking status');
    }
  };

  // Render proper high-fidelity skeleton loaders while session or data is fetching
  if (isSessionLoading || !role) {
    return <DashboardOverviewSkeleton />;
  }

  if (role === 'owner' && (listLoading || ordersLoading)) {
    return <DashboardOverviewSkeleton />;
  }

  if ((role === 'admin' || role === 'superAdmin') && (statsLoading || usersLoading || productsLoading)) {
    return <DashboardOverviewSkeleton />;
  }

  // 1. OWNER / LISTER DASHBOARD OVERVIEW
  if (role === 'owner') {
    const totalEarnings = listerOrders
      ?.filter((o: any) => o.status === 'approved' || o.status === 'completed')
      ?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0;

    const pendingOrders = listerOrders?.filter((o: any) => o.status === 'pending') || [];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
              Lister Dashboard
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage your rental properties, accept booking requests, and track payouts.
            </p>
          </div>
          <Link to="/products">
            <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-12 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Building size={18} />
              Add New Listing
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard 
            title="My Published Properties"
            value={listLoading ? "..." : myListings?.length?.toString() || "0"}
            change={`${myListings?.length ? "Active" : "No active listings"}`}
            isPositive={true}
            icon={Building}
            iconBg="bg-green-50"
            iconColor="bg-primary-light"
            sparklineData={[10, 15, 12, 18, 20, 24, myListings?.length || 0]}
          />
          <StatCard 
            title="Total Generated Earnings"
            value={ordersLoading ? "..." : `₹ ${totalEarnings.toLocaleString()}`}
            change="Lister Balance"
            isPositive={true}
            icon={Coins}
            iconBg="bg-emerald-50"
            iconColor="bg-primary-light-alt"
            sparklineData={[2000, 5000, 4500, 8000, 7500, 9000, totalEarnings]}
          />
          <StatCard 
            title="Total Bookings Received"
            value={ordersLoading ? "..." : listerOrders?.length?.toString() || "0"}
            change={`${pendingOrders.length} Pending Approval`}
            isPositive={pendingOrders.length > 0}
            icon={ShoppingBag}
            iconBg="bg-green-50"
            iconColor="bg-primary-light"
            sparklineData={[5, 8, 7, 10, 9, 12, listerOrders?.length || 0]}
          />
          <StatCard 
            title="Customer Review Rating"
            value="4.9"
            change="Excellent Reputation"
            isPositive={true}
            icon={Star}
            iconBg="bg-emerald-50"
            iconColor="bg-primary-light-alt"
            sparklineData={[4.5, 4.6, 4.7, 4.8, 4.8, 4.9, 4.9]}
          />
        </div>

        {/* Dynamic Charts & Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Booking Requests */}
          <div className="xl:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Recent Booking Requests</h3>
                <p className="text-xs text-gray-500 font-medium">Review and process booking requests from tenants.</p>
              </div>
              {pendingOrders.length > 0 && (
                <span className="bg-red-50 text-red-600 px-3.5 py-1 rounded-xl text-xs font-black animate-pulse">
                  {pendingOrders.length} Pending Action
                </span>
              )}
            </div>

            {ordersLoading ? (
              <div className="space-y-4 py-8">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : listerOrders && listerOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Tenant</th>
                      <th className="pb-3 font-semibold">Property</th>
                      <th className="pb-3 font-semibold">Dates</th>
                      <th className="pb-3 font-semibold">Earnings</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                    {listerOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-bold text-xs uppercase">
                              {order.user?.name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{order.user?.name || 'Renter'}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{order.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-gray-900 truncate max-w-[150px]">
                          {order.product?.title || 'Property item'}
                        </td>
                        <td className="py-4 text-xs font-semibold text-gray-500">
                          {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 font-black text-gray-900">
                          ₹ {order.totalPrice?.toLocaleString()}
                        </td>
                        <td className="py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider",
                            order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                            order.status === 'approved' ? "bg-green-50 text-primary" :
                            order.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                            "bg-gray-100 text-gray-600"
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {order.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'approved')}
                                className="w-8 h-8 rounded-lg bg-green-50 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all"
                                title="Approve Booking"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                                title="Reject Booking"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-bold">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4 animate-bounce" />
                <h4 className="font-bold text-gray-900 mb-1">No bookings received yet</h4>
                <p className="text-xs text-gray-500 max-w-xs">Publish your properties in the marketplace to get booking requests!</p>
              </div>
            )}
          </div>

          {/* Quick List Overview */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">My Active Listings</h3>
              <p className="text-xs text-gray-500 font-medium mb-6">Overview of your published marketplace rentals.</p>

              {listLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : myListings && myListings.length > 0 ? (
                <div className="space-y-3.5">
                  {myListings.slice(0, 4).map((listing: any) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                          alt={listing.title} 
                          className="w-11 h-11 rounded-xl object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{listing.title}</p>
                          <p className="text-xs text-gray-400 font-bold">₹ {listing.price.toLocaleString()} / day</p>
                        </div>
                      </div>
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        listing.isAvailable ? "bg-green-500 shadow-sm shadow-green-500/20" : "bg-gray-300"
                      )} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building size={48} className="text-gray-300 mb-4" />
                  <h4 className="font-bold text-gray-900 mb-1">No listings found</h4>
                  <p className="text-xs text-gray-500">Add your first property now.</p>
                </div>
              )}
            </div>

            <Link to="/account/orders" className="mt-6">
              <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold h-11 rounded-xl border border-gray-100 transition-all flex items-center justify-center gap-1">
                View All Orders
                <ArrowUpRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. NORMAL USER / TENANT DASHBOARD OVERVIEW
  if (role === 'user') {
    const totalSpent = myRentals
      ?.filter((r: any) => r.status === 'approved' || r.status === 'completed')
      ?.reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0) || 0;

    const activeRentals = myRentals?.filter((r: any) => r.status === 'approved') || [];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
              Renter Portal
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Track your active rentals, saved properties, and booking schedules.
            </p>
          </div>
          <Link to="/products">
            <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-12 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Compass size={18} />
              Browse Properties
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard 
            title="Active Rental Properties"
            value={rentalsLoading ? "..." : activeRentals.length.toString()}
            change={`${myRentals?.length || 0} Total Orders`}
            isPositive={activeRentals.length > 0}
            icon={CalendarDays}
            iconBg="bg-green-50"
            iconColor="bg-primary-light"
            sparklineData={[1, 0, 2, 1, 3, 2, activeRentals.length]}
          />
          <StatCard 
            title="Total Renter Expenditure"
            value={rentalsLoading ? "..." : `₹ ${totalSpent.toLocaleString()}`}
            change="Processed Payments"
            isPositive={true}
            icon={IndianRupee}
            iconBg="bg-emerald-50"
            iconColor="bg-primary-light-alt"
            sparklineData={[1000, 3000, 2500, 5000, 4000, 6000, totalSpent]}
          />
          <StatCard 
            title="Saved Wishlist Listings"
            value={likedLoading ? "..." : likedProducts?.length?.toString() || "0"}
            change="Favorites Bookmarked"
            isPositive={true}
            icon={Heart}
            iconBg="bg-green-50"
            iconColor="bg-primary-light"
            sparklineData={[2, 4, 3, 5, 4, 6, likedProducts?.length || 0]}
          />
          <StatCard 
            title="Account Notifications"
            value="3"
            change="Unread Alerts"
            isPositive={true}
            icon={Clock}
            iconBg="bg-emerald-50"
            iconColor="bg-primary-light-alt"
            sparklineData={[1, 2, 0, 3, 2, 4, 3]}
          />
        </div>

        {/* Dynamic Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Active Rentals Table */}
          <div className="xl:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900">Active Rented Properties</h3>
              <p className="text-xs text-gray-500 font-medium">Timeline of your approved rentals currently active or upcoming.</p>
            </div>

            {rentalsLoading ? (
              <div className="space-y-4 py-8">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : myRentals && myRentals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Listing</th>
                      <th className="pb-3 font-semibold">Landlord</th>
                      <th className="pb-3 font-semibold">Rental Dates</th>
                      <th className="pb-3 font-semibold">Rental Cost</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                    {myRentals.map((rental: any) => (
                      <tr key={rental.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={rental.product?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                              alt={rental.product?.title} 
                              className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{rental.product?.title}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{rental.product?.city || 'India'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-gray-900">
                          {rental.product?.owner?.name || 'Owner lister'}
                        </td>
                        <td className="py-4 text-xs font-semibold text-gray-500">
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 font-black text-gray-900">
                          ₹ {rental.totalPrice?.toLocaleString()}
                        </td>
                        <td className="py-4 text-right">
                          <span className={cn(
                            "px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider",
                            rental.status === 'pending' ? "bg-amber-50 text-amber-600" :
                            rental.status === 'approved' ? "bg-green-50 text-primary" :
                            rental.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                            "bg-gray-100 text-gray-600"
                          )}>
                            {rental.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-100 rounded-3xl">
                <CalendarDays size={48} className="text-gray-300 mb-4 animate-pulse" />
                <h4 className="font-bold text-gray-900 mb-1">No active rentals yet</h4>
                <p className="text-xs text-gray-500 max-w-xs mb-4">You haven't rented any property yet. Browse our listings to get started!</p>
                <Link to="/products">
                  <Button className="bg-primary hover:bg-primary/95 text-white font-bold h-10 px-4 rounded-xl text-xs flex items-center gap-1">
                    Explore Properties
                    <ArrowUpRight size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Liked Wishlist quick items */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">Saved Favorites</h3>
              <p className="text-xs text-gray-500 font-medium mb-6">List of properties bookmarked for later consideration.</p>

              {likedLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : likedProducts && likedProducts.length > 0 ? (
                <div className="space-y-3.5">
                  {likedProducts.slice(0, 3).map((listing: any) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                          alt={listing.title} 
                          className="w-11 h-11 rounded-xl object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{listing.title}</p>
                          <p className="text-xs text-gray-400 font-bold">₹ {listing.price.toLocaleString()} / day</p>
                        </div>
                      </div>
                      <Link to={`/products/${listing.id}` as any}>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/5 text-primary hover:text-primary">
                          <ArrowUpRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart size={48} className="text-gray-300 mb-4" />
                  <h4 className="font-bold text-gray-900 mb-1">Wishlist is empty</h4>
                  <p className="text-xs text-gray-500">Your liked listings will show up here.</p>
                </div>
              )}
            </div>

            <Link to="/account/wishlist" className="mt-6">
              <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold h-11 rounded-xl border border-gray-100 transition-all flex items-center justify-center gap-1">
                Manage Wishlist
                <Heart size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. ADMIN / SUPER ADMIN DASHBOARD OVERVIEW
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Users"
          value={statsLoading ? "..." : statsData?.totalUsers?.toLocaleString() || "0"}
          change="16.5%"
          isPositive={true}
          icon={Users}
          iconBg="bg-green-50"
          iconColor="bg-primary-light"
          sparklineData={[30, 40, 35, 50, 45, 60, 55]}
        />
        <StatCard 
          title="Total Listings"
          value={statsLoading ? "..." : statsData?.totalListings?.toLocaleString() || "0"}
          change="12.3%"
          isPositive={true}
          icon={Tag}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[40, 30, 45, 35, 55, 40, 50]}
        />
        <StatCard 
          title="Total Bookings"
          value={statsLoading ? "..." : statsData?.totalBookings?.toLocaleString() || "0"}
          change="18.7%"
          isPositive={true}
          icon={ShoppingBag}
          iconBg="bg-green-50"
          iconColor="bg-primary-light"
          sparklineData={[20, 35, 30, 45, 40, 50, 45]}
        />
        <StatCard 
          title="Total Revenue"
          value={statsLoading ? "..." : `₹ ${statsData?.totalRevenue?.toLocaleString() || "0"}`}
          change="20.4%"
          isPositive={true}
          icon={IndianRupee}
          iconBg="bg-emerald-50"
          iconColor="bg-primary-light-alt"
          sparklineData={[50, 60, 55, 70, 65, 80, 75]}
        />
      </div>

      {/* Second Row: Bookings, Categories, Recent Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="md:col-span-1 xl:col-span-1">
          <BookingsChart />
        </div>
        <div className="md:col-span-1 xl:col-span-1">
          <CategoryDonut />
        </div>
        <div className="md:col-span-full xl:col-span-1">
          <RecentOrders />
        </div>
      </div>

      {/* Third Row: Users Overview, Revenue Overview, Top Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="md:col-span-full xl:col-span-1">
          <UsersOverviewTable users={recentUsers} isLoading={usersLoading} />
        </div>
        <div className="md:col-span-1 xl:col-span-1">
          <RevenueChart />
        </div>
        <div className="md:col-span-1 xl:col-span-1">
          <TopCities />
        </div>
      </div>

      {/* Fourth Row: Recent Listings, Recent Reviews */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentListingsTable products={recentProducts} isLoading={productsLoading} />
        <RecentReviews />
      </div>
    </div>
  );
};
