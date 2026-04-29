import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Home() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/login')
  }
  
  const isAdmin = (session.user as { role?: string })?.role === 'ADMIN'
  redirect(isAdmin ? '/admin' : '/staff')
}
