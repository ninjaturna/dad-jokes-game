import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import SignIn from '../../pages/host/SignIn'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-bg-page" />
  if (!user) return <SignIn />
  return <>{children}</>
}
