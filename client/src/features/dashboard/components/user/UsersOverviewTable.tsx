import { Button } from '#/components/ui/button'

interface UsersOverviewTableProps {
  users?: any[]
  isLoading: boolean
}

export const UsersOverviewTable = ({
  users = [],
  isLoading,
}: UsersOverviewTableProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Recent Users</h3>
        <Button
          variant="link"
          className="text-xs font-bold text-dash-brand hover:underline p-0 h-auto cursor-pointer active:scale-95 transition-all"
        >
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50">
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase">
                Name
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase">
                Email
              </th>
              <th className="pb-4 text-[11px] font-bold text-dash-text-muted uppercase text-right">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-xs text-dash-text-muted"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="group">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-dash-brand-light flex items-center justify-center text-[10px] font-bold text-dash-brand uppercase">
                        {user.name?.[0] || user.email[0]}
                      </div>
                      <span className="text-xs font-bold text-dash-text-soft">
                        {user.name || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-xs text-dash-text-muted">
                    {user.email}
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-50 text-dash-text-soft uppercase">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
