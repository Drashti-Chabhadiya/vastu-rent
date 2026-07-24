import { useState } from 'react'
import { Search, UserX, UserCheck, Trash2, AlertCircle } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
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
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { UserAvatar } from '#/components/common/UserAvatar'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { useTranslation } from '#/context/TranslationContext'

export const UsersManagement = () => {
  const { t, formatDate } = useTranslation()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const { data: usersData, isLoading } = useAdminUsers({
    search,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const banMutation = useBanUser()
  const deleteMutation = useDeleteUser()
  const roleMutation = useUpdateUserRole()

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header & Filters */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/30 shadow-sm"
      >
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted z-10"
            size={18}
          />
          <Input
            type="text"
            placeholder={t('Search users by name or email...')}
            className="pl-10 h-11 bg-dash-bg-soft border-none rounded-xl text-sm text-dash-text placeholder:text-dash-text-muted focus-visible:ring-2 focus-visible:ring-dash-brand/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px] h-11 bg-dash-bg-soft hover:bg-dash-bg-soft/80 border-none rounded-xl text-sm font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20 transition-all">
              <SelectValue placeholder={t('All Roles')} />
            </SelectTrigger>
            <SelectContent className="bg-card rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
              <SelectItem
                value="all"
                className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                {t('All Roles')}
              </SelectItem>
              <SelectItem
                value="user"
                className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                {t('User')}
              </SelectItem>
              <SelectItem
                value="admin"
                className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                {t('Admin')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-11 bg-dash-bg-soft hover:bg-dash-bg-soft/80 border-none rounded-xl text-sm font-bold text-dash-text focus:ring-2 focus:ring-dash-brand/20 transition-all">
              <SelectValue placeholder={t('All Status')} />
            </SelectTrigger>
            <SelectContent className="bg-card rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
              <SelectItem
                value="all"
                className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                {t('All Status')}
              </SelectItem>
              <SelectItem
                value="active"
                className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                {t('Active')}
              </SelectItem>
              <SelectItem
                value="banned"
                className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
              >
                {t('Banned')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        variants={fadeUp}
        className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-left bg-muted-light/50 border-b border-border/30">
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  {t('User')}
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">
                  {t('Role')}
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-center">
                  {t('Status')}
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-center">
                  {t('Joined Date')}
                </TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold text-dash-text-muted uppercase tracking-wider text-right">
                  {t('Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell
                      colSpan={5}
                      className="px-6 py-8 h-16 bg-muted-light/20"
                    ></TableCell>
                  </TableRow>
                ))
              ) : usersData?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-12 text-center text-dash-text-muted text-sm"
                  >
                    {t('No users found matching your criteria.')}
                  </TableCell>
                </TableRow>
              ) : (
                usersData?.map((user: any) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted-light/50 transition-colors group"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <UserAvatar
                            image={user.image}
                            name={user.name || user.email}
                            isOnline={user.isOnline}
                            size="sidebar"
                            avatarClassName="bg-dash-brand-light text-dash-brand"
                            showPing={true}
                          />
                          {user.banned && (
                            <div className="absolute -top-1 -right-1 p-0.5 bg-card rounded-full">
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
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Select
                        value={user.role}
                        onValueChange={(role) =>
                          roleMutation.mutate({ id: user.id, role })
                        }
                      >
                        <SelectTrigger className="h-8 w-32 bg-muted-light hover:bg-muted/50/80 border-none text-xs font-bold text-dash-text-soft transition-all rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card rounded-xl shadow-2xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
                          <SelectItem
                            value="user"
                            className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                          >
                            {t('User')}
                          </SelectItem>
                          <SelectItem
                            value="admin"
                            className="text-xs font-bold text-dash-text-soft rounded-lg focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                          >
                            {t('Admin')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <Badge
                        variant={user.banned ? 'destructive' : 'outline'}
                        className={cn(
                          'text-[10px] font-bold uppercase',
                          !user.banned
                            ? 'bg-primary-soft text-primary border-primary-border'
                            : '',
                        )}
                      >
                        {user.banned ? t('Banned') : t('Active')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center text-xs text-dash-text-muted">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.banned ? t('Unban User') : t('Ban User')}
                          onClick={() =>
                            banMutation.mutate({
                              id: user.id,
                              banned: !user.banned,
                            })
                          }
                          className={cn(
                            'h-9 w-9 rounded-xl transition-colors',
                            user.banned
                              ? 'text-primary hover:text-primary-hover hover:bg-primary-soft'
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
                          title={t('Delete User')}
                          onClick={() => {
                            setUserToDelete(user.id)
                          }}
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-danger rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <ReusableAlertDialog
        isOpen={userToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null)
        }}
        onConfirm={() => {
          if (userToDelete) {
            deleteMutation.mutate(userToDelete)
            setUserToDelete(null)
          }
        }}
        title={t('Delete User Account')}
        description={t(
          'Are you sure you want to permanently delete this user account? This action is irreversible and will remove all profile records.',
        )}
        confirmText={t('Delete')}
        variant="danger"
      />
    </motion.div>
  )
}
