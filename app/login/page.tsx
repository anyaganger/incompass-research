import { redirect } from 'next/navigation'

// Legacy login page — Clerk now handles auth at /sign-in
export default function LoginPage() {
  redirect('/sign-in')
}
