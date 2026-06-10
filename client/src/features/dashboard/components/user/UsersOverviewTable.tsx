import { ExploreLink } from '#/components/common/ExploreLink'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

interface UsersOverviewTableProps {
  users?: any[]
  isLoading: boolean
  onViewAll?: () => void
}

export const UsersOverviewTable = ({
  users = [],
  isLoading,
  onViewAll,
}: UsersOverviewTableProps) => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border/30 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Users</h3>
        <ExploreLink onClick={onViewAll}>View All</ExploreLink>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/30 hover:bg-transparent">
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase pr-2 h-auto">
                Name
              </TableHead>
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase pr-2 h-auto">
                Email
              </TableHead>
              <TableHead className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-right pl-2 h-auto">
                Role
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.slice(0, 5).map((user) => (
                <TableRow
                  key={user.id}
                  className="group border-b-0 hover:bg-muted-light/30"
                >
                  <TableCell className="py-4 pr-2 max-w-[110px] truncate">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-dash-brand-light flex items-center justify-center text-[10px] font-bold text-dash-brand uppercase overflow-hidden shrink-0">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || 'avatar'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name?.[0] || user.email[0]
                        )}
                      </div>
                      <span className="text-xs font-bold text-dash-text-soft truncate">
                        {user.name || 'Anonymous'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-xs text-dash-text-muted pr-2 max-w-[130px] truncate">
                    {user.email}
                  </TableCell>
                  <TableCell className="py-4 text-right pl-2">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-muted-light text-dash-text-soft uppercase">
                      {user.role}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
