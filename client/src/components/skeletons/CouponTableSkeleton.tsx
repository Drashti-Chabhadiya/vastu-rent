import { Skeleton } from '#/components/ui/skeleton'
import {
    TableCell,
    TableRow,
} from '#/components/ui/table'


export function CouponTableSkeleton({ canManage }: { canManage?: boolean }) {
    return (
        Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="animate-pulse">
                <TableCell className="px-4 py-5">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </TableCell>
                <TableCell className="px-4 py-5">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-3 w-12 rounded mt-1.5" />
                </TableCell>
                <TableCell className="px-4 py-5">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-3 w-16 rounded mt-1.5" />
                </TableCell>
                <TableCell className="px-4 py-5">
                    <Skeleton className="h-4 w-12 rounded" />
                </TableCell>
                <TableCell className="px-4 py-5">
                    <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell className="px-4 py-5">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-2 w-12 rounded mt-1.5" />
                </TableCell>
                {canManage && (
                    <TableCell className="px-4 py-5">
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                )}
                {canManage && (
                    <TableCell className="px-4 py-5 text-right">
                        <Skeleton className="h-8 w-8 rounded-xl ml-auto" />
                    </TableCell>
                )}
            </TableRow>
        ))
    )
}