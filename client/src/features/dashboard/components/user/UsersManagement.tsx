import { useState } from 'react'
import { Search, UserX, UserCheck, Trash2, AlertCircle } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  useAdminUsers,
  useBanUser,
  useDeleteUser,
  useUpdateUserRole,
} from '#/hook'

export const UsersManagement = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: usersData, isLoading } = useAdminUsers({
    search,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const banMutation = useBanUser()
  const deleteMutation = useDeleteUser()
  const roleMutation = useUpdateUserRole()

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted z-10"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 h-11 bg-dash-bg-soft border-none rounded-xl text-sm text-dash-text placeholder:text-dash-text-muted focus-visible:ring-2 focus-visible:ring-dash-brand/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px] h-11 bg-dash-bg-soft border-none rounded-xl text-sm font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superAdmin">Super Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-11 bg-dash-bg-soft border-none rounded-xl text-sm font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-center">
                  Joined Date
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={5}
                      className="px-6 py-8 h-16 bg-gray-50/20"
                    ></td>
                  </tr>
                ))
              ) : usersData?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-dash-text-muted text-sm"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                usersData?.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dash-brand-light flex items-center justify-center text-dash-brand font-bold uppercase relative">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user.name?.[0] || user.email[0]
                          )}
                          {user.banned && (
                            <div className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full">
                              <AlertCircle
                                className="text-dash-error"
                                size={14}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-dash-text group-hover:text-dash-brand transition-colors">
                            {user.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-dash-text-muted">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={user.role}
                        onValueChange={(role) =>
                          roleMutation.mutate({ id: user.id, role })
                        }
                      >
                        <SelectTrigger className="h-8 w-32 bg-gray-50 border-none text-xs font-bold text-dash-text-soft">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superAdmin">
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant={user.banned ? 'destructive' : 'outline'}
                        className={cn(
                          'text-[10px] font-bold uppercase',
                          !user.banned
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : '',
                        )}
                      >
                        {user.banned ? 'Banned' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-dash-text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.banned ? 'Unban User' : 'Ban User'}
                          onClick={() =>
                            banMutation.mutate({
                              id: user.id,
                              banned: !user.banned,
                            })
                          }
                          className={cn(
                            'h-9 w-9 rounded-xl transition-colors',
                            user.banned
                              ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50',
                          )}
                        >
                          {user.banned ? (
                            <UserCheck size={18} />
                          ) : (
                            <UserX size={18} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete User"
                          onClick={() => {
                            if (
                              confirm(
                                'Are you sure you want to delete this user?',
                              )
                            ) {
                              deleteMutation.mutate(user.id)
                            }
                          }}
                          className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
