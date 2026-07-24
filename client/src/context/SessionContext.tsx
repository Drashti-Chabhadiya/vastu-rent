import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '#/lib/auth/auth-client'
import { queryClient } from '#/lib/query-client'

export const SESSION_QUERY_KEY = ['auth-session']

interface SessionData {
  user: any
  session: any
}

interface SessionContextType {
  data: SessionData | null
  isPending: boolean
}

const SessionContext = createContext<SessionContextType>({
  data: null,
  isPending: true,
})

export function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, isPending } = useQuery<SessionData | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const res = await authClient.getSession()
      return (res.data as any) || null
    },
    staleTime: 30_000,
  })

  return (
    <SessionContext.Provider value={{ data: data ?? null, isPending }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  return useContext(SessionContext)
}

export function getCachedSession(): SessionData | null {
  return queryClient.getQueryData(SESSION_QUERY_KEY) ?? null
}

export function setCachedSession(session: SessionData | null) {
  queryClient.setQueryData(SESSION_QUERY_KEY, session)
}
